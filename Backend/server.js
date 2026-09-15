import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';

// Legacy AI/Search/Payment imports
import { ProductSearchEngine } from './search/SearchEngine.js';
import { processAIAgentQuery, processAIAgentRequirements, streamAIAgentQuery, setSearchEngine } from './services/aiService.js';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKeyId, processRazorpayWebhook, recordFrontendPaymentVerification, PaymentState } from './services/paymentService.js';
import { searchProducts } from './services/productSearchService.js';
import { redisService } from './services/redisService.js';

import { Product } from './src/models/Product.js';
import { fullCategoryHierarchy } from './data/products/catalogHierarchy.js';
import { logger } from './src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Global Middlewares
app.use(helmet()); // Security Headers
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({
  limit: '20mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/auth', authLimiter);

// Initialize High-Performance DSA Search Engine (Inverted Index + Trie + BKTree + MinHeap)
// We will load products from MongoDB once the connection is established to support the existing AI agent.
let searchEngine;
mongoose.connection.once('open', async () => {
  try {
    const productsFromDb = await Product.find({ isActive: true }).lean();
    searchEngine = new ProductSearchEngine(productsFromDb);
    app.locals.searchEngine = searchEngine;
    setSearchEngine(searchEngine);
    logger.info('search.index.ready', { productCount: productsFromDb.length });
  } catch (error) {
    logger.error('search.index.failed', { error });
  }
});

// Request ID & Tracing Logger
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(1);
    if (!req.path.startsWith('/health')) {
      logger.info('http.request.completed', {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Number(duration)
      });
    }
  });
  next();
});

// ======================= API ROUTES =======================

// 0. NEW MONGODB ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', (await import('./src/routes/userRoutes.js')).default);

// 1. Categories & Subcategories Hierarchy API (Legacy/Memory fallback if needed, but keeping it simple for frontend)
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: fullCategoryHierarchy,
  });
});

// 2. Instant Autocomplete & Search Suggestions API (Powered by Trie & BK-Tree in <1ms)
app.get('/api/search/suggest', (req, res) => {
  if (!searchEngine) return res.json({ success: false, message: 'Search engine loading' });
  const { q = "", limit = 6 } = req.query;
  const suggestionsData = searchEngine.getSuggestions(q, parseInt(limit, 10) || 6);
  res.json({
    success: true,
    ...suggestionsData
  });
});

// ======================= LEGACY ROUTES (PRESERVED) =======================

// 0. AI Response Streaming Endpoint (Server-Sent Events)
app.post('/api/ai/chat/stream', async (req, res) => {
  try {
    const { query = "", history = [], cartContext = [], userProfile = {}, image = null, sessionId = null } = req.body;
    const activeSessionId = sessionId || req.headers['x-session-id'] || "default_session";
    await streamAIAgentQuery(query, history, cartContext, userProfile, image, activeSessionId, res);
  } catch (error) {
    logger.error('ai.stream.failed', { requestId: req.id, error });
    if (!res.headersSent) res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { query = "", history = [], cartContext = [], userProfile = {}, image = null } = req.body;

    const queryText = (query && typeof query === 'string') ? query : (image ? "Analyze this product image and find matching items in Infinity Store" : "");
    if (!queryText && !image) return res.status(400).json({ success: false, error: "Query parameter or image is required." });

    const result = await processAIAgentQuery(queryText, history, cartContext, userProfile, image);
    if (result) {
      if (result.reply && !result.text) result.text = result.reply;
      if (result.text && !result.reply) result.reply = result.text;
    }
    return res.json(result);
  } catch (error) {
    logger.error('ai.request.failed', { requestId: req.id, error });
    return res.status(500).json({ success: false, error: "Failed to process AI query", message: error.message });
  }
});

app.post('/api/ai/requirements', async (req, res) => {
  try {
    const result = await processAIAgentRequirements(req.body);
    if (result) {
      if (result.reply && !result.text) result.text = result.reply;
      if (result.text && !result.reply) result.reply = result.text;
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to process AI requirements", message: error.message });
  }
});

app.post('/api/products/recommendations', async (req, res) => {
  try {
    const { requirements, cursor } = req.body;
    if (!requirements) return res.status(400).json({ success: false, error: 'requirements required' });
    const searchRes = await searchProducts(requirements, cursor, 30);
    return res.json(searchRes);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Payment Gateways
app.post('/api/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'] || req.body?.id;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await processRazorpayWebhook(req.body, eventId, rawBody, signature);
    return res.status(result.statusCode || 200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'WEBHOOK_ERROR', message: error.message });
  }
});

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = '' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Valid amount is required' });

    const result = await createRazorpayOrder(amount, currency, receipt);
    if (result.success) {
      return res.json({ success: true, order: result.order, key_id: getRazorpayKeyId(), isLiveApi: result.isLiveApi || false });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, error: 'Missing payment verification fields' });

    const isValid = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (isValid) {
      recordFrontendPaymentVerification(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      return res.json({ success: true, message: 'Payment verified successfully', payment_id: razorpay_payment_id, order_id: razorpay_order_id, paymentState: PaymentState.PAYMENT_CONFIRMED });
    } else {
      return res.status(400).json({ success: false, error: 'Payment verification failed. Invalid signature.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/payment/key', (req, res) => res.json({ success: true, key_id: getRazorpayKeyId() }));

// 8. Health & Readiness Endpoint
const handleHealth = (req, res) => {
  res.json({
    status: "ok",
    ai: Boolean((process.env.AI_API_KEY || process.env.GEMINI_API_KEY) && process.env.GEMINI_API_KEY !== "your_api_key_here") ? "online" : "mock_mode",
    redis: redisService.isRedisReady ? "connected" : "in_memory_ttl",
    timestamp: new Date().toISOString()
  });
};

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// 404 Catch-All Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: "NOT_FOUND", message: `Endpoint ${req.method} ${req.originalUrl} not found`, requestId: req.id });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  logger.error('http.request.failed', { requestId: req.id, error: err, method: req.method, path: req.originalUrl || req.url });
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server';
  res.status(status).json({ success: false, message });
});

const server = app.listen(PORT, () => {
  logger.info('server.started', { port: PORT, environment: process.env.NODE_ENV || 'development' });
});

// Graceful Shutdown Handler
const handleShutdown = async (signal) => {
  logger.info('server.shutdown.started', { signal });
  server.close(async () => {
    await redisService.disconnect();
    import('mongoose').then(m => m.default.connection.close());
    logger.info('server.shutdown.completed', { signal });
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
// Trigger restart
// Cache invalidated at 1789388089423
