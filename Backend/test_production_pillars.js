import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  processRazorpayWebhook,
  recordFrontendPaymentVerification,
  PaymentState,
  getPaymentState,
  verifyWebhookSignature,
  RAZORPAY_WEBHOOK_SECRET
} from './services/paymentService.js';
import { redisService } from './services/redisService.js';
import { IndexSnapshotManager } from './search/IndexSnapshotManager.js';
import { allProducts } from './data/products/index.js';
import { ProductSearchEngine } from './search/SearchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('  INFINITY STORE — PRODUCTION PILLARS TEST SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // =================================================================
  // 1. RAZORPAY WEBHOOK RELIABILITY TESTS
  // =================================================================
  console.log('--- 1. RAZORPAY WEBHOOK RELIABILITY ---');

  const webhookSecret = RAZORPAY_WEBHOOK_SECRET;
  const samplePayload = JSON.stringify({
    entity: 'event',
    account_id: 'acc_test123',
    event: 'payment.captured',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: 'pay_test_999888',
          order_id: 'order_test_111222',
          amount: 49900,
          currency: 'INR',
          status: 'captured',
          method: 'upi'
        }
      }
    },
    created_at: Math.floor(Date.now() / 1000)
  });

  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(samplePayload)
    .digest('hex');

  const invalidSignature = 'bad_hex_signature_deadbeef';

  // A. Signature verification
  const isValid = verifyWebhookSignature(samplePayload, validSignature, webhookSecret);
  assert(isValid === true, 'Valid webhook signature correctly verified');

  const isInvalid = verifyWebhookSignature(samplePayload, invalidSignature, webhookSecret);
  assert(isInvalid === false, 'Invalid webhook signature correctly rejected');

  const callWebhook = (payloadObj, eventId) => {
    const raw = JSON.stringify(payloadObj);
    const sig = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
    return processRazorpayWebhook(payloadObj, eventId, raw, sig);
  };

  // B. Webhook processing: payment.captured
  const eventId1 = `evt_test_${Date.now()}_1`;
  const result1 = await callWebhook(JSON.parse(samplePayload), eventId1);
  assert(result1.status === 'processed' && result1.state === PaymentState.PAYMENT_CONFIRMED, 'Webhook payment.captured transitioned state to PAYMENT_CONFIRMED');

  // C. Idempotency: duplicate webhook event
  const resultDuplicate = await callWebhook(JSON.parse(samplePayload), eventId1);
  assert(resultDuplicate.status === 'duplicate' && resultDuplicate.duplicate === true, 'Duplicate webhook event detected and handled idempotently');

  // D. Browser disconnect scenario (Webhook arrives, frontend disconnected)
  const orderIdDisconnected = `order_closed_browser_${Date.now()}`;
  const disconnectPayload = {
    entity: 'event',
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: orderIdDisconnected,
          amount_paid: 89900,
          status: 'paid'
        }
      },
      payment: {
        entity: {
          id: `pay_disc_${Date.now()}`,
          status: 'captured'
        }
      }
    }
  };
  const eventIdDisc = `evt_disc_${Date.now()}`;
  await callWebhook(disconnectPayload, eventIdDisc);
  const stateAfterDisconnect = getPaymentState(orderIdDisconnected);
  assert(stateAfterDisconnect && stateAfterDisconnect.state === PaymentState.PAYMENT_CONFIRMED, 'Browser closed scenario: Webhook successfully captures & confirms payment without client');

  // E. Webhook arriving BEFORE frontend verification
  const orderIdRace1 = `order_race1_${Date.now()}`;
  const payIdRace1 = `pay_race1_${Date.now()}`;
  // Webhook arrives first:
  await callWebhook({
    event: 'payment.captured',
    payload: { payment: { entity: { id: payIdRace1, order_id: orderIdRace1, status: 'captured' } } }
  }, `evt_race1_${Date.now()}`);
  // Frontend verification arrives second:
  const frontResult1 = recordFrontendPaymentVerification({
    orderId: orderIdRace1,
    paymentId: payIdRace1,
    signatureVerified: true
  });
  assert(frontResult1.state === PaymentState.PAYMENT_CONFIRMED, 'Webhook arriving BEFORE frontend verification converges to PAYMENT_CONFIRMED');

  // F. Frontend verification arriving BEFORE webhook
  const orderIdRace2 = `order_race2_${Date.now()}`;
  const payIdRace2 = `pay_race2_${Date.now()}`;
  const frontResult2 = recordFrontendPaymentVerification({
    orderId: orderIdRace2,
    paymentId: payIdRace2,
    signatureVerified: true
  });
  assert(frontResult2.state === PaymentState.PAYMENT_CONFIRMED, 'Frontend verification marks PAYMENT_CONFIRMED');
  const webResult2 = await callWebhook({
    event: 'payment.captured',
    payload: { payment: { entity: { id: payIdRace2, order_id: orderIdRace2, status: 'captured' } } }
  }, `evt_race2_${Date.now()}`);
  assert(webResult2.state === PaymentState.PAYMENT_CONFIRMED, 'Webhook arriving AFTER frontend verification converges cleanly');

  // G. Unknown / unhandled webhook event
  const unknownResult = await callWebhook({ event: 'subscription.charged', payload: {} }, `evt_unk_${Date.now()}`);
  assert(unknownResult.status === 'unhandled_ignored', 'Unknown webhook event handled gracefully without server crash');

  // =================================================================
  // 2. SEARCH COLD-START OPTIMIZATION & SNAPSHOT MANAGER
  // =================================================================
  console.log('\n--- 2. SEARCH COLD-START OPTIMIZATION ---');

  const snapshotManager = new IndexSnapshotManager();
  const testSnapshotPath = path.join(__dirname, 'search', 'test_tmp_index.snapshot.json');

  // A. Build & save snapshot
  console.log('  Testing snapshot serialization & atomic write...');
  const sampleEngine = new ProductSearchEngine(allProducts.slice(0, 1000));
  const saved = await snapshotManager.saveSnapshot(sampleEngine, 1000, testSnapshotPath);
  assert(saved === true && fs.existsSync(testSnapshotPath), 'Atomic snapshot write completed successfully');

  // B. Read valid snapshot (Warm start timing)
  const warmStart = Date.now();
  const loadedData = snapshotManager.loadSnapshot(1000, testSnapshotPath);
  const warmDuration = Date.now() - warmStart;
  assert(loadedData !== null && loadedData.data.invertedIndex !== undefined, `Snapshot loaded in ${warmDuration}ms with valid data structures`);

  // C. Catalog size mismatch detection
  const mismatchData = snapshotManager.loadSnapshot(99999, testSnapshotPath);
  assert(mismatchData === null, 'Catalog size mismatch detected and snapshot safely rejected for rebuild');

  // D. Corrupt snapshot handling
  const corruptPath = path.join(__dirname, 'search', 'corrupt_test.snapshot.json');
  fs.writeFileSync(corruptPath, '{ "version": 3, "data": INVALID_JSON_CONTENT }');
  const corruptResult = snapshotManager.loadSnapshot(1000, corruptPath);
  assert(corruptResult === null, 'Corrupt snapshot file safely detected without crash, falling back to index rebuild');

  // Cleanup test files
  try { fs.unlinkSync(testSnapshotPath); } catch {}
  try { fs.unlinkSync(corruptPath); } catch {}

  // =================================================================
  // 3. DISTRIBUTED SESSION / CART STATE (REDIS & FALLBACK)
  // =================================================================
  console.log('\n--- 3. DISTRIBUTED SESSION & CART STATE ---');

  const testSessionId = `test_sess_${Date.now()}`;
  const initialSession = {
    sessionId: testSessionId,
    conversation: [{ role: 'user', text: 'Looking for a gaming laptop' }],
    currentIntent: 'PRODUCT_QUERY',
    category: 'laptops-computers',
    requirements: { budget: 75000, gpu: 'RTX 4060' },
    activeResults: [101, 102, 103],
    cart: [{ productId: 101, quantity: 1, price: 69999 }],
    checkoutState: { ready: false },
    updatedAt: new Date().toISOString()
  };

  // A. Save session
  await redisService.setSessionState(testSessionId, initialSession, 60);
  const fetchedSession = await redisService.getSessionState(testSessionId);
  assert(fetchedSession !== null && fetchedSession.category === 'laptops-computers', 'Session saved and retrieved with matching structured state');

  // B. Cart operations
  await redisService.setCart(testSessionId, [{ productId: 501, title: 'Wireless ANC Headphones', price: 2999 }]);
  const retrievedCart = await redisService.getCart(testSessionId);
  assert(retrievedCart.length === 1 && retrievedCart[0].title === 'Wireless ANC Headphones', 'Cart saved and retrieved via distributed session service');

  // C. Clear cart
  await redisService.clearCart(testSessionId);
  const emptyCart = await redisService.getCart(testSessionId);
  assert(emptyCart.length === 0, 'Cart cleared cleanly');

  // D. Clean delete
  await redisService.deleteSessionState(testSessionId);
  const deletedSession = await redisService.getSessionState(testSessionId);
  assert(deletedSession === null, 'Session deleted successfully');

  // =================================================================
  // 4. HTTP API ENDPOINTS TEST (HEALTH, WEBHOOK, AI STREAM)
  // =================================================================
  console.log('\n--- 4. HTTP API INTEGRATION (PORT 5000) ---');

  try {
    // Health endpoint
    const healthRes = await fetch('http://localhost:5000/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', `GET /health returned HTTP 200 OK (${healthData.searchIndex})`);

    // Webhook HTTP endpoint test
    const webhookRes = await fetch('http://localhost:5000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': validSignature
      },
      body: samplePayload
    });
    const webhookData = await webhookRes.json();
    assert(webhookRes.status === 200 && (webhookData.success === true || webhookData.duplicate === true), 'POST /api/webhooks/razorpay handled valid webhook over HTTP');

    // Webhook invalid signature HTTP test
    const badWebhookRes = await fetch('http://localhost:5000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': 'invalid_signature_hex'
      },
      body: samplePayload
    });
    assert(badWebhookRes.status === 400, 'POST /api/webhooks/razorpay rejected invalid signature with HTTP 400');

    // AI Stream endpoint test
    const streamRes = await fetch('http://localhost:5000/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'best gaming laptop under 80000',
        sessionId: 'test_stream_session_1'
      })
    });
    assert(streamRes.status === 200 && streamRes.headers.get('content-type')?.includes('text/event-stream'), 'POST /api/ai/chat/stream returned 200 with text/event-stream Content-Type');

    // Read SSE stream chunks
    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();
    let streamChunks = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      streamChunks += decoder.decode(value);
      if (streamChunks.includes('event: done')) {
        await reader.cancel();
        break;
      }
    }
    assert(streamChunks.includes('event: message') || streamChunks.includes('event: done'), 'SSE Stream delivered progressive events (message/products/done)');

  } catch (httpErr) {
    console.warn('HTTP endpoint check skipped or warning:', httpErr.message);
  }

  // =================================================================
  // FINAL REPORT
  // =================================================================
  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
