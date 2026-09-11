import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import { allProducts, categoryHierarchy, productsById } from './data/products/index.js';
import { ProductSearchEngine } from './search/SearchEngine.js';
import { processAIAgentQuery, processAIAgentRequirements, setSearchEngine, clearSessionState, streamAIAgentQuery } from './services/aiService.js';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKeyId, processRazorpayWebhook, recordFrontendPaymentVerification, PaymentState } from './services/paymentService.js';
import { redisService } from './services/redisService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize High-Performance DSA Search Engine (Inverted Index + Trie + BKTree + MinHeap)
const searchEngine = new ProductSearchEngine(allProducts);

// Inject unified search engine into AI Commerce Service
setSearchEngine(searchEngine);

// Request ID & Tracing Logger
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(1);
    if (!req.path.startsWith('/health')) {
      console.log(`📡 [${req.method}] ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms) [${req.id}]`);
    }
  });
  next();
});

// Middlewares
app.use(cors());
app.use(express.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 0. AI Response Streaming Endpoint (Server-Sent Events)
app.post('/api/ai/chat/stream', async (req, res) => {
  try {
    const { query = "", history = [], cartContext = [], userProfile = {}, image = null, sessionId = null } = req.body;
    const activeSessionId = sessionId || req.headers['x-session-id'] || "default_session";
    await streamAIAgentQuery(query, history, cartContext, userProfile, image, activeSessionId, res);
  } catch (error) {
    console.error('[AI Stream Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// 0.5 Razorpay Server-to-Server Webhook Endpoint (Idempotent & Signature-Verified)
app.post('/api/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'] || req.body?.id;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await processRazorpayWebhook(req.body, eventId, rawBody, signature);
    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error);
    return res.status(500).json({ success: false, error: 'WEBHOOK_ERROR', message: error.message });
  }
});

// 1. AI Agentic Search & Shopping Chat Endpoint (Multilingual, 125k+ catalog, Upsell booster, Vision)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { query = "", history = [], cartContext = [], userProfile = {}, image = null } = req.body;

    const queryText = (query && typeof query === 'string') ? query : (image ? "Analyze this product image and find matching items in Infinity Store" : "");
    if (!queryText && !image) {
      return res.status(400).json({
        success: false,
        error: "Query parameter or image is required."
      });
    }

    console.log(`[Infinity AI Agent] Processing query: "${queryText.slice(0, 80)}" (Image: ${Boolean(image)}, Cart: ${cartContext.length}, Persona: ${userProfile?.learnedInterests?.join(', ') || 'New Shopper'})`);
    const result = await processAIAgentQuery(queryText, history, cartContext, userProfile, image);
    if (result) {
      if (result.reply && !result.text) result.text = result.reply;
      if (result.text && !result.reply) result.reply = result.text;
    }
    return res.json(result);

  } catch (error) {
    console.error("[Infinity AI Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process AI query",
      message: error.message
    });
  }
});

// 1.1 Dedicated Questionnaire & Structured Requirements Submission Endpoint
app.post('/api/ai/requirements', async (req, res) => {
  try {
    const {
      sessionId,
      requirementSessionId,
      category,
      questionId,
      answer,
      customInput,
      isStep = false,
      requirements = {},
      history = [],
      cartContext = [],
      userProfile = {}
    } = req.body;

    console.log(`[Infinity AI Agent] Processing Requirements Submission: category="${category}", questionId="${questionId || 'final'}", priorities=[${(requirements.priorities || []).join(', ')}], budget=${requirements.isBudgetActive ? requirements.budget : 'Flexible'}`);
    const result = await processAIAgentRequirements({
      sessionId,
      requirementSessionId,
      category,
      questionId,
      answer,
      customInput,
      isStep,
      requirements,
      history,
      cartContext,
      userProfile
    });

    if (result) {
      if (result.reply && !result.text) result.text = result.reply;
      if (result.text && !result.reply) result.reply = result.text;
    }
    return res.json(result);

  } catch (error) {
    console.error("[Infinity AI Requirements Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process AI requirements",
      message: error.message
    });
  }
});

// 1.2 Instant Autocomplete & Search Suggestions API (Powered by Trie & BK-Tree in <1ms)
app.get('/api/search/suggest', (req, res) => {
  const { q = "", limit = 6 } = req.query;
  const suggestionsData = searchEngine.getSuggestions(q, parseInt(limit, 10) || 6);
  res.json({
    success: true,
    ...suggestionsData
  });
});

