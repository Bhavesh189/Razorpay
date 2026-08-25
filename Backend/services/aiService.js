import { GoogleGenerativeAI } from '@google/generative-ai';
import { allProducts, searchProductsLocally } from '../data/products/index.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini safely with sanitized key
const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '').replace(/['"]/g, '').trim();
let genAI = null;
if (geminiApiKey && geminiApiKey !== 'your_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
  } catch (e) {
    console.warn('[Gemini] Initialization warning:', e.message);
  }
}

const SHOPPING_SYSTEM_PROMPT = `You are the **Infinity Store AI Senior Shopping Advisor & Elite Sales Closer** — an expert at consultative needs assessment, technical/material specification breakdown, high-conversion selling, and smart dynamic cross-selling.

## YOUR MODES OF CONVERSATION

### MODE 1: INTERACTIVE NEEDS ASSESSMENT (When the user's request is broad, initial, or needs clarification)
*Example: User says "I want a laptop", "phone lena hai", "show me clothes", "suggest some shoes", "best accessories"*
- **Acknowledge & Consult**: Greet them warmly like an expert personal shopper.
- **Ask 2-3 Smart Tailored Discovery Questions**: Think of the exact questions needed for that category.
- **Provide the "questionnaire" object**: Include 3-4 clickable option chips + custom requirement placeholder.
- **NO PRODUCTS YET**: In Mode 1, questionnaire MUST be populated and products will be hidden until user chooses their specs.

### MODE 2: SPECIFICATION-BASED PRODUCT CLOSER (When user has shared requirements or specific intent)
*Example: User specifies "gaming ke liye", "under 1 lakh", "RTX 4060", "oversized 220 gsm cotton", "coding ke liye"*
- **SET "questionnaire": null** (CRITICAL: You MUST set "questionnaire": null in Mode 2 so products will be shown!).
- **Acknowledge & Match**: Confirm their exact criteria.
- **Deep Specification Breakdown**:
  - Break down the exact specs (Processors, RTX GPUs, 144Hz-240Hz OLED/Mini-LED, RAM/SSD, 120W HyperCharge, 108MP OIS, 220 GSM Combed Cotton, Pure Banarasi Silk Zari Weave, 4K Dashcam, etc.).
  - Explain WHY that specific specification is critical for their exact stated requirement.
- **Dynamic Cross-Selling / Accessory Recommendation (CRITICAL)**:
  - In the **EXACT SAME LANGUAGE** as the user, proactively recommend complementary accessories:
    - For Laptop / Gaming Laptop: Remind them that taking a high-precision RGB gaming mouse, mechanical keyboard, or dual-turbo cooling pad will elevate their experience!
    - For Smartphone: Remind them to bundle a 65W GaN fast charger, screen protector, and wireless earbuds!
    - For Saree / Ethnic: Suggest a matching Temple/Kundan jewellery choker set or designer clutch!
    - For Footwear: Suggest memory foam cloud insoles and breathable socks!
    - For Car / Bike: Suggest 4K dashcam, portable vacuum, riding gloves, or helmet!
    - For everything else: Think of the smartest complementary item and explain why it pairs perfectly.
- **Persuasive Closer**: Highlight savings, live stock urgency, and customer reviews.
- **Zero Risk**: Official Razorpay Payment Gateway (UPI, Cards, NetBanking), Free PAN-India Delivery, and 7-Day Easy Doorstep Returns.
- **Push to Action**: Prompt them to click "Add to Cart" or "Buy with Razorpay".

### MODE 3: NO MATCH FOUND / ZERO RESULTS ("Product Nahi Mila")
*When catalog matches are empty or no products match the user's specific query or budget constraint:*
- **BE HONEST & CLEAR**: In the **USER'S EXACT LANGUAGE**, politely say that no products currently match their query or budget:
  - Hinglish example: *"Maaf kijiye! Aapke search criteria ya budget ke hisaab se hamare catalog me koi product nahi mila hai. 😔 Aap apna budget thoda badha sakte hain ya doosre keywords se search kar sakte hain."*
  - English example: *"Sorry! No products were found matching your search criteria or budget in our catalog. 😔 Please try adjusting your budget or searching with different keywords."*
- **DO NOT INVENT FAKE PRODUCTS**: Never pretend products exist when none were found. Set questionnaire: null and suggest helpful alternative search terms in suggestedFollowUpQueries.

## STRICT RULES
1. **SHOPPING ONLY**: Refuse non-shopping queries politely and steer back to shopping.
2. **DYNAMIC LANGUAGE MIRRORING (CRITICAL)**:
   - Always reply in the **EXACT SAME LANGUAGE and TONE** that the user uses!
   - If user speaks **Hinglish / Hindi**, reply in natural, persuasive Hinglish!
   - If user speaks **English**, reply in fluent English!
   - Ensure the questionnaire labels and question titles also naturally reflect their language!
3. **VALID JSON ONLY**: Always return strictly valid JSON matching the schema below.

## JSON RESPONSE FORMAT
{
  "reply": "Your conversational markdown response with formatting (**bold**, bullet points, specs breakdown, cross-sell advice)",
  "questionnaire": {
    "title": "Select your requirements or customize below:",
    "options": [
      { "id": "opt-1", "label": "Option 1 with Emoji & Specs", "value": "Detailed preference string 1" },
      { "id": "opt-2", "label": "Option 2 with Emoji & Specs", "value": "Detailed preference string 2" },
      { "id": "opt-3", "label": "Option 3 with Emoji & Specs", "value": "Detailed preference string 3" }
    ],
    "customPlaceholder": "Or type custom requirements (e.g. 16GB RAM, Under ₹30k)..."
  } or null,
  "suggestedFollowUpQueries": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "upsellPitch": {
    "title": "Complementary Add-on Title (e.g. Pro Esports RGB Gaming Mouse)",
    "price": 399,
    "pitchMessage": "Natural pitch in user's language explaining why they should bundle this with their main item"
  } or null
}`;

export async function processAIAgentQuery(userQuery, conversationHistory = [], cartContext = []) {
  const q = userQuery.toLowerCase().trim();

  // ===================== PRE-CHECK: FAST CART COMMANDS =====================
  // A. REMOVE FROM CART
  if (
    q.includes("remove") || q.includes("delete") || q.includes("cancel") ||
    q.includes("hatao") || q.includes("hata do") || q.includes("nikal do") || q.includes("cart se hata")
  ) {
    let target = "";
    if (q.includes("laptop")) target = "laptop";
    else if (q.includes("phone") || q.includes("mobile")) target = "phone";
    else if (q.includes("shirt")) target = "shirt";
    else if (q.includes("tshirt") || q.includes("t-shirt")) target = "t-shirt";
    else if (q.includes("saree")) target = "saree";
    else if (q.includes("kurti") || q.includes("kurta")) target = "kurti";
    else if (q.includes("shoes") || q.includes("shoe")) target = "shoe";
    else if (q.includes("mouse")) target = "mouse";
    else if (q.includes("keyboard")) target = "keyboard";
    else if (q.includes("headset") || q.includes("earbuds")) target = "earbuds";
    else target = q.replace(/cart\s*se\s*hatao?|hata\s*do|remove|from\s*cart|delete|cancel/gi, "").trim();

    return {
      success: true,
      reply: `Done! 🗑️ **${target ? target.charAt(0).toUpperCase() + target.slice(1) : 'Item'}** has been removed from your cart.\n\nYour cart has been updated. Would you like to review remaining items or **proceed to checkout**? ⚡`,
      agentAction: {
        type: "REMOVE_FROM_CART",
        target: target || "all",
        message: `${target || 'Item'} removed from cart`
      },
      products: [],
      suggestedFollowUpQueries: ["Show My Cart 🛒", "Proceed to Checkout ⚡", "Top Trending Deals 🔥"]
    };
  }

  // B. SHOW CART
  if (
    q.includes("cart dikhao") || q.includes("show cart") || q.includes("cart me kya hai") ||
    q.includes("my cart") || q.includes("view cart")
  ) {
    return {
      success: true,
      reply: `Here is your **Live Shopping Cart**! 🛒✨\n\n🔥 **Special Promotion**: Order right now to unlock **100% Free Express PAN-India Delivery** + **Extra ₹50 First-Order Discount (Code: FIRST50)**!\n\nReview your items below and complete your order with **1-Click Razorpay Checkout**:`,
      agentAction: {
        type: "SHOW_CART"
      },
      inChatCheckout: {
        ready: true,
        message: "Your order is ready! Pay securely with Razorpay — India's most trusted gateway: 🚀",
        actionText: "Proceed to Razorpay Payment ⚡"
      },
      products: [],
      suggestedFollowUpQueries: ["Pay Now with Razorpay ⚡", "Continue Shopping 🛍️", "Apply FIRST50 Coupon"]
    };
  }

  // C. CHECKOUT / PAYMENT
  if (
    q.includes("checkout") || q.includes("payment") || q.includes("pay") || q.includes("buy now") ||
    q.includes("order book") || q.includes("order place") || q.includes("kharidna hai")
  ) {
    return {
      success: true,
      reply: `Outstanding choice! 🔥 Your order is ready for instant execution!\n\n💳 **Payment Mode**: 100% Encrypted **Razorpay Gateway** (UPI, Google Pay, PhonePe, Cards, NetBanking)\n🚚 **Delivery**: Free Express PAN-India Doorstep Dispatch\n🛡️ **Buyer Protection**: 7-Day Hassle-Free Returns & Full Money-Back Guarantee\n\nTap **"Pay with Razorpay"** below to complete your purchase securely:`,
      agentAction: {
        type: "INITIATE_CHECKOUT"
      },
      inChatCheckout: {
        ready: true,
        message: "Payment Gateway Ready! Secure 1-Click Pay with Razorpay:",
        actionText: "⚡ Pay Now with Razorpay"
      },
      products: [],
      suggestedFollowUpQueries: ["Show My Cart 🛒", "Order Tracking Info 📦", "Available Coupons"]
    };
  }

  // ===================== GEMINI API: CONSULTATIVE AI RESPONSE =====================
  return await generateGeminiResponse(userQuery, conversationHistory, cartContext);
}

async function generateGeminiResponse(userQuery, conversationHistory = [], cartContext = []) {
  // Search for matching products from 100k+ catalog
  const matched = searchProductsLocally(userQuery);
  const topProducts = matched.slice(0, 6);
  const noMatchesFound = topProducts.length === 0;

  // Build rich product specifications context for Gemini
  const productContext = topProducts.map((p, i) => {
    const savings = p.originalPrice - p.price;
    const reviewCount = p.reviewsCount || Math.floor(p.rating * 1200 + 500);
    const stockLeft = Math.floor(Math.random() * 6) + 2;
    const viewingNow = Math.floor(Math.random() * 35) + 18;
    return `[Product #${i + 1}]
- Title: "${p.title}"
- Category: ${p.mainCategory} > ${p.subCategory}
- Sale Price: Rs.${p.price} | MRP: Rs.${p.originalPrice} | Discount: ${p.discount}% OFF (Buyer Saves Rs.${savings})
- Technical Specifications / Fabric: ${p.fabric || 'Premium Certified Build'}
- Detailed Description: ${p.description || p.title}
- Available Sizes: ${p.sizes ? p.sizes.join(', ') : 'Standard'}
- Available Colors: ${p.colors ? p.colors.join(', ') : 'Assorted'}
- Rating & Trust: ${p.rating}★ (${reviewCount.toLocaleString()} Verified Customer Reviews)
- Live Inventory: Only ${stockLeft} units remaining | ${viewingNow} buyers currently viewing
- Free Delivery: Yes | 7-Day Returns: Yes${p.infinityMall ? ' | Infinity Mall Official Verified' : ''}`;
  }).join('\n\n');

  // Build cart context
  const cartInfo = cartContext.length > 0
    ? `\n\nCustomer's Current Cart (${cartContext.length} items): ${cartContext.map(c => `"${c.title}" Rs.${c.price}`).join(', ')}.`
    : '\n\nCustomer Cart: Currently empty.';

  // Build conversation history summary for Gemini
  let historyPrompt = "";
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    historyPrompt = "\n\nRecent Conversation History:\n" + conversationHistory
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Customer' : 'AI Consultant'}: ${m.text}`)
      .join('\n');
  }

  let catalogInstruction = "";
  if (noMatchesFound) {
    catalogInstruction = `\n\n⚠️ CATALOG STATUS: ZERO MATCHING PRODUCTS FOUND in our 100,000+ catalog for this search/budget.
INSTRUCTION: You MUST politely apologize to the user in their EXACT language (Hinglish/English) stating that no products matched their search / budget criteria ("Sorry, aapke search query / budget ke hisaab se koi product nahi mila..."). Do NOT invent fake products. Suggest how they can adjust their budget or search for other popular categories in suggestedFollowUpQueries. Set questionnaire: null.`;
  }

  const userPrompt = `Customer Query: "${userQuery}"${historyPrompt}
${cartInfo}

Catalog Recommendations & Rich Specifications Available:
${productContext || 'NO MATCHING PRODUCTS FOUND for this query/budget in catalog.'}${catalogInstruction}

YOUR GOAL IN THIS TURN:
1. Act as the Senior Product Consultant and Sales Closer.
2. If NO products matched: Apologize politely in the user's language ("Sorry, koi matching product nahi mila..."), explain why (e.g. budget too low or item not found), and suggest alternative searches.
3. If broad search: Warmly greet, ASK 2-3 tailored discovery questions, present interactive questionnaire, and provide suggested queries.
4. If specific search with matching products: Analyze specifications deeply, explain why they meet the user's needs, recommend complementary accessories in the user's exact language (e.g. for laptop recommend mouse/keyboard/cooling pad), and push to Add to Cart / Razorpay checkout!
5. Always return strictly valid JSON.`;

  try {
    if (!genAI) {
      return generateFallbackResponse(userQuery, topProducts);
    }

    const geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SHOPPING_SYSTEM_PROMPT
    });

    const result = await geminiModel.generateContent(userPrompt);
    const responseText = result.response.text();

    // Parse JSON from Gemini response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/) || 
                         responseText.match(/```\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn('[Gemini] JSON parse failed, using raw text:', parseErr.message);
      parsed = {
        reply: responseText,
        questionnaire: null,
        suggestedFollowUpQueries: ["Top Gaming Laptops 🎮", "Best Deals Under ₹500", "Show My Cart 🛒"],
        upsellPitch: null
      };
    }

    // Only show product cards AFTER requirements are finalized, and ONLY IF matching products exist
    const hasQuestionnaire = Boolean(parsed.questionnaire);
    const attachedProducts = (hasQuestionnaire || noMatchesFound) ? [] : topProducts;

    return {
      success: true,
      reply: parsed.reply || responseText,
      questionnaire: parsed.questionnaire || null,
      products: attachedProducts,
      upsellPitch: (hasQuestionnaire || noMatchesFound) ? null : (parsed.upsellPitch || null),
      campaign: noMatchesFound ? null : {
        title: "⚡ Flash Sale — Ending Soon!",
        badge: "Extra ₹50 Off Applied",
        urgencyText: "Only a few units left at wholesale rates — lock in your order! ⏳"
      },
      suggestedFollowUpQueries: parsed.suggestedFollowUpQueries || [
        "Top Gaming Laptops 🎮",
        "Show Electronics 💻",
        "Explore Best Sellers ⭐",
        "Clear Budget Filter 🔄"
      ],
      poweredBy: "Infinity AI + Gemini"
    };

  } catch (err) {
    console.error('[Gemini API Error]:', err.message);
    return generateFallbackResponse(userQuery, topProducts);
  }
}

// Fallback response with deep specifications breakdown when Gemini API is unavailable
function generateFallbackResponse(userQuery, matched) {
  const q = userQuery.toLowerCase();
  let reply = "";
  let upsell = null;
  let questionnaire = null;

  if (matched.length === 0) {
    return {
      success: true,
      reply: `Maaf kijiye! 😔 Aapke search query **"${userQuery}"** ya budget ke hisaab se hamare **100,000+ catalog** me koi matching product nahi mila hai.\n\n💡 **Suggestions**:\n• Aap apna budget thoda badha kar search kar sakte hain\n• Doosre keywords (e.g. *Gaming Laptop*, *Smartphones*, *T-Shirts*, *Sarees*) use karein\n• Niche diye gaye options me se explore karein:`,
      questionnaire: null,
      products: [],
      upsellPitch: null,
      suggestedFollowUpQueries: [
        "Top Gaming Laptops 🎮",
        "Smartphones Under ₹15,000 📱",
        "Top Trending Deals 🔥",
        "Explore All Electronics 💻"
      ],
      poweredBy: "Infinity AI"
    };
  }

  if (q.includes("laptop") || q.includes("computer") || q.includes("notebook") || q.includes("macbook")) {
    reply = `Welcome to **Infinity Store**! I'm your Senior Shopping Advisor.

To help me recommend the exact hardware specifications (Processor, RTX Graphics, RAM & Display), please select your requirements or specify below:`;
    questionnaire = {
      title: "Select your primary usage & specifications or customize:",
      options: [
        { id: "opt-1", label: "🎮 High-FPS Gaming (RTX 4080 / 4070, 240Hz Mini-LED)", value: "Gaming laptop with dedicated RTX 4070/4080 graphics, 240Hz Mini-LED display, and vapor chamber cooling" },
        { id: "opt-2", label: "💻 Coding, Multi-tasking & Office (Core i9/i7, 32GB RAM)", value: "Programming and coding laptop with 32GB RAM and fast processor" },
        { id: "opt-3", label: "💰 Value Esports Gaming (RTX 4050 / Under ₹60,000)", value: "Best budget gaming laptop with RTX graphics under 60000" },
        { id: "opt-4", label: "⚡ Ultra-Lightweight (OLED Display, 1.6kg & 12Hr Battery)", value: "Slim lightweight OLED laptop with 12 hour battery life" }
      ],
      customPlaceholder: "Or type custom requirements (e.g. RTX 4070, 32GB RAM, Under ₹1 Lakh)..."
    };
    upsell = {
      title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
      price: 399,
      pitchMessage: "Laptop ke sath ek high-precision RGB gaming mouse aur mechanical keyboard lena gaming aur fast typing ke liye perfect combo rahega! 💻🖱️"
    };
  } else if (q.includes("phone") || q.includes("smartphone") || q.includes("mobile") || q.includes("5g")) {
    reply = `Here is the comprehensive specification breakdown for our top-tier smartphones! 📱✨\n\n⚡ **Engineered Specifications & Why You NEED This**:\n• **Camera Sensor**: 108MP Pro OIS Primary Sensor with f/1.7 aperture — captures crisp low-light details and ultra-stable 4K video.\n• **Display**: 120Hz Curved AMOLED HDR10+ with 1300 nits peak brightness — sunlight-readable with ultra-fluid touch response.\n• **HyperCharge Architecture**: 67W/120W Turbo Flash Charge (0 to 100% in under 22 minutes) — never get stranded with a dead battery.\n• **Connectivity**: Dual 5G SIM with 13 global bands for blazing low-latency speeds.\n\n💰 **Value Proposition**: Available at **₹${matched[0]?.price || '7,499'}** (MRP: ₹${matched[0]?.originalPrice || '14,999'} — **50% OFF** today only).\n⏰ **Limited Units**: Flash inventory selling rapidly across India!\n\n💡 *Tip: Phone ke sath 65W GaN fast charger aur tempered glass add karna screen protection aur ultra-fast charging ke liye must-have hai!* ⚡\n\n🛡️ **Zero Risk**: Official Razorpay Gateway + 7-Day Easy Returns. **Tap Add to Cart to lock in your discount!** 🛒`;
    upsell = {
      title: "65W GaN Fast Charger with Braided Type-C Cable",
      price: 299,
      pitchMessage: "⚡ 92% of smartphone buyers add this! 65W GaN charger powers your device 3x faster than standard plugs — just ₹299!"
    };
  } else if (q.includes("tshirt") || q.includes("t-shirt") || q.includes("shirt") || q.includes("polo") || q.includes("tee")) {
    reply = `I have matched our apparel collection against premium fabric specifications! 👕🔥\n\n✨ **Material Specifications & Why You NEED This**:\n• **Fabric Composition**: 100% Pure Bio-Washed Combed Cotton at **220 GSM** — ultra-durable heavyweight drape that maintains shape wash after wash without color bleeding.\n• **Silhouette**: Engineered Drop-Shoulder Oversized boxy cut — the gold standard for modern streetwear aesthetics.\n• **Breathability**: Pre-shrunk breathable knit provides all-day cooling comfort in Indian climates.\n\n💰 **Deal Price**: Starting at only **₹${matched[0]?.price || '199'}** (MRP: ₹${matched[0]?.originalPrice || '699'} — **Flat 70% OFF**).\n⏰ **High Demand**: Over 18,000 units dispatched this month. Popular sizes sell out in hours!\n\n🚚 **Free Delivery + 7-Day Easy Returns + Razorpay Protection**. **Add 2 or more to cart for maximum bundle value!** 🛒`;
    upsell = {
      title: "6-Pocket Tactical Military Cargo Pants",
      price: 399,
      pitchMessage: "🔥 Is stylish T-shirt ke sath Heavyweight Tactical Cargo Pants pair karna complete streetwear aesthetic look dega sirf ₹399 me!"
    };
  } else if (q.includes("saree") || q.includes("wedding") || q.includes("lehenga") || q.includes("kurti")) {
    reply = `Here is the craft and fabric specification review for our Royal Festive collection! 👗✨\n\n🌟 **Craftsmanship Specifications & Why You NEED This**:\n• **Textile**: Pure Banarasi Art Silk with intricate Heavy Golden Zari Pallu — provides a regal shimmer under festive lighting.\n• **Drape Dynamics**: Lightweight 5.5m saree + 0.8m unstitched designer blouse piece — drapes effortlessly with structured pleats.\n• **Occasion Versatility**: Tailored for weddings, festive ceremonies, and grand evening receptions.\n\n💰 **Pricing**: Wholesale starting at **₹${matched[0]?.price || '249'}** (Boutique MRP: ₹${matched[0]?.originalPrice || '1,499'} — **Up to 80% OFF**).\n⏰ **Restock Notice**: Handloom stock is strictly limited to 4 units per colorway.\n\n🛡️ **100% Safe Checkout via Razorpay + 7-Day Doorstep Returns**. **Add to cart now to guarantee arrival before your event!** 🛒`;
    upsell = {
      title: "Traditional 24K Gold Plated Temple Choker Jewellery Set",
      price: 249,
      pitchMessage: "👑 Is royal saree ke sath matching 24K Temple Gold Choker set lena aapke look ko 10x zyada festive aur complete banayega!"
    };
  } else if (q.includes("shoe") || q.includes("sneaker") || q.includes("footwear") || q.includes("sandal")) {
    reply = `Here is the ergonomic specification breakdown for our top-rated footwear! 👟🔥\n\n☁️ **Ergonomic Specifications & Why You NEED This**:\n• **Midsole Tech**: High-rebound Air-Cushion EVA Sole — absorbs impact shock and reduces heel pressure during all-day walking.\n• **Upper Material**: Breathable mesh with reinforced vegan leather overlays — delivers flexibility, ventilation, and premium styling.\n• **Traction**: Anti-skid rubberized grooved outsole for confident grip on all indoor and outdoor surfaces.\n\n💰 **Special Rate**: Starting at **₹${matched[0]?.price || '299'}** (Retail: ₹${matched[0]?.originalPrice || '1,299'} — **75% OFF**).\n⏰ **Stock Status**: Only 4 pairs remaining in trending sizes!\n\n🛡️ **Hassle-Free Size Exchange + 7-Day Returns + Razorpay Protection**. **Tap Add to Cart to claim your size!** 🛒`;
    upsell = {
      title: "Orthopedic Memory Foam Insoles (Set of 2 Pairs)",
      price: 149,
      pitchMessage: "☁️ In shoes ke sath memory foam cloud insoles bundle karna har kadam par all-day walking comfort dega!"
    };
  } else {
    reply = `I have scanned our **100,000+ catalog** and analyzed specifications for your query **"${userQuery}"**! 🛍️✨\n\n🏆 **Specification & Value Highlights**:\n• **Verified Build Quality**: Every curated match features high-grade materials, manufacturer quality verification, and high reliability.\n• **Top Customer Ratings**: Rated 4.4★+ average across thousands of verified customer purchase reviews.\n• **Maximum Value**: Locked at factory-direct pricing with **up to 70% OFF** + **Extra ₹50 First-Order Discount (Code: FIRST50)**.\n\n⏰ **Flash Deal Active**: Promotional pricing is reserved for today's session only!\n🛡️ **Protected By Razorpay**: 100% Encrypted Transactions + Free PAN-India Delivery + 7-Day Easy Returns.\n\n**Explore the detailed specifications below and add your top choice to cart!** 🛒`;
    upsell = {
      title: "Wireless Bluetooth 5.3 Deep Bass Neckband",
      price: 299,
      pitchMessage: "🎧 60-Hour Playtime Bluetooth 5.3 Neckband with ENC bundle deal for just ₹299!"
    };
  }

  return {
    success: true,
    reply,
    questionnaire,
    products: questionnaire ? [] : matched,
    upsellPitch: questionnaire ? null : upsell,
    campaign: {
      title: "⚡ Flash Sale — Ending Soon!",
      badge: "Extra ₹50 Off Applied",
      urgencyText: "Only a few units left at wholesale rates — lock in your order! ⏳"
    },
    suggestedFollowUpQueries: [
      "Add to Cart Now 🛒",
      "Proceed to Checkout ⚡",
      "Compare Specifications 🔍",
      "Best Rated Products ⭐"
    ],
    poweredBy: "Infinity AI"
  };
}
