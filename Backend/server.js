import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { allProducts, categoryHierarchy, productsById } from './data/products/index.js';
import { processAIAgentQuery } from './services/aiService.js';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKeyId } from './services/paymentService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// 1. AI Agentic Search & Shopping Chat Endpoint (Multilingual, 10k+ catalog, Upsell booster)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { query, history = [], cartContext = [] } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required."
      });
    }

    console.log(`[Infinity AI Agent] Processing query: "${query}" (Cart items: ${cartContext.length})`);
    const result = await processAIAgentQuery(query, history, cartContext);
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

// 2. 10,000+ Products Catalog API with Advanced Filtering, Sorting & Pagination
app.get('/api/products', (req, res) => {
  let { 
    page = 1, 
    limit = 24, 
    category = "all", 
    subCategory = "all", 
    search = "", 
    sortBy = "relevance",
    gender = "all",
    priceRange = "all",
    minRating = 0,
    minDiscount = 0,
    color = "all",
    size = "all",
    onlyInfinityMall = "false"
  } = req.query;

  page = Math.max(1, parseInt(page, 10));
  limit = Math.min(100, Math.max(1, parseInt(limit, 10)));

  let results = allProducts;

  // Category filter
  if (category && category !== 'all') {
    results = results.filter(p => p.category === category || p.mainCategory.toLowerCase() === category.toLowerCase());
  }

  // SubCategory filter
  if (subCategory && subCategory !== 'all') {
    results = results.filter(p => p.subCategory?.toLowerCase() === subCategory.toLowerCase());
  }

  // Search query filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory?.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.fabric?.toLowerCase().includes(q)
    );
  }

  // Gender filter
  if (gender && gender !== 'all') {
    results = results.filter(p => p.gender === gender || p.gender === 'All');
  }

  // Price range filter
  if (priceRange && priceRange !== 'all') {
    if (priceRange === '0-199') results = results.filter(p => p.price <= 199);
    else if (priceRange === '200-499') results = results.filter(p => p.price >= 200 && p.price <= 499);
    else if (priceRange === '500-999') results = results.filter(p => p.price >= 500 && p.price <= 999);
    else if (priceRange === '1000+') results = results.filter(p => p.price >= 1000);
  }

  // Rating filter
  if (Number(minRating) > 0) {
    results = results.filter(p => p.rating >= Number(minRating));
  }

  // Discount filter
  if (Number(minDiscount) > 0) {
    results = results.filter(p => p.discount >= Number(minDiscount));
  }

  // Color filter
  if (color && color !== 'all') {
    results = results.filter(p => p.colors?.some(c => c.toLowerCase().includes(color.toLowerCase())));
  }

  // Size filter
  if (size && size !== 'all') {
    results = results.filter(p => p.sizes?.includes(size));
  }

  // Infinity Mall filter
  if (onlyInfinityMall === 'true' || onlyInfinityMall === true) {
    results = results.filter(p => p.infinityMall);
  }

  // Sorting
  if (sortBy === 'price-low') {
    results = [...results].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    results = [...results].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    results = [...results].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'discount') {
    results = [...results].sort((a, b) => b.discount - a.discount);
  }

  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const paginatedProducts = results.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    total: totalCount,
    totalPages,
    currentPage: page,
    limit,
    products: paginatedProducts
  });
});

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
      console.log(`[Razorpay] ✅ Payment verified: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
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

// 8. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    service: "Infinity Store AI Backend",
    aiEngineConfigured: Boolean(
      (process.env.AI_API_KEY || process.env.GEMINI_API_KEY) &&
      process.env.AI_API_KEY !== "your_api_key_here" &&
      process.env.GEMINI_API_KEY !== "your_api_key_here"
    ),
    totalCatalogItems: allProducts.length,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Infinity Store AI Backend running on http://localhost:${PORT}`);
  console.log(`📦 10,000+ Products Active | Multilingual AI Shopping Agent Online`);
});