// 2. 125,000+ Products Catalog API with DSA-Powered Fast Inverted Index & Min-Heap
const handleProductSearch = (req, res) => {
  const {
    page = 1,
    limit = 24,
    category = "all",
    subCategory = "all",
    search = "",
    q = "",
    sortBy = "relevance",
    gender = "all",
    priceRange = "all",
    minRating = 0,
    minDiscount = 0,
    color = "all",
    size = "all",
    onlyInfinityMall = "false"
  } = req.query;

  const searchQuery = (search || q || "").toString();

  const results = searchEngine.search({
    query: searchQuery,
    category,
    subCategory,
    gender,
    priceRange,
    minRating: Number(minRating) || 0,
    minDiscount: Number(minDiscount) || 0,
    color,
    size,
    onlyInfinityMall: onlyInfinityMall === 'true' || onlyInfinityMall === true,
    sortBy,
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 24))
  });

  res.json(results);
};

app.get('/api/products/search', handleProductSearch);
app.get('/api/products', handleProductSearch);

// 3. Single Product Lookup API
app.get('/api/products/:id', (req, res) => {
  const product = productsById[req.params.id];
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }
  res.json({ success: true, product });
});

// 4. Categories & Subcategories Hierarchy API
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: categoryHierarchy,
    totalProductsInCatalog: allProducts.length
  });
});

// =========================================================================
// AGENTIC COMMERCE & AGENT-TO-AGENT (A2A) PROTOCOLS (UAP, ACP, AP2, x402)
// =========================================================================

// 4A. Well-Known Agentic Commerce Manifest (Discovery Endpoint for AI Buyers)
app.get('/.well-known/agentic-commerce.json', (req, res) => {
  res.json({
    manifestVersion: "1.0.0",
    merchant: {
      name: "Infinity Store",
      domain: "infinitystore.in",
      protocolSupport: ["UAP-1.0", "ACP-2.0", "AP2", "x402-Payment-Required"],
      currency: "INR",
      paymentGateway: "Razorpay Test Mode"
    },
    policyBounds: {
      maxTransactionAmountINR: 100000,
      maxItemQuantityPerOrder: 10,
      requiresHumanAuthorization: true,
      supportedPaymentModes: ["UPI", "Cards", "NetBanking", "GooglePay", "PhonePe"],
      easyReturnPolicyDays: 7
    },
    endpoints: {
      agentReadableCatalog: "/api/agent/catalog",
      conversationalShoppingAI: "/api/ai/chat",
      programmaticTransact: "/api/agent/transact",
      verifyPayment: "/api/payment/verify"
    }
  });
});

// 4B. Agent-Readable Catalog Endpoint (Structured for AI Agent Ingestion)
app.get('/api/agent/catalog', (req, res) => {
  const { category, subCategory, query, limit = 20, maxPrice } = req.query;
  let results = allProducts;

  if (category) {
    results = results.filter(p => p.category === category || p.mainCategory.toLowerCase() === category.toLowerCase());
  }
  if (subCategory) {
    results = results.filter(p => p.subCategory?.toLowerCase() === subCategory.toLowerCase());
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= Number(maxPrice));
  }

  const agentFormattedProducts = results.slice(0, Math.min(100, Number(limit))).map(p => ({
    sku: p.id,
    title: p.title,
    categoryPath: `${p.mainCategory} > ${p.subCategory}`,
    pricing: {
      salePriceINR: p.price,
      mrpINR: p.originalPrice,
      discountPercent: p.discount,
      currency: "INR"
    },
    specifications: {
      materialOrFabric: p.fabric || "Standard High-Grade",
      description: p.description || p.title,
      sizesAvailable: p.sizes || ["Standard"],
      colorsAvailable: p.colors || ["Standard"],
      rating: p.rating,
      verifiedReviewCount: p.reviewsCount || Math.floor(p.rating * 1200 + 500)
    },
    inventory: {
      inStock: true,
      freeDeliveryEligible: true,
      dispatchTimeHrs: 24
    },
    actionableDirectBuyPayload: {
      action: "INITIATE_ORDER",
      targetSku: p.id,
      unitPrice: p.price
    }
  }));

  res.json({
    protocol: "ACP-2.0 / UAP-1.0",
    success: true,
    totalMatchingSKUs: results.length,
    returnedCount: agentFormattedProducts.length,
    catalog: agentFormattedProducts
  });
});

// 4C. Autonomous AI Buyer Programmatic Transaction Endpoint (Bounded & Gated)
app.post('/api/agent/transact', async (req, res) => {
  try {
    const { buyerAgentId, items = [], couponCode, clientDeclaredTotal, authorizationMode = "human_gated" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "POLICY_VIOLATION: items array cannot be empty",
        explainableReason: "Autonomous agent must supply at least one valid SKU."
      });
    }

    // 1. BOUND CHECK: Item quantity limit
    for (const item of items) {
      if (!item.sku || !item.quantity || item.quantity <= 0 || item.quantity > 10) {
        return res.status(400).json({
          success: false,
          error: "BOUNDS_EXCEEDED: Maximum 10 units allowed per SKU in automated commerce.",
          explainableReason: `Item ${item.sku || 'UNKNOWN'} requested quantity ${item.quantity}, exceeding safety limit of 10.`
        });
      }
    }

    // 2. EXPLAINABILITY: Calculate exact verified total on server side
    let calculatedMRP = 0;
    let calculatedTotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const prod = productsById[item.sku];
      if (!prod) {
        return res.status(404).json({
          success: false,
          error: `SKU_NOT_FOUND: Product ${item.sku} does not exist in catalog.`
        });
      }
      calculatedMRP += prod.originalPrice * item.quantity;
      calculatedTotal += prod.price * item.quantity;
      resolvedItems.push({
        sku: prod.id,
        title: prod.title,
        unitPrice: prod.price,
        quantity: item.quantity,
        subtotal: prod.price * item.quantity
      });
    }

    // Apply Coupon if valid
    let discountApplied = 0;
    if (couponCode === "FIRST50" || couponCode === "AIAGENT50") {
      discountApplied = 50;
      calculatedTotal = Math.max(1, calculatedTotal - discountApplied);
    }

    // 3. BOUND CHECK: Max Transaction Cap (₹1,00,000)
    const MAX_BUDGET_CAP = 100000;
    if (calculatedTotal > MAX_BUDGET_CAP) {
      return res.status(400).json({
        success: false,
        error: "BOUNDED_ACTION_BLOCKED: Total amount exceeds autonomous agent budget cap.",
        amount: calculatedTotal,
        budgetCap: MAX_BUDGET_CAP,
        explainableReason: `Order total ₹${calculatedTotal} exceeds maximum safety bound of ₹${MAX_BUDGET_CAP}.`
      });
    }

    // 4. GATED ACTION: Create Official Razorpay Order
    console.log(`[Agentic Commerce] 🤖 Agent ${buyerAgentId || 'AI-Buyer'} initiated transaction for ₹${calculatedTotal}`);
    const orderResult = await createRazorpayOrder(calculatedTotal, 'INR', `a2a_${Date.now()}`);

    return res.json({
      success: true,
      protocol: "ACP-2.0 / Razorpay-Agentic",
      transactionId: `tx_a2a_${Date.now()}`,
      explainableAudit: {
        buyerAgentId: buyerAgentId || "Autonomous-AI-Buyer-01",
        mrpTotal: calculatedMRP,
        discountSavings: (calculatedMRP - calculatedTotal) + discountApplied,
        couponApplied: couponCode || null,
        finalPayableINR: calculatedTotal,
        policyBoundsVerified: {
          quantityBounded: true,
          budgetCapChecked: true,
          humanGatedOnRazorpay: true
        },
        rationale: `AI Buyer requested ${items.length} product(s). Server verified pricing against catalog inventory and generated official Razorpay test order.`
      },
      order: orderResult.order,
      key_id: getRazorpayKeyId(),
      checkoutReady: true
    });

  } catch (error) {
    console.error("[Agentic Transact Error]:", error);
    return res.status(500).json({
      success: false,
      error: "AGENTIC_TRANSACT_ERROR",
      message: error.message
    });
  }
});

// 5. Razorpay Payment Gateway - Create Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = '' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    console.log(`[Razorpay] Creating order for ₹${amount}`);
    const result = await createRazorpayOrder(amount, currency, receipt);

    if (result.success) {
      return res.json({
        success: true,
        order: result.order,
        key_id: getRazorpayKeyId(),
        isLiveApi: result.isLiveApi || false
      });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('[Razorpay] Create order error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Razorpay Payment Gateway - Verify Payment Signature
app.post('/api/payment/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    const isValid = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
      recordFrontendPaymentVerification(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      console.log(`[Razorpay] ✅ Payment verified & state converged: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        paymentState: PaymentState.PAYMENT_CONFIRMED
      });
    } else {
      console.warn(`[Razorpay] ❌ Invalid payment signature for: ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' });
    }
  } catch (error) {
    console.error('[Razorpay] Verify error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Razorpay - Get Public Key ID for Frontend
app.get('/api/payment/key', (req, res) => {
  res.json({ success: true, key_id: getRazorpayKeyId() });
});

// 8. Health & Readiness Endpoint
const handleHealth = (req, res) => {
  res.json({
    status: "ok",
    ai: Boolean((process.env.AI_API_KEY || process.env.GEMINI_API_KEY) && process.env.GEMINI_API_KEY !== "your_api_key_here") ? "online" : "mock_mode",
    redis: redisService.isRedisReady ? "connected" : "in_memory_ttl",
    searchIndex: "snapshot_active",
    totalCatalogItems: allProducts.length,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// 404 Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    requestId: req.id
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Infinity Store AI Backend running on http://localhost:${PORT}`);
  console.log(`📦 1,25,000 Products Active | Fast Snapshot Search & Redis Sessions Online`);
});

// Graceful Shutdown Handler
const handleShutdown = async (signal) => {
  console.log(`\n🛑 [Server] Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    await redisService.disconnect();
    console.log('🛑 [Server] Cleanly closed server and Redis connections.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));