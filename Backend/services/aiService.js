import { GoogleGenerativeAI } from '@google/generative-ai';
import { allProducts, searchProductsLocally, productsById } from '../data/products/index.js';
import { ProductSearchEngine } from '../search/SearchEngine.js';
import { redisService } from './redisService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Global unified ProductSearchEngine instance for AI Commerce
let globalSearchEngine = null;
export function setSearchEngine(engine) {
  globalSearchEngine = engine;
}

export function getSearchEngine() {
  if (!globalSearchEngine) {
    globalSearchEngine = new ProductSearchEngine(allProducts);
  }
  return globalSearchEngine;
}

// Multi-Turn Structured Session State Store backed by Redis
export const sessionStore = new Map();

export async function getSessionState(sessionId = "default_session") {
  // 1. Try Redis
  try {
    const redisState = await redisService.getSessionState(sessionId);
    if (redisState) {
      sessionStore.set(sessionId, redisState);
      return redisState;
    }
  } catch {}

  // 2. In-Memory Cache
  if (!sessionStore.has(sessionId)) {
    const initialState = {
      sessionId,
      conversation: [],
      currentIntent: "GREETING",
      category: null,
      requirements: {},
      activeResults: [],
      cart: [],
      checkoutState: null,
      updatedAt: new Date().toISOString()
    };
    sessionStore.set(sessionId, initialState);
    redisService.setSessionState(sessionId, initialState).catch(() => {});
  }
  return sessionStore.get(sessionId);
}

export async function setSessionState(sessionId, state) {
  const updated = {
    ...state,
    sessionId,
    updatedAt: new Date().toISOString()
  };
  sessionStore.set(sessionId, updated);
  try {
    await redisService.setSessionState(sessionId, updated);
  } catch {}
  return updated;
}

export async function clearSessionState(sessionId) {
  if (sessionId) {
    sessionStore.delete(sessionId);
    try {
      await redisService.clearSessionState(sessionId);
    } catch {}
  }
}

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

const SHOPPING_SYSTEM_PROMPT = `You are **Infinity AI — Senior Personal Commerce Advisor & Friendly Shopping Partner** at Infinity Store.
You speak naturally in friendly Hinglish, Hindi, or English (strictly matching the user's language, dialect, and tone).

## YOUR PERSONALITY & CORE PRINCIPLES:
1. **Natural Conversation First**:
   - The AI must NOT behave like a search box all the time.
   - If the user simply wants to chat ("Hello bhai", "Kya kar raha hai?", "Aaj college bahut tiring tha"):
     Respond naturally, casually, and warmly in the user's language.
     Do NOT show products.
     Do NOT start a questionnaire for normal conversation.
     Do NOT randomly recommend products.
     Classify intent as NORMAL_CONVERSATION.
2. **Shopping Intent Detection**:
   - When the user expresses a shopping intent ("Mujhe laptop chahiye", "I want a phone", "Gaming ke liye kuch chahiye", "Mujhe shoes lene hain", "Mujhe ek smartwatch buy karni hai"):
     Do NOT immediately dump random products. First determine whether enough requirement information is available.
     If requirements are incomplete, initiate a dynamic requirement discovery flow.
3. **Dynamic Category-Specific Questionnaire**:
   - Do NOT use hardcoded fixed questions. Dynamically generate the next most useful question for the category.
   - For a laptop: usage (Gaming, Coding, Office, College, etc.), gaming performance level, RAM, display, budget, brand.
   - Every question must support:
     * Clear MCQ options
     * "No Preference" where appropriate
     * "Custom" option
     * Dynamically decide whether single_select or multi_select
   - Variable question depth: simple products require only 2-3 questions; complex tech may require 4-8 questions.
   - When user says "product confirm hai" / "bas ab products dikhao" / "requirements complete", finalize requirements and retrieve products.
4. **Deterministic Search & Candidate-Based Ranking**:
   - When requirements are complete, products are retrieved from the 125,000+ catalog using the Infinity Search Engine.
   - Evaluate candidate products against user hard constraints (budget maximum, RAM, brand) and soft preferences.
   - Rank top 3 to 6 best matching products.
   - You can ONLY recommend products present in the candidate product list. NEVER invent products, prices, specs, ratings, or IDs.
   - Provide concise, user-facing explanations with medals (🥇 Best overall match, 🥈 Best performance option, 🥉 Best value option).
5. **Zero Match Handling**:
   - If no candidate satisfies hard constraints, honestly state so and offer options (relax budget, adjust specs).
6. **Follow-Up Refinement & Contextual References**:
   - Understand "Under 70k", "Only HP", "Second one kaisa hai", "first one ka alternative" using active result context.
7. **Shopping Scope Guard**:
   - If user asks for non-shopping tasks (coding, homework, medical, legal), politely redirect to shopping in their language.
8. **Language Matching**:
   - Match the user's language (English, Hindi, Hinglish) for conversations while keeping UI labels clean.

## JSON RESPONSE FORMAT (Always return strict JSON):
{
  "message": "Your natural markdown response in user's language without predefined templates",
  "language": "hinglish" | "english" | "hindi",
  "intent": "NORMAL_CONVERSATION" | "SHOPPING_INTENT" | "REQUIREMENT_DISCOVERY" | "PRODUCT_RECOMMENDATION" | "FOLLOW_UP_REFINEMENT" | "SCOPE_GUARD" | "CART_ACTION",
  "state": "GREETING" | "DISCOVERING_INTENT" | "COLLECTING_REQUIREMENTS" | "REQUIREMENTS_COMPLETE" | "CART_ACTION" | "NON_COMMERCE" | "UNCLEAR",
  "category": "laptops" | "phones" | "headphones" | "fashion" | "footwear" | "fitness" | "appliances" | "watches" | "fragrances" | "bags" | null,
  "requirementsComplete": boolean,
  "shouldSearchProducts": boolean,
  "questionnaire": {
    "id": "question_identifier_string",
    "title": "Category-specific question title",
    "text": "Detailed question text",
    "type": "single_select" | "multi_select",
    "options": ["Option 1", "Option 2", "Option 3", "No Preference", "Custom"],
    "allowCustom": true,
    "customPlaceholder": "Tell me your requirement (e.g. minimum 24GB RAM for Docker)..."
  } | null,
  "requirements": {
    "priorities": ["priority1", "priority2"],
    "budget": number | null,
    "customRequirements": string
  },
  "recommendedProductIds": ["prod-id-1", "prod-id-2"],
  "recommendations": [
    {
      "productId": "prod-id-1",
      "matchRank": 1,
      "whyMatches": "Concise user-facing explanation why it fits their requirement",
      "keyHighlight": "Best Overall Match"
    }
  ],
  "agentAction": {
    "type": "REMOVE_FROM_CART" | "SHOW_CART" | "INITIATE_CHECKOUT",
    "target": "item keyword or all"
  } | null,
  "suggestedFollowUpQueries": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`;

// Guard against non-commerce queries (coding, homework, entertainment, general knowledge)
export function isNonCommerceQuery(query = "") {
  const q = query.toLowerCase().trim();
  const nonCommercePatterns = [
    /\b(write|create|code|program|solve|explain|prove|homework|essay|assignment)\b.*?\b(c\+\+|java|python|javascript|code|algorithm|binary\s*search|sorting|bubble\s*sort|recursion|sql|database|html|css|react|node)\b/i,
    /\b(c\+\+|python|java|javascript|cpp|rust|golang)\s+(?:program|code|script|algorithm|function|class|tutorial)\b/i,
    /\b(?:write|give\s*me)\s*(?:a|an)?\s*(?:c\+\+|python|java|code|program|script|essay|story|poem|song|speech|joke|riddle)\b/i,
    /\b(?:who\s*is\s*the\s*president|prime\s*minister|capital\s*of|formula\s*of|calculate\s*the\s*derivative|integrate|medical\s*advice|diagnose|symptom|prescribe|legal\s*advice|lawsuit)\b/i
  ];
  return nonCommercePatterns.some(pat => pat.test(q));
}

// Deep Requirement Extraction Helper across Hindi, Hinglish & English
export function extractDetailedRequirements(userQuery, conversationHistory = []) {
  const q = userQuery.toLowerCase().trim();
  const cleaned = q.replace(/,/g, '');

  let intent = "Personalized Catalog Search";
  let targetAudience = "Smart Shoppers";
  let budgetConstraint = null;
  let numericBudget = null;
  const keySpecsMatched = [];

  // 1. Budget extraction with support for '50k', '20k', '50 hazar', '₹50000', etc.
  let rawVal = null;
  const kMatch = cleaned.match(/(\d+)\s*k\b/i);
  if (kMatch) {
    rawVal = parseInt(kMatch[1], 10) * 1000;
  } else {
    const hazarMatch = cleaned.match(/(\d+)\s*(?:hazar|thousand)/i);
    if (hazarMatch) {
      rawVal = parseInt(hazarMatch[1], 10) * 1000;
    } else {
      const budgetMatch = cleaned.match(/(?:under|below|less\s*than|max\s*price|budget\s*(?:is|of|under|:)?|₹)\s*(\d+)|(\d+)\s*(?:ke\s*andar|tak|max|rs|inr|budget|ka\s*budget|me|mein)/i);
      if (budgetMatch) {
        rawVal = parseInt(budgetMatch[1] || budgetMatch[2], 10);
      }
    }
  }
  if (rawVal && !isNaN(rawVal)) {
    numericBudget = rawVal;
    budgetConstraint = `Under ₹${rawVal.toLocaleString('en-IN')}`;
  }

  // 2. Intent & Domain Specification mapping
  if (q.includes("game") || q.includes("gaming") || q.includes("gta") || q.includes("valorant") || q.includes("rtx") || q.includes("fps") || q.includes("pubg") || q.includes("bgmi")) {
    intent = "High-FPS Esports & AAA Gaming";
    targetAudience = "Gamers & Enthusiasts";
    keySpecsMatched.push("Dedicated RTX Series GPU", "144Hz/165Hz High-Refresh Display", "Dual-Fan High-TGP Cooling", "16GB Fast Dual-Channel RAM");
  } else if (q.includes("laptop") || q.includes("computer") || q.includes("macbook") || q.includes("pc")) {
    intent = "High Performance Laptop & Multitasking";
    targetAudience = "Students, Professionals & Creators";
    keySpecsMatched.push("Intel Core i5 / Ryzen 5 Processor", "16GB Fast RAM & 512GB NVMe SSD", "FHD Eye-Care Anti-Glare Display", "Long Battery Life with Fast Charge");
  } else if (q.includes("code") || q.includes("coding") || q.includes("programming") || q.includes("developer") || q.includes("software") || q.includes("python") || q.includes("java")) {
    intent = "Software Development, Compiling & Multitasking";
    targetAudience = "Developers & Engineers";
    keySpecsMatched.push("Multi-Core High-Speed CPU", "16GB/32GB RAM for IDEs & Docker", "High-Speed NVMe PCIe Gen4 SSD", "Ergonomic Low-Blue-Light Display");
  } else if (q.includes("air fryer") || q.includes("fryer") || q.includes("bina tel") || q.includes("oil free") || q.includes("pakode") || q.includes("crispy")) {
    intent = "Healthy 90% Oil-Free Cooking & Air Frying";
    targetAudience = "Health-Conscious Families & Foodies";
    keySpecsMatched.push("Rapid 360° Thermo-Air Circulation", "BPA-Free Ceramic Non-Stick Basket", "1500W High-Efficiency Coil", "One-Touch Digital Presets");
  } else if (q.includes("blender") || q.includes("smoothie") || q.includes("mixer") || q.includes("protein shake") || q.includes("shake")) {
    intent = "High-Speed Nutrient Extraction & Blending";
    targetAudience = "Fitness & Nutrition Enthusiasts";
    keySpecsMatched.push("1000W Pure Copper High-Torque Motor", "304 Surgical Stainless Steel Blades", "Tritan BPA-Free Sipper Jars", "22,000 RPM Pulverizing Speed");
  } else if (q.includes("massage gun") || q.includes("dard") || q.includes("pain") || q.includes("muscle") || q.includes("recovery") || q.includes("soreness")) {
    intent = "Deep Tissue Percussion Muscle Relief & DOMS Recovery";
    targetAudience = "Gym Goers, Athletes & Fitness Buffs";
    keySpecsMatched.push("3200 RPM Brushless High-Torque Motor", "6 Interchangeable Targeted Heads", "LCD Speed Control", "Long-Lasting Lithium Rechargeable Battery");
  } else if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("workout") || q.includes("exercise")) {
    intent = "High-Impact Strength Training & Fitness";
    targetAudience = "Home Gym & Fitness Enthusiasts";
    keySpecsMatched.push("Solid High-Durability Grip", "Anti-Tear & Anti-Slip Materials", "Joint Cushioning Support");
  } else if (q.includes("yoga") || q.includes("stretch") || q.includes("meditation")) {
    intent = "Joint-Friendly Yoga, Stretching & Floor Workouts";
    targetAudience = "Yoga Practitioners & Wellness Seekers";
    keySpecsMatched.push("6mm High-Density Dual-Color TPE", "Laser-Engraved Body Alignment Lines", "Moisture-Resistant Non-Slip Surface");
  } else if (q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("cologne") || q.includes("khushboo") || q.includes("scent")) {
    intent = "Long-Lasting Signature Luxury Fragrance";
    targetAudience = "Fragrance Lovers & Style Enthusiasts";
    keySpecsMatched.push("25% High EDP Concentration", "24-Hour Beast Mode Sillage", "Pure Botanical Essential Oils", "Rich Cambodian Agarwood / Amber / Vanilla Notes");
  } else if (q.includes("headphone") || q.includes("anc") || q.includes("noise cancel") || q.includes("shor") || q.includes("earbud") || q.includes("tws") || q.includes("audio")) {
    intent = "Noise-Isolated High-Fidelity Audio & Crystal Calls";
    targetAudience = "Music Lovers, Commuters & Remote Workers";
    keySpecsMatched.push("Hybrid Active Noise Cancellation (ANC 35dB)", "Custom 40mm Titanium Drivers", "Quad-Mic AI ENC for Clear Calling", "50-Hour Extended Battery Life");
  } else if (q.includes("saree") || q.includes("banarasi") || q.includes("wedding") || q.includes("shaadi") || q.includes("mummy") || q.includes("lehenga") || q.includes("festive") || q.includes("ethnic")) {
    intent = "Royal Festive, Wedding & Traditional Celebrations";
    targetAudience = "Ethnic Wear & Festive Shoppers";
    keySpecsMatched.push("Pure Banarasi Art Silk with Rich Weave", "Heavy Shimmer Golden Zari Pallu", "Elegant Fall & Structured Pleats", "Matching Unstitched Blouse Piece Included");
  } else if (q.includes("tshirt") || q.includes("t-shirt") || q.includes("oversized") || q.includes("streetwear") || q.includes("cotton")) {
    intent = "Premium Casual & Oversized Streetwear Fit";
    targetAudience = "Streetwear & Daily Fashion Shoppers";
    keySpecsMatched.push("100% Bio-Washed Combed Cotton", "Heavyweight 220 GSM Dense Fabric", "Relaxed Drop-Shoulder Boxy Silhouette", "Pre-Shrunk Fade-Resistant Dye");
  } else if (q.includes("shoe") || q.includes("sneaker") || q.includes("running") || q.includes("walking") || q.includes("footwear")) {
    intent = "All-Day Comfort, Running & Athletic Wear";
    targetAudience = "Daily Walkers & Runners";
    keySpecsMatched.push("High-Rebound Air Cushion EVA Midsole", "Breathable Mesh Upper Ventilation", "Anti-Skid Traction Grooved Sole", "Shock-Absorbing Arch Support");
  } else if (q.includes("backpack") || q.includes("luggage") || q.includes("trolley") || q.includes("travel") || q.includes("college")) {
    intent = "Rugged Commuting, College & Travel Utility";
    targetAudience = "Travelers, Students & Daily Commuters";
    keySpecsMatched.push("900D Waterproof Ballistic Fabric", "Integrated External USB Charging Port", "Ergonomic Honeycomb Padded Straps", "Anti-Theft Hidden Zipper Pocket");
  } else if (q.includes("phone") || q.includes("smartphone") || q.includes("5g") || q.includes("camera")) {
    intent = "5G Ultra-Fast Smartphone & High-Res Photography";
    targetAudience = "Mobile Power Users & Creators";
    keySpecsMatched.push("108MP Pro OIS High-Res Sensor", "120Hz Curved AMOLED 1300 Nits Display", "67W/120W Turbo HyperCharge", "Dual 5G Multi-Band Connectivity");
  } else if (q.includes("watch") || q.includes("ghadi") || q.includes("chronograph") || q.includes("smartwatch")) {
    intent = "Executive Style & Everyday Timekeeping";
    targetAudience = "Watch Collectors & Professionals";
    keySpecsMatched.push("Precision Japanese Quartz Movement", "Surgical Grade Stainless Steel Chassis", "30M Water Resistance & Scratch-Resistant Glass");
  } else {
    keySpecsMatched.push("Verified Quality", "High Customer Satisfaction", "Direct Wholesale Pricing", "100% Secure Razorpay Checkout");
  }

  return {
    intent,
    targetAudience,
    budgetConstraint: budgetConstraint || "Best Wholesale Value",
    numericBudget,
    keySpecsMatched
  };
}

// Enrich every product with individualized match reasoning and match percentage
export function enrichProductsWithRequirementMatch(products = [], requirements = {}, userQuery = "") {
  if (!Array.isArray(products) || products.length === 0) return [];
  const q = userQuery.toLowerCase();

  return products.map((p, index) => {
    // Generate dynamic match score: Top 1 is 98%, next 95%, 92%, etc.
    const baseScore = Math.max(85, 98 - (index * 3));
    const matchScore = `${baseScore}%`;

    const titleLower = p.title.toLowerCase();
    const subCat = (p.subCategory || "").toLowerCase();
    const fabric = p.fabric || "";

    // Generate specific "Why this fits you" reasoning based on product and extracted requirements
    let whyItMatches = `Matches your requirement for **${requirements.intent || 'quality & performance'}** at **₹${p.price}** with top verified buyer ratings.`;
    const matchedBadges = [];

    if (p.price) {
      if (requirements.budgetConstraint && requirements.budgetConstraint !== "Best Wholesale Value") {
        matchedBadges.push(`Budget: ${requirements.budgetConstraint}`);
      } else {
        matchedBadges.push(`₹${p.price.toLocaleString('en-IN')} (${p.discount}% OFF)`);
      }
    }

    if (titleLower.includes("laptop") || subCat.includes("laptop")) {
      if (titleLower.includes("rtx") || titleLower.includes("gaming") || titleLower.includes("legion") || titleLower.includes("nitro")) {
        matchedBadges.push("Dedicated RTX GPU", "144Hz+ Display");
        whyItMatches = `Equipped with dedicated NVIDIA RTX graphics and high-refresh display, making it ideal for smooth 60-120+ FPS AAA gaming and rapid rendering.`;
      } else if (titleLower.includes("ryzen") || titleLower.includes("i5") || titleLower.includes("i7")) {
        matchedBadges.push("High-Speed Multi-Core CPU", "16GB RAM / Fast SSD");
        whyItMatches = `Features a fast multi-core processor and 16GB RAM for seamless multitasking, coding IDEs, and office productivity.`;
      }
    } else if (titleLower.includes("air fryer") || subCat.includes("kitchen")) {
      matchedBadges.push("90% Less Oil", "360° Air Circulation");
      whyItMatches = `Prepares crispy snacks and meals with 90% less oil using rapid 360° thermo-convection, matching your healthy cooking requirement.`;
    } else if (titleLower.includes("blender") || titleLower.includes("nutri")) {
      matchedBadges.push("1000W Motor", "Stainless Steel Blades");
      whyItMatches = `Pulverizes tough nuts, fruits, and protein shakes in under 15 seconds at 22,000 RPM speed.`;
    } else if (titleLower.includes("massage gun") || titleLower.includes("massager")) {
      matchedBadges.push("3200 RPM Percussion", "6 Targeted Heads");
      whyItMatches = `Delivers 3200 pulses/min deep-tissue percussion to eliminate lactic acid build-up and relieve post-workout soreness.`;
    } else if (titleLower.includes("yoga")) {
      matchedBadges.push("6mm High Density TPE", "Alignment Lines");
      whyItMatches = `Provides extra joint cushioning with laser alignment lines for perfect posture and zero slip during floor workouts.`;
    } else if (titleLower.includes("oud") || titleLower.includes("perfume") || subCat.includes("fragrance")) {
      matchedBadges.push("24H Beast Mode", "25% EDP Concentration");
      whyItMatches = `Formulated with 25% EDP concentration for an intoxicating 24-hour sillage that leaves a royal, lingering impression.`;
    } else if (titleLower.includes("headphone") || titleLower.includes("anc") || titleLower.includes("earbud")) {
      matchedBadges.push("ANC 35dB Noise Cancellation", "50H Battery");
      whyItMatches = `Silences ambient noise up to 35dB and provides crisp call clarity with 4-mic AI ENC and long battery life.`;
    } else if (titleLower.includes("saree") || subCat.includes("saree")) {
      matchedBadges.push("Banarasi Art Silk", "Heavy Zari Pallu");
      whyItMatches = `Crafted with rich Banarasi silk and glistening golden zari work, delivering a majestic drape for weddings and festivals.`;
    } else if (titleLower.includes("t-shirt") || titleLower.includes("tshirt") || subCat.includes("t-shirt")) {
      matchedBadges.push("220 GSM Heavyweight", "100% Bio-Washed Cotton");
      whyItMatches = `220 GSM heavyweight combed cotton gives a structured, modern drop-shoulder streetwear drape that holds shape across washes.`;
    } else if (titleLower.includes("shoe") || titleLower.includes("sneaker")) {
      matchedBadges.push("Air-Cushion Midsole", "Breathable Mesh");
      whyItMatches = `High-rebound air cushion EVA sole absorbs shock and relieves heel pressure during long standing and walking.`;
    } else if (titleLower.includes("backpack") || subCat.includes("luggage")) {
      matchedBadges.push("900D Waterproof", "USB Charging Port");
      whyItMatches = `Features 900D water-repellent ballistic fabric and integrated USB charging port for effortless daily travel and college use.`;
    } else if (titleLower.includes("phone") || subCat.includes("mobile")) {
      matchedBadges.push("108MP Sensor", "120Hz Curved AMOLED");
      whyItMatches = `Delivers fluid 120Hz visuals, flagship 108MP low-light photography, and 67W rapid charging within your budget.`;
    } else {
      matchedBadges.push("4.5★+ Top Rated", "Free Express Delivery");
      whyItMatches = `Highly rated by over ${(p.reviewsCount || 1000).toLocaleString()} customers for outstanding durability, build quality, and value.`;
    }

    return {
      ...p,
      matchScore,
      matchedBadges: matchedBadges.slice(0, 3),
      whyItMatches
    };
  });
}



// Generate realistic prototype demo products matching exact requested specifications and budget
function generateDemoProductsForQuery(query, userBudget = null) {
  const q = query.toLowerCase();
  const demoList = [];

  // Determine budget constraint
  let budget = userBudget;
  if (!budget) {
    const priceMatch = q.match(/(?:under|below|less\s*than|max\s*price|budget\s*(?:is|of|under|:)?|₹)\s*(\d+)/i);
    if (priceMatch && priceMatch[1]) {
      budget = parseInt(priceMatch[1], 10);
    }
  }

  // LAPTOP PROTOTYPES
  if (q.includes("laptop") || q.includes("computer") || q.includes("notebook") || q.includes("macbook") || q.includes("pc")) {
    const isGaming = q.includes("gaming") || q.includes("rtx") || q.includes("fps") || q.includes("graphics");
    const isCoding = q.includes("coding") || q.includes("programming") || q.includes("developer") || q.includes("work");
    const isLightweight = q.includes("lightweight") || q.includes("slim") || q.includes("oled") || q.includes("macbook");

    if (budget && budget <= 45000) {
      demoList.push({
        id: `demo-lap-${Date.now()}-1`,
        title: `Lenovo IdeaPad Slim 3 15.6" FHD • Intel Core i5-12450H • 16GB DDR5 • 512GB NVMe SSD • Rapid Charge`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: Math.min(budget - 500, 39990),
        originalPrice: 58990,
        discount: 32,
        rating: 4.6,
        reviewsCount: 12400,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Arctic Grey", "Abyss Blue"],
        sizes: ["15.6-inch FHD Antiglare (300 nits)"],
        tags: ["laptop", "lenovo", "ideapad", "i5", "16gb ram", "budget laptop", "office", "student", "electronics"],
        images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80"],
        fabric: "Engineered Polymer Lightweight Chassis (1.62 kg)",
        seller: { name: "Lenovo Authorized Store", rating: 4.6 },
        description: "12th Gen Intel Core i5-12450H (8 Cores, 12 Threads), 16GB DDR5 4800MHz RAM, 512GB PCIe 4.0 SSD, Privacy Shutter HD Camera, Dolby Audio, and 7-Hour Battery life with Rapid Charge."
      });
      demoList.push({
        id: `demo-lap-${Date.now()}-2`,
        title: `ASUS Vivobook 15 • AMD Ryzen 5 7520U • 16GB RAM • 512GB Gen4 SSD • TÜV Rheinland Certified Eye Care`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: Math.min(budget - 1200, 37490),
        originalPrice: 52990,
        discount: 29,
        rating: 4.5,
        reviewsCount: 8900,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Quiet Blue", "Cool Silver"],
        sizes: ["15.6-inch FHD NanoEdge Display"],
        tags: ["laptop", "asus", "vivobook", "ryzen 5", "16gb", "student", "coding", "electronics"],
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80"],
        fabric: "ErgoSense Keyboard + Anti-Bacterial Guard Chassis",
        seller: { name: "ASUS Official Store", rating: 4.5 },
        description: "AMD Ryzen 5 7520U Quad-Core Processor, 16GB LPDDR5 RAM, 512GB M.2 NVMe PCIe 3.0 SSD, 180-degree lay-flat hinge, and ASUS AI Noise-Canceling audio."
      });
    } else if (budget && budget <= 70000) {
      demoList.push({
        id: `demo-lap-${Date.now()}-1`,
        title: `MSI Thin 15 Esports Gaming Laptop • Core i7 13th Gen • NVIDIA RTX 4050 6GB • 144Hz FHD • 16GB RAM • 512GB SSD`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: Math.min(budget - 1000, 64990),
        originalPrice: 89990,
        discount: 28,
        rating: 4.7,
        reviewsCount: 15600,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Cosmos Black with Matrix Accents"],
        sizes: ["15.6-inch 144Hz Level IPS Display"],
        tags: ["laptop", "gaming laptop", "msi", "rtx 4050", "i7", "16gb ram", "gaming", "electronics"],
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80"],
        fabric: "Brushed Aluminum Top Cover + Cooler Boost Architecture",
        seller: { name: "MSI Official Gaming Arena", rating: 4.7 },
        description: "Intel Core i7-13620H (10 Cores), NVIDIA GeForce RTX 4050 6GB GDDR6 with DLSS 3, 16GB DDR5 5200MHz RAM, 512GB NVMe Gen4 SSD, Red Backlit Gaming Keyboard, and Hi-Res Audio."
      });
      demoList.push({
        id: `demo-lap-${Date.now()}-2`,
        title: `Acer Nitro V 15 • AMD Ryzen 7 7735HS • RTX 4050 6GB (75W TGP) • 165Hz IPS Display • 16GB DDR5 • 512GB Gen4 SSD`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: Math.min(budget - 500, 66990),
        originalPrice: 94990,
        discount: 29,
        rating: 4.7,
        reviewsCount: 11200,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Obsidian Black with Nitro Decal"],
        sizes: ["15.6-inch 165Hz 3ms FHD IPS Display"],
        tags: ["laptop", "acer", "nitro v", "ryzen 7", "rtx 4050", "gaming laptop", "electronics"],
        images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80"],
        fabric: "Dual Fan Cooling Architecture with Dual Exhaust Ports",
        seller: { name: "Acer Gaming Hub", rating: 4.7 },
        description: "AMD Ryzen 7 7735HS Octa-Core Processor, NVIDIA RTX 4050 6GB, 16GB DDR5 RAM (expandable to 32GB), 512GB PCIe Gen4 SSD, Wi-Fi 6, and NitroSense dynamic fan management."
      });
    } else {
      // Premium / Specific Match
      demoList.push({
        id: `demo-lap-${Date.now()}-1`,
        title: `Lenovo Legion Pro 5i AI-Powered Laptop • Core i7-14700HX • RTX 4070 8GB (140W) • 240Hz WQXGA • 32GB DDR5 • 1TB SSD`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: budget ? Math.min(budget - 2000, 124990) : 124990,
        originalPrice: 169990,
        discount: 26,
        rating: 4.9,
        reviewsCount: 16800,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Onyx Grey with Legion Lightbar"],
        sizes: ["16-inch WQXGA (2560x1600) 240Hz 500 nits HDR400"],
        tags: ["laptop", "gaming laptop", "lenovo", "legion", "rtx 4070", "i7", "32gb ram", "coding", "electronics"],
        images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80"],
        fabric: "Anodized Aerospace Aluminum Chassis + Coldfront 5.0 Thermal System",
        seller: { name: "Lenovo Legion Flagship Store", rating: 4.9 },
        description: "Intel Core i7-14700HX (20 Cores, 28 Threads, 5.5GHz Turbo), NVIDIA GeForce RTX 4070 8GB GDDR6 (140W TGP), 32GB Dual-Channel DDR5 5600MHz RAM, 1TB Gen4 NVMe SSD, Lenovo LA1 AI chip tuning, and 80Wh battery."
      });
      demoList.push({
        id: `demo-lap-${Date.now()}-2`,
        title: `ASUS ROG Zephyrus G16 OLED Ultra-Slim • Intel Core Ultra 9 185H • RTX 4070 • 2.5K 240Hz OLED (0.2ms) • 32GB LPDDR5X • 1TB SSD`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: budget ? Math.min(budget - 1500, 149990) : 149990,
        originalPrice: 209990,
        discount: 28,
        rating: 4.9,
        reviewsCount: 8400,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Eclipse Grey with Slash Lighting", "Platinum White"],
        sizes: ["16-inch ROG Nebula OLED 240Hz 0.2ms (100% DCI-P3)"],
        tags: ["laptop", "asus", "rog", "zephyrus", "oled", "core ultra 9", "rtx 4070", "32gb ram", "slim laptop", "electronics"],
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80"],
        fabric: "CNC Precision Machined Aluminium Unibody (1.85 kg, 1.49 cm Thin)",
        seller: { name: "ASUS Official ROG Hub", rating: 4.9 },
        description: "Intel Core Ultra 9 185H with dedicated AI NPU, NVIDIA RTX 4070 8GB GDDR6, 16\" 2.5K 240Hz OLED Display with G-SYNC, 32GB LPDDR5X 7467MHz RAM, 1TB Gen4 SSD, 6-Speaker Dolby Atmos sound system, and 90Wh fast charge battery."
      });
      demoList.push({
        id: `demo-lap-${Date.now()}-3`,
        title: `HP OMEN 16 High-Performance Creator & Esports Laptop • Ryzen 9 7940HS • RTX 4060 8GB • 165Hz QHD • 16GB DDR5 • 1TB SSD`,
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Laptops & Computers",
        gender: "All",
        price: budget ? Math.min(budget - 3000, 94990) : 94990,
        originalPrice: 134990,
        discount: 30,
        rating: 4.8,
        reviewsCount: 11400,
        freeDelivery: true,
        infinityMall: true,
        colors: ["Shadow Black Matte"],
        sizes: ["16.1-inch QHD 165Hz IPS Display (100% sRGB)"],
        tags: ["laptop", "hp", "omen", "ryzen 9", "rtx 4060", "gaming", "creator laptop", "electronics"],
        images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80"],
        fabric: "OMEN Tempest Cooling Architecture with IR Thermopile Sensor",
        seller: { name: "HP OMEN Official Store", rating: 4.8 },
        description: "AMD Ryzen 9 7940HS Octa-Core Processor, NVIDIA RTX 4060 8GB, 16GB DDR5 5600MHz RAM, 1TB PCIe NVMe TLC M.2 SSD, Bang & Olufsen tuned quad speakers, and 83Wh battery."
      });
    }
  }

  // PERFUMES & FRAGRANCES PROTOTYPES
  if (q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("scent") || q.includes("cologne")) {
    demoList.push({
      id: `demo-perf-${Date.now()}-1`,
      title: "Royal Cambodian Oud & Smoked Amber 100ml Eau De Parfum (24H Long-Stay Beast Mode Projection)",
      mainCategory: "Beauty & Health",
      category: "beauty-health",
      subCategory: "Fragrances",
      gender: "Men",
      price: budget ? Math.min(budget - 50, 499) : 499,
      originalPrice: 1999,
      discount: 75,
      rating: 4.9,
      reviewsCount: 38200,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Crystal Amber Heavy Glass Bottle"],
      sizes: ["100ml Vaporisateur EDP Spray"],
      tags: ["perfume", "oud", "fragrance", "cologne", "edp", "attar", "luxury", "beauty"],
      images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&auto=format&fit=crop&q=80"],
      fabric: "French Essential Perfume Oils (Concentration 25% EDP)",
      seller: { name: "Maison De Parfum", rating: 4.9 },
      description: "Rich Cambodian Agarwood heart notes with cardamom, bergamot top notes and smoky leather amber base notes. 24-hour beast-mode projection."
    });
    demoList.push({
      id: `demo-perf-${Date.now()}-2`,
      title: "French Vanilla & Madagascan Orchid 100ml Luxury Eau De Parfum (EDP) for Women",
      mainCategory: "Beauty & Health",
      category: "beauty-health",
      subCategory: "Fragrances",
      gender: "Women",
      price: budget ? Math.min(budget - 50, 449) : 449,
      originalPrice: 1899,
      discount: 76,
      rating: 4.8,
      reviewsCount: 29100,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Blush Pink Frosted Bottle"],
      sizes: ["100ml Spray"],
      tags: ["perfume", "fragrance", "women perfume", "vanilla", "floral", "edp", "beauty"],
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=80"],
      fabric: "Pure Botanical Blossom Distillates + Warm Vanilla Absolute",
      seller: { name: "Atelier Paris Fragrances", rating: 4.8 },
      description: "Enchanting warm caramel vanilla, white orchid, and jasmine notes with long-lasting all-day sillage."
    });
  }

  // KITCHEN APPLIANCES PROTOTYPES
  if (q.includes("air fryer") || q.includes("fryer") || q.includes("blender") || q.includes("mixer") || q.includes("coffee") || q.includes("kettle") || q.includes("induction")) {
    demoList.push({
      id: `demo-kitch-${Date.now()}-1`,
      title: "5.5L Digital Touchscreen Air Fryer (1500W, Rapid 360° Air Circulation, 8 One-Touch Presets)",
      mainCategory: "Home & Kitchen",
      category: "home-kitchen",
      subCategory: "Kitchen & Dining",
      gender: "All",
      price: budget ? Math.min(budget - 100, 1899) : 1899,
      originalPrice: 6499,
      discount: 71,
      rating: 4.8,
      reviewsCount: 26800,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Glossy Piano Black with Rose Gold Trim"],
      sizes: ["5.5L Family Capacity"],
      tags: ["air fryer", "kitchen appliance", "fryer", "healthy cooking", "kitchen"],
      images: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=80"],
      fabric: "BPA-Free Non-Stick Ceramic Coated Basket + Stainless Steel Heating Coil",
      seller: { name: "ChefPro Kitchen Innovations", rating: 4.8 },
      description: "Cooks crispy French fries, samosas, chicken, and paneer with up to 90% less oil. Features digital LED touch display and 80°C to 200°C precision temp control."
    });
    demoList.push({
      id: `demo-kitch-${Date.now()}-2`,
      title: "1000W High-Speed Nutri-Blender & Smoothie Maker with 3 Tritan Jars & 6-Blade Extractor",
      mainCategory: "Home & Kitchen",
      category: "home-kitchen",
      subCategory: "Kitchen & Dining",
      gender: "All",
      price: budget ? Math.min(budget - 100, 999) : 999,
      originalPrice: 3499,
      discount: 71,
      rating: 4.7,
      reviewsCount: 19400,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Metallic Gunmetal Grey"],
      sizes: ["1000W Motor + 3 Jars (1000ml, 700ml, 400ml)"],
      tags: ["blender", "mixer", "smoothie maker", "kitchen", "juicer"],
      images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&auto=format&fit=crop&q=80"],
      fabric: "Pure Copper Motor + Food-Grade 304 Stainless Steel Blades",
      seller: { name: "NutriLife Appliances", rating: 4.7 },
      description: "Pulverizes tough nuts, seeds, and smoothies in seconds at 22,000 RPM speed with travel-ready sip-and-go lids."
    });
  }

  // GYM & FITNESS PROTOTYPES
  if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("yoga") || q.includes("massage gun") || q.includes("workout")) {
    demoList.push({
      id: `demo-fit-${Date.now()}-1`,
      title: "Deep Tissue Percussion Muscle Massage Gun with 6 Speed Heads & LCD Touch Screen",
      mainCategory: "Fitness & Sports",
      category: "home-kitchen",
      subCategory: "Gym & Fitness",
      gender: "All",
      price: budget ? Math.min(budget - 50, 799) : 799,
      originalPrice: 2999,
      discount: 73,
      rating: 4.8,
      reviewsCount: 24500,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Stealth Carbon Black"],
      sizes: ["Massager + 6 Interchangeable Heads + Travel Case"],
      tags: ["massage gun", "gym", "fitness", "muscle relief", "workout", "sports"],
      images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=80"],
      fabric: "Brushless Quiet High-Torque Motor + Ergonomic Non-Slip Grip",
      seller: { name: "FitPro Sports India", rating: 4.8 },
      description: "Delivers 3200 percussions per minute to relieve muscle soreness, lactic acid buildup, and speed up post-workout recovery."
    });
    demoList.push({
      id: `demo-fit-${Date.now()}-2`,
      title: "High-Density 6mm Anti-Tear Dual-Color TPE Yoga Mat with Body Alignment Lines",
      mainCategory: "Fitness & Sports",
      category: "home-kitchen",
      subCategory: "Yoga & Cardio",
      gender: "All",
      price: budget ? Math.min(budget - 50, 399) : 399,
      originalPrice: 1499,
      discount: 73,
      rating: 4.7,
      reviewsCount: 18200,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Teal & Grey", "Purple & Pink"],
      sizes: ["6mm Extra Thick (72 x 24 Inches) with Carry Strap"],
      tags: ["yoga mat", "gym", "fitness", "yoga", "exercise mat", "workout"],
      images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80"],
      fabric: "Eco-Friendly Non-Slip High-Density TPE Material",
      seller: { name: "FitPro Sports India", rating: 4.7 },
      description: "Superior cushioning for joints, laser-engraved alignment lines, moisture-resistant waterproof surface, and anti-slip ribbed backing."
    });
  }

  // AUDIO & HEADPHONES PROTOTYPES
  if (q.includes("headphone") || q.includes("earphone") || q.includes("earbud") || q.includes("tws") || q.includes("soundbar") || q.includes("speaker") || q.includes("audio")) {
    demoList.push({
      id: `demo-aud-${Date.now()}-1`,
      title: "Hybrid Active Noise Cancelling (ANC 35dB) Wireless Over-Ear Headphones with 50H Battery & Hi-Res Audio",
      mainCategory: "Electronics",
      category: "electronics",
      subCategory: "Audio & Wearables",
      gender: "All",
      price: budget ? Math.min(budget - 100, 1299) : 1299,
      originalPrice: 4999,
      discount: 74,
      rating: 4.8,
      reviewsCount: 31200,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Midnight Matte Black", "Silver Mist"],
      sizes: ["Adjustable Memory Foam Earcups"],
      tags: ["headphones", "anc", "wireless headphones", "bluetooth", "audio", "hi-res"],
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80"],
      fabric: "Ultra-Soft Protein Leather + Memory Foam Cushions",
      seller: { name: "Acoustic Labs Audio", rating: 4.8 },
      description: "40mm custom titanium drivers, Hybrid ANC up to 35dB, Transparency Mode, and 50-hour battery life with fast Type-C charge."
    });
    demoList.push({
      id: `demo-aud-${Date.now()}-2`,
      title: "Low Latency 40ms ANC True Wireless Earbuds with 4-Mic ENC & Spatial 3D Audio",
      mainCategory: "Electronics",
      category: "electronics",
      subCategory: "Audio & Wearables",
      gender: "All",
      price: budget ? Math.min(budget - 50, 549) : 549,
      originalPrice: 2499,
      discount: 78,
      rating: 4.7,
      reviewsCount: 41800,
      freeDelivery: true,
      infinityMall: true,
      colors: ["Phantom Black", "Pearl White"],
      sizes: ["Standard In-Ear with 3 Ear-Tip Sizes"],
      tags: ["earbuds", "tws", "wireless earphones", "anc earbuds", "bluetooth", "audio"],
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80"],
      fabric: "IPX5 Sweatproof ABS Matte Polymer + Magnetic Charging Case",
      seller: { name: "Sonic Wave Technologies", rating: 4.7 },
      description: "13mm graphene drivers, Quad-Mic AI ENC for crystal calls, 40ms gaming mode, and 36-hour total battery life."
    });
  }

  return demoList;
}

// Generate curated Related Products with "whyBuy" reasoning explaining why they should be added
export function getRelatedProductsForCategory(query = "", mainProducts = []) {
  const q = query.toLowerCase();

  // 1. LAPTOPS & COMPUTERS RELATED ADDONS
  if (q.includes("laptop") || q.includes("computer") || q.includes("notebook") || q.includes("macbook") || q.includes("gaming") || (mainProducts[0] && mainProducts[0].subCategory?.includes("Laptop"))) {
    return [
      {
        id: "rel-lap-1",
        title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI, Ergonomic Lightweight Shell)",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Gaming & PC Gear",
        price: 399,
        originalPrice: 1499,
        discount: 73,
        rating: 4.7,
        reviewsCount: 38400,
        images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Laptop trackpads are slow and cause wrist fatigue during extended coding or gaming. An ergonomic 7200 DPI optical mouse gives you pixel-perfect accuracy, tactile feedback, and programmable shortcuts.",
        benefitTag: "Essential Precision & Ergonomics"
      },
      {
        id: "rel-lap-2",
        title: "Aluminum Dual-Turbo Fan RGB Laptop Cooling Pad (2800 RPM Silent Turbo)",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Gaming & PC Gear",
        price: 599,
        originalPrice: 1999,
        discount: 70,
        rating: 4.8,
        reviewsCount: 19200,
        images: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Laptops get warm under heavy multitasking, compilation, and high-FPS gaming. This dual-turbo cooling stand drops internal temperatures by up to 15°C to prevent thermal throttling and protect hardware lifespan.",
        benefitTag: "Thermal Protection & Boost"
      },
      {
        id: "rel-lap-3",
        title: "Compact 60% RGB Mechanical Gaming Keyboard (Blue Switches, Type-C Detachable)",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Gaming & PC Gear",
        price: 799,
        originalPrice: 2499,
        discount: 68,
        rating: 4.6,
        reviewsCount: 14500,
        images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Laptop membrane keys have shallow travel and wear down quickly. This mechanical keyboard gives satisfying tactile click feedback, anti-ghosting response, and frees up desk space.",
        benefitTag: "Tactile Typing & Desk Comfort"
      }
    ];
  }

  // 2. SMARTPHONES & MOBILE ACCESSORIES
  if (q.includes("phone") || q.includes("smartphone") || q.includes("mobile") || q.includes("5g") || (mainProducts[0] && mainProducts[0].subCategory?.includes("Mobile"))) {
    return [
      {
        id: "rel-ph-1",
        title: "65W GaN Turbo Fast Charger with Braided 100W Type-C Cable",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Mobile Accessories",
        price: 299,
        originalPrice: 1299,
        discount: 77,
        rating: 4.8,
        reviewsCount: 28900,
        images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Most modern smartphones do not include a fast wall adapter in the box. This compact GaN charger charges your phone 3x faster (0 to 80% in 22 mins) without overheating the battery.",
        benefitTag: "3x Faster Safe Charging"
      },
      {
        id: "rel-ph-2",
        title: "9H Hardness Edge-to-Edge HD Tempered Glass Screen Protector (Set of 2)",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Mobile Accessories",
        price: 149,
        originalPrice: 599,
        discount: 75,
        rating: 4.7,
        reviewsCount: 42100,
        images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Replacing a cracked AMOLED display costs up to 40% of the phone's price. This 9H shatterproof glass absorbs drop impacts and resists fingerprints with zero touch delay.",
        benefitTag: "Screen Damage Protection"
      },
      {
        id: "rel-ph-3",
        title: "Wireless Bluetooth 5.3 Deep Bass Neckband with Environmental Noise Cancellation",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Audio & Wearables",
        price: 299,
        originalPrice: 1299,
        discount: 77,
        rating: 4.6,
        reviewsCount: 44300,
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Modern smartphones have removed the 3.5mm headphone jack. This 60-hour battery neckband delivers crystal-clear noise-cancelled calls and deep bass audio.",
        benefitTag: "Crystal Clear Audio & Calls"
      }
    ];
  }

  // 3. APPAREL & CLOTHING
  if (q.includes("tshirt") || q.includes("t-shirt") || q.includes("shirt") || q.includes("jeans") || q.includes("cargo") || (mainProducts[0] && mainProducts[0].category === "clothing")) {
    return [
      {
        id: "rel-cl-1",
        title: "6-Pocket Tactical Heavyweight Military Cargo Pants",
        mainCategory: "Clothing",
        category: "clothing",
        subCategory: "Bottomwear",
        price: 399,
        originalPrice: 1499,
        discount: 73,
        rating: 4.7,
        reviewsCount: 16700,
        images: ["https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Pairing oversized or relaxed tees with heavyweight cargo pants creates a complete streetwear silhouette with practical deep utility pockets.",
        benefitTag: "Streetwear Complete Look"
      },
      {
        id: "rel-cl-2",
        title: "High-Rebound Air-Cushion Walking & Running Sneakers",
        mainCategory: "Jewellery & Accessories",
        category: "footwear",
        subCategory: "Footwear",
        price: 299,
        originalPrice: 1299,
        discount: 77,
        rating: 4.6,
        reviewsCount: 31200,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "These shock-absorbing sneakers elevate casual and sporty outfits while delivering cloud-soft cushioning for all-day comfort.",
        benefitTag: "All-Day Foot Cushioning"
      }
    ];
  }

  // 4. SAREES & ETHNIC WEAR
  if (q.includes("saree") || q.includes("kurti") || q.includes("lehenga") || q.includes("ethnic") || (mainProducts[0] && mainProducts[0].category === "women-ethnic")) {
    return [
      {
        id: "rel-eth-1",
        title: "Traditional 24K Gold Plated Temple Choker Jewellery Set with Matching Earrings",
        mainCategory: "Jewellery & Accessories",
        category: "jewellery-accessories",
        subCategory: "Jewellery",
        price: 249,
        originalPrice: 1499,
        discount: 83,
        rating: 4.8,
        reviewsCount: 19400,
        images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Festive outfits and sarees look incomplete without matching jewelry. This 24K gold plated choker set gives a regal, authentic bridal look at a fraction of fine gold prices.",
        benefitTag: "Royal Festive Styling"
      },
      {
        id: "rel-eth-2",
        title: "Handcrafted Zari Embroidered Silk Envelope Clutch & Party Potli",
        mainCategory: "Jewellery & Accessories",
        category: "jewellery-accessories",
        subCategory: "Women Bags",
        price: 199,
        originalPrice: 899,
        discount: 78,
        rating: 4.7,
        reviewsCount: 11800,
        images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Ethnic wear rarely has functional pockets. This embellished clutch comfortably holds your phone, keys, and makeup while matching the golden zari accents of your attire.",
        benefitTag: "Festive Utility Accessory"
      }
    ];
  }

  // 5. FOOTWEAR
  if (q.includes("shoe") || q.includes("sneaker") || q.includes("footwear") || q.includes("sandal") || (mainProducts[0] && mainProducts[0].subCategory?.includes("Footwear"))) {
    return [
      {
        id: "rel-ft-1",
        title: "Orthopedic Memory Foam Cloud Insoles (Set of 2 Pairs, Trim-to-Fit)",
        mainCategory: "Jewellery & Accessories",
        category: "footwear",
        subCategory: "Footwear",
        price: 149,
        originalPrice: 699,
        discount: 79,
        rating: 4.8,
        reviewsCount: 27800,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Factory insoles flatten quickly. Adding memory foam insoles gives tailored arch support, absorbs heel impact shock, and prevents foot pain during all-day walking.",
        benefitTag: "Custom Arch Support"
      },
      {
        id: "rel-ft-2",
        title: "Anti-Odor Breathable Moisture-Wicking Cotton Ankle Socks (Pack of 3 Pairs)",
        mainCategory: "Clothing",
        category: "clothing",
        subCategory: "Bottomwear",
        price: 129,
        originalPrice: 499,
        discount: 74,
        rating: 4.7,
        reviewsCount: 18900,
        images: ["https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Combed cotton socks with mesh ventilation prevent sweat buildup, blisters, and shoe odors during gym sessions or daily commutes.",
        benefitTag: "Blister & Odor Prevention"
      }
    ];
  }

  // 6. PERFUMES & FRAGRANCES
  if (q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("cologne") || (mainProducts[0] && mainProducts[0].subCategory === "Fragrances")) {
    return [
      {
        id: "rel-perf-1",
        title: "Men's Luxury Chronograph Quartz Waterproof Stainless Steel Sports Watch",
        mainCategory: "Jewellery & Accessories",
        category: "jewellery-accessories",
        subCategory: "Women Accessories",
        price: 499,
        originalPrice: 2499,
        discount: 80,
        rating: 4.8,
        reviewsCount: 26300,
        images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "A bold signature fragrance paired with a precision steel chronograph watch creates an undeniably sharp, executive impression.",
        benefitTag: "Executive Styling Pair"
      },
      {
        id: "rel-perf-2",
        title: "100% Genuine Top-Grain Leather Bifold Slim Wallet with RFID Blocking",
        mainCategory: "Jewellery & Accessories",
        category: "jewellery-accessories",
        subCategory: "Women Accessories",
        price: 249,
        originalPrice: 999,
        discount: 75,
        rating: 4.8,
        reviewsCount: 37900,
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Keep your daily essentials organized in authentic top-grain leather that matches the rich sophistication of luxury perfumes.",
        benefitTag: "Everyday Luxury Companion"
      }
    ];
  }

  // 7. KITCHEN APPLIANCES (AIR FRYER, BLENDER, COFFEE)
  if (q.includes("air fryer") || q.includes("blender") || q.includes("mixer") || q.includes("coffee") || q.includes("kettle") || (mainProducts[0] && (mainProducts[0].subCategory === "Kitchen & Dining" || mainProducts[0].tags.some(t => t.includes("air fryer") || t.includes("blender"))))) {
    return [
      {
        id: "rel-kitch-1",
        title: "Airtight Modular Kitchen Storage Glass Jars with Bamboo Lids (Set of 6)",
        mainCategory: "Home & Kitchen",
        category: "home-kitchen",
        subCategory: "Kitchen & Dining",
        price: 369,
        originalPrice: 1299,
        discount: 71,
        rating: 4.7,
        reviewsCount: 19400,
        images: ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Keep snacks, dry fruits, spices, and smoothie powders fresh in moisture-proof borosilicate glass canisters next to your appliances.",
        benefitTag: "Pantry Organization"
      },
      {
        id: "rel-kitch-2",
        title: "1000W High-Speed Nutri-Blender & Smoothie Maker with 3 Jars",
        mainCategory: "Home & Kitchen",
        category: "home-kitchen",
        subCategory: "Kitchen & Dining",
        price: 999,
        originalPrice: 3499,
        discount: 71,
        rating: 4.7,
        reviewsCount: 19400,
        images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Pair your air fryer with a high-torque nutri-blender to prepare complete healthy meals and protein fruit smoothies with ease.",
        benefitTag: "Complete Kitchen Setup"
      }
    ];
  }

  // 8. GYM, FITNESS & SPORTS
  if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("yoga") || q.includes("massage gun") || q.includes("workout") || (mainProducts[0] && mainProducts[0].mainCategory === "Fitness & Sports")) {
    return [
      {
        id: "rel-fit-1",
        title: "Deep Tissue Percussion Muscle Massage Gun (6 Speed Heads, LCD Display)",
        mainCategory: "Fitness & Sports",
        category: "home-kitchen",
        subCategory: "Gym & Fitness",
        price: 799,
        originalPrice: 2999,
        discount: 73,
        rating: 4.8,
        reviewsCount: 24500,
        images: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Heavy gym lifts and cardio create muscle tightness. Using a percussion massage gun right after workouts increases blood circulation and prevents DOMS stiffness.",
        benefitTag: "Rapid Muscle Recovery"
      },
      {
        id: "rel-fit-2",
        title: "High-Density 6mm Anti-Tear Dual-Color TPE Yoga Mat with Alignment Lines",
        mainCategory: "Fitness & Sports",
        category: "home-kitchen",
        subCategory: "Yoga & Cardio",
        price: 399,
        originalPrice: 1499,
        discount: 73,
        rating: 4.7,
        reviewsCount: 18200,
        images: ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Provides vital joint cushioning on hard floors for floor exercises, stretching, abdominal crunches, and yoga flows.",
        benefitTag: "Joint Cushioning & Balance"
      }
    ];
  }

  // 9. AUDIO, HEADPHONES & TWS
  if (q.includes("headphone") || q.includes("earbud") || q.includes("tws") || q.includes("soundbar") || q.includes("speaker") || (mainProducts[0] && mainProducts[0].subCategory?.includes("Audio"))) {
    return [
      {
        id: "rel-aud-1",
        title: "20000mAh 65W Fast PD Metal Power Bank for Laptops, Tablets & Headphones",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Mobile Accessories",
        price: 999,
        originalPrice: 3499,
        discount: 71,
        rating: 4.8,
        reviewsCount: 22400,
        images: ["https://images.unsplash.com/photo-1609592426815-56d11f7c1341?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Never let your wireless headphones or phone run out of battery during flights, daily travel, or outdoor study sessions.",
        benefitTag: "Uninterrupted Battery Backup"
      },
      {
        id: "rel-aud-2",
        title: "65W GaN Turbo Fast Charger Adapter with Braided Type-C Cable",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Mobile Accessories",
        price: 299,
        originalPrice: 1299,
        discount: 77,
        rating: 4.8,
        reviewsCount: 28900,
        images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Quickly recharge your headphones and earbuds in just 10 minutes before heading out.",
        benefitTag: "10-Min Fast Top-Up"
      }
    ];
  }

  // 10. BACKPACKS & LUGGAGE
  if (q.includes("backpack") || q.includes("luggage") || q.includes("trolley") || q.includes("duffel") || q.includes("travel bag") || (mainProducts[0] && mainProducts[0].tags.some(t => t.includes("backpack") || t.includes("luggage")))) {
    return [
      {
        id: "rel-bag-1",
        title: "20000mAh 65W Fast PD Metal Power Bank with Multi-Port Output",
        mainCategory: "Electronics",
        category: "electronics",
        subCategory: "Mobile Accessories",
        price: 999,
        originalPrice: 3499,
        discount: 71,
        rating: 4.8,
        reviewsCount: 22400,
        images: ["https://images.unsplash.com/photo-1609592426815-56d11f7c1341?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Plugs into your backpack's external charging port to keep your phone, earbuds, and devices powered on all your travels.",
        benefitTag: "Travel Charging Companion"
      },
      {
        id: "rel-bag-2",
        title: "100% Genuine Vintage Top-Grain Leather Bifold Slim Wallet with RFID Blocking",
        mainCategory: "Jewellery & Accessories",
        category: "jewellery-accessories",
        subCategory: "Women Accessories",
        price: 249,
        originalPrice: 999,
        discount: 75,
        rating: 4.8,
        reviewsCount: 37900,
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Organize currency, IDs, and credit cards with RFID shielding against contactless theft inside your travel bag.",
        benefitTag: "Secure Travel Wallet"
      }
    ];
  }

  // 11. CAR & BIKE AUTOMOTIVE ACCESSORIES
  if (q.includes("car") || q.includes("bike") || q.includes("automotive") || q.includes("motorcycle") || (mainProducts[0] && mainProducts[0].mainCategory === "Automotive")) {
    return [
      {
        id: "rel-auto-1",
        title: "High Power 120W Portable Wireless Car Vacuum Cleaner with HEPA Filter",
        mainCategory: "Automotive",
        category: "automotive",
        subCategory: "Car Accessories",
        price: 349,
        originalPrice: 1299,
        discount: 73,
        rating: 4.7,
        reviewsCount: 15400,
        images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Car seats and AC vents trap dust and crumbs. This high-suction portable vacuum keeps your vehicle interior hygienic and spotless without costly detailing trips.",
        benefitTag: "Spotless Interior Hygiene"
      },
      {
        id: "rel-auto-2",
        title: "Touchscreen Hard Knuckle Protective Biker Riding Gloves",
        mainCategory: "Automotive",
        category: "automotive",
        subCategory: "Bike Accessories & Gear",
        price: 299,
        originalPrice: 999,
        discount: 70,
        rating: 4.8,
        reviewsCount: 21300,
        images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=700&auto=format&fit=crop&q=80"],
        whyBuy: "Protects hands against road debris and impact while conductive fingertips allow you to navigate GPS and take calls without removing your gloves.",
        benefitTag: "Essential Rider Safety"
      }
    ];
  }

  // Default Universal Add-ons
  return [
    {
      id: "rel-gen-1",
      title: "Wireless Bluetooth 5.3 Deep Bass Earphones with Fast Charging",
      mainCategory: "Electronics",
      category: "electronics",
      subCategory: "Audio & Wearables",
      price: 299,
      originalPrice: 1299,
      discount: 77,
      rating: 4.6,
      reviewsCount: 44300,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80"],
      whyBuy: "A high-reliability wireless audio accessory with 60-hour playtime and ENC noise-cancelling for seamless calls and music on the go.",
      benefitTag: "Everyday Audio Companion"
    },
    {
      id: "rel-gen-2",
      title: "65W Multi-Port Fast GaN Wall Charger Adapter",
      mainCategory: "Electronics",
      category: "electronics",
      subCategory: "Mobile Accessories",
      price: 299,
      originalPrice: 1199,
      discount: 75,
      rating: 4.8,
      reviewsCount: 28900,
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=80"],
      whyBuy: "Charges multiple devices simultaneously at high speed with smart surge protection.",
      benefitTag: "Universal Fast Charging"
    }
  ];
}

// Helper: Detect user language (Hindi / Hinglish / English)
export function isHindiOrHinglish(text = "") {
  if (!text) return false;
  const q = text.toLowerCase();
  const hindiIndicators = [
    'hai', 'hain', 'kya', 'muje', 'mujhe', 'konsa', 'kaunsa', 'bhai', 'bro', 'lena', 'chahiye',
    'dikhao', 'kaise', 'bolo', 'achha', 'acha', 'badhiya', 'sasta', 'mehenga', 'kharidna',
    'tere', 'mere', 'apne', 'karke', 'batao', 'bataye', 'bataiye', 'dekh', 'thike', 'theek', 'le lu',
    'lu', 'hoga', 'hogi', 'mil', 'sakta', 'skta', 'kitna', 'kitne', 'sahi', 'paise', 'rupaye', 'rupay',
    'likho', 'banao', 'dhoondho', 'dhoondo', 'hatao', 'nikalo', 'shukriya', 'kripya', 'kaam', 'hazar', 'lakh'
  ];
  const hasDevanagari = /[\u0900-\u097F]/.test(q);
  const hasHinglish = hindiIndicators.some(w => new RegExp(`\\b${w}\\b`, 'i').test(q));
  return hasDevanagari || hasHinglish;
}

// Generate Dynamic Multi-Turn Category-Specific Questionnaire with MCQ, Multi-Select, No Preference & Custom Input
export function getDynamicQuestionnaireForCategory(categoryOrQuery = "", previousAnswers = {}, accumulatedRequirements = {}) {
  const q = (categoryOrQuery || "").toLowerCase();
  const sessionId = accumulatedRequirements?.requirementSessionId || `req-sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const answered = { ...previousAnswers, ...(accumulatedRequirements || {}) };

  // 1. LAPTOPS & COMPUTERS
  if (q.includes("laptop") || q.includes("computer") || q.includes("macbook") || q.includes("pc")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "laptops",
        id: "usage",
        title: "Select Laptop Priorities & Specifications:",
        text: "What will you mainly use the laptop for?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "Gaming & High-FPS Esports (Dedicated RTX GPU, 144Hz IPS)", value: "Gaming & High-FPS Esports" },
          { id: "opt-2", label: "Coding, Software Dev & Multitasking (16GB RAM, Fast CPU)", value: "Coding & Software Dev" },
          { id: "opt-3", label: "Office & College Productivity (Long Battery, Lightweight)", value: "Office & Productivity" },
          { id: "opt-4", label: "4K Video Editing & Graphic Design (OLED Display, DCI-P3)", value: "Video Editing & Graphic Design" },
          { id: "opt-5", label: "Budget-Friendly Student Essentials (Under ₹40,000)", value: "Budget Student Laptop" },
          { id: "opt-6", label: "No Preference", value: "No Preference" },
          { id: "opt-7", label: "Custom Requirement", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Tell me your requirement (e.g. minimum 24GB RAM for Docker containers)..."
      };
    }

    const isGaming = JSON.stringify(answered).toLowerCase().includes("gaming");
    if (isGaming && !answered.gaming_tier) {
      return {
        requirementSessionId: sessionId,
        category: "laptops",
        id: "gaming_tier",
        title: "Select Gaming Performance Level:",
        text: "Which gaming performance level do you prefer?",
        type: "single_select",
        options: [
          { id: "opt-g1", label: "Casual Gaming (Esports, Valorant, GTA V, CS2)", value: "Casual Gaming" },
          { id: "opt-g2", label: "1080p High-FPS (RTX 3050 / RTX 4050 6GB)", value: "1080p Gaming" },
          { id: "opt-g3", label: "High-End 1440p (RTX 4060 8GB / RTX 4070)", value: "High-End 1440p Gaming" },
          { id: "opt-g4", label: "AAA / Ultra Heavy Esports (RTX 4080 / 4090)", value: "AAA Ultra Gaming" },
          { id: "opt-g5", label: "No Preference", value: "No Preference" },
          { id: "opt-g6", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Specific GPU or TGP requirement..."
      };
    }

    if (!answered.ram) {
      return {
        requirementSessionId: sessionId,
        category: "laptops",
        id: "ram",
        title: "Select Preferred RAM Capacity:",
        text: "What RAM capacity do you need?",
        type: "single_select",
        options: [
          { id: "opt-r1", label: "8GB RAM (Basic Everyday Tasks)", value: "8GB" },
          { id: "opt-r2", label: "16GB Fast DDR5 RAM (Recommended for Gaming & Coding)", value: "16GB" },
          { id: "opt-r3", label: "32GB High-Speed RAM (Heavy Multitasking & VMs)", value: "32GB" },
          { id: "opt-r4", label: "64GB+ Extreme RAM (AI/ML & Rendering)", value: "64GB+" },
          { id: "opt-r5", label: "No Preference", value: "No Preference" },
          { id: "opt-r6", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Specific RAM requirement (e.g. 24GB DDR5, expandable)..."
      };
    }

    if (!answered.budget && !answered.isBudgetActive) {
      return {
        requirementSessionId: sessionId,
        category: "laptops",
        id: "budget",
        title: "Select Approximate Budget Limit:",
        text: "What budget limit do you have in mind?",
        type: "single_select",
        options: [
          { id: "opt-b1", label: "Under ₹45,000 (Student Essentials)", value: "45000" },
          { id: "opt-b2", label: "₹50,000 - ₹75,000 (Mid-Range Sweet Spot)", value: "75000" },
          { id: "opt-b3", label: "₹75,000 - ₹1,00,000 (High-Performance Gaming)", value: "100000" },
          { id: "opt-b4", label: "₹1,00,000+ (Flagship Powerhouse)", value: "150000" },
          { id: "opt-b5", label: "Flexible Budget", value: "Flexible" },
          { id: "opt-b6", label: "Custom Budget", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Enter exact budget limit in Rupees (e.g. 80000)..."
      };
    }

    if (!answered.brand) {
      return {
        requirementSessionId: sessionId,
        category: "laptops",
        id: "brand",
        title: "Select Preferred Brand (Optional):",
        text: "Do you have any brand preference?",
        type: "single_select",
        options: [
          { id: "opt-br1", label: "Lenovo (LOQ, Legion, ThinkPad)", value: "Lenovo" },
          { id: "opt-br2", label: "ASUS (TUF Gaming, ROG, ZenBook)", value: "ASUS" },
          { id: "opt-br3", label: "HP (Victus, Pavilion, Omen)", value: "HP" },
          { id: "opt-br4", label: "Dell / Alienware", value: "Dell" },
          { id: "opt-br5", label: "Apple MacBook", value: "Apple" },
          { id: "opt-br6", label: "No Preference / Any Reliable Brand", value: "No Preference" },
          { id: "opt-br7", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Other brand or specific model series..."
      };
    }
  }

  // 2. SMARTPHONES & GADGETS
  if (/\b(?:phone|phones|mobile|mobiles|smartphone|smartphones|5g)\b/i.test(q) || q.includes("smartphone")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "phones",
        id: "usage",
        title: "Select Smartphone Priorities & Features:",
        text: "What are your top priorities for the phone?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "108MP Pro OIS Camera & Low-Light Photography", value: "108MP Pro Camera with OIS" },
          { id: "opt-2", label: "120Hz Curved AMOLED Display & 67W Turbo Charge", value: "120Hz AMOLED & Fast Charging" },
          { id: "opt-3", label: "High-Performance Gaming Chipset & Dual 5G Bands", value: "Gaming 5G Performance" },
          { id: "opt-4", label: "All-Day Long 5000mAh+ Battery Life", value: "Long Battery Life" },
          { id: "opt-5", label: "Budget Friendly All-Rounder (Under ₹12,000)", value: "Budget Smartphone" },
          { id: "opt-6", label: "No Preference", value: "No Preference" },
          { id: "opt-7", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Tell me any specific feature (e.g. clean Android, telephoto zoom)..."
      };
    }
  }

  // 3. AUDIO & HEADPHONES
  if (q.includes("headphone") || q.includes("earphone") || q.includes("earbud") || q.includes("tws") || q.includes("audio") || q.includes("soundbar") || q.includes("speaker")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "headphones",
        id: "usage",
        title: "Select Audio & Noise Cancellation Priorities:",
        text: "What type of audio gear and sound signature do you prefer?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "Hybrid 35dB Active Noise Cancellation (ANC Over-Ear)", value: "Hybrid ANC Over-Ear Headphones" },
          { id: "opt-2", label: "Low Latency 40ms Gaming TWS Earbuds with AI ENC", value: "Low Latency Gaming Earbuds" },
          { id: "opt-3", label: "60-Hour Long Battery Deep Bass Wireless Neckband", value: "60-Hour Long Battery Neckband" },
          { id: "opt-4", label: "Compact Bluetooth Party Speaker with RGB Lights", value: "Portable Party Speaker" },
          { id: "opt-5", label: "Value Audio Pick (Under ₹799)", value: "Value Audio Under ₹799" },
          { id: "opt-6", label: "No Preference", value: "No Preference" },
          { id: "opt-7", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Specific sound preference (e.g. dual pairing, hi-res LDAC audio)..."
      };
    }
  }

  // 4. FASHION & ETHNIC WEAR
  if (q.includes("saree") || q.includes("kurti") || q.includes("lehenga") || q.includes("ethnic") || q.includes("dress") || q.includes("fashion") || q.includes("shirt") || q.includes("clothing")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "fashion",
        id: "usage",
        title: "Select Style, Occasion & Fabric:",
        text: "Which style and occasion are you shopping for?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "Pure Banarasi Art Silk with Heavy Golden Zari Pallu", value: "Banarasi Silk Saree" },
          { id: "opt-2", label: "Embroidered Georgette Festive Lehenga Choli Set", value: "Festive Lehenga Choli" },
          { id: "opt-3", label: "Traditional Lucknowi Chikankari Pure Cotton Kurti", value: "Lucknowi Cotton Kurti" },
          { id: "opt-4", label: "Heavyweight 220 GSM Oversized Casual Streetwear", value: "Oversized Streetwear Fit" },
          { id: "opt-5", label: "Budget Steal Deals (Under ₹999)", value: "Festive Deals Under ₹999" },
          { id: "opt-6", label: "No Preference", value: "No Preference" },
          { id: "opt-7", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Specific color, occasion, or fabric preference..."
      };
    }
  }

  // 5. FOOTWEAR & SHOES
  if (q.includes("shoe") || q.includes("sneaker") || q.includes("running") || q.includes("footwear")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "footwear",
        id: "usage",
        title: "Select Footwear Type & Comfort:",
        text: "What type of footwear are you looking for?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "Air-Cushion Shock-Absorbing Running & Walking Shoes", value: "Air Cushion Running Shoes" },
          { id: "opt-2", label: "Trendy Chunky Streetwear Sneakers (All-Day Comfort)", value: "Streetwear Lifestyle Sneakers" },
          { id: "opt-3", label: "Classic Genuine Leather Formal Office Shoes", value: "Formal Leather Shoes" },
          { id: "opt-4", label: "Super Saver Casual Footwear (Under ₹699)", value: "Value Footwear Under ₹699" },
          { id: "opt-5", label: "No Preference", value: "No Preference" },
          { id: "opt-6", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Specific size, color, or activity..."
      };
    }
  }

  // 6. FITNESS & SPORTS
  if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("workout") || q.includes("massage gun") || q.includes("yoga")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "fitness",
        id: "usage",
        title: "Select Fitness & Training Gear:",
        text: "What workout equipment or accessories do you need?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "Solid Cast Iron Adjustable Home Gym Dumbbell Set", value: "Cast Iron Dumbbell Set" },
          { id: "opt-2", label: "Deep Tissue 3200 RPM Percussion Massage Gun (Muscle Relief)", value: "Deep Tissue Massage Gun" },
          { id: "opt-3", label: "6mm High-Density Non-Slip Body Alignment Yoga Mat", value: "Non-Slip Yoga Mat" },
          { id: "opt-4", label: "Complete Home Workout Starter Pack (Under ₹999)", value: "Home Fitness Gear Under ₹999" },
          { id: "opt-5", label: "No Preference", value: "No Preference" },
          { id: "opt-6", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Target weight, exercise type, or material..."
      };
    }
  }

  // 7. HOME & KITCHEN APPLIANCES
  if (q.includes("appliance") || q.includes("kitchen") || q.includes("air fryer") || q.includes("blender") || q.includes("mixer") || q.includes("kettle")) {
    if (!answered.usage && !answered.priorities?.length) {
      return {
        requirementSessionId: sessionId,
        category: "appliances",
        id: "usage",
        title: "Select Kitchen Appliance Priorities:",
        text: "What kitchen appliance features are you looking for?",
        type: "multi_select",
        options: [
          { id: "opt-1", label: "90% Oil-Free Rapid 360° Air Fryer (4L+ Capacity)", value: "Oil-Free Digital Air Fryer" },
          { id: "opt-2", label: "1000W High-Torque Nutrient Blender & Smoothie Maker", value: "High-Power Nutrient Blender" },
          { id: "opt-3", label: "Stainless Steel Fast-Boil Electric Kettle (1.8L)", value: "Electric Kettle" },
          { id: "opt-4", label: "Budget Kitchen Essentials (Under ₹1,499)", value: "Kitchen Essentials Under ₹1499" },
          { id: "opt-5", label: "No Preference", value: "No Preference" },
          { id: "opt-6", label: "Custom", value: "Custom" }
        ],
        allowCustom: true,
        customPlaceholder: "Capacity, wattage, or cooking presets..."
      };
    }
  }

  return null;
}

// Backward compatibility alias for existing test suites
export function getInteractiveQuestionnaireForCategory(userQuery = "") {
  return getDynamicQuestionnaireForCategory(userQuery, {}, {});
}


// Helper: Extract active shopping category from current query or recent conversation history
export function getActiveCategoryFromContext(userQuery = "", conversationHistory = []) {
  const q = (userQuery || "").toLowerCase();

  // 1. Direct match from current query
  if (q.includes("laptop") || q.includes("computer") || q.includes("macbook") || q.includes("pc")) return "laptops";
  if (q.includes("headphone") || q.includes("earphone") || q.includes("earbud") || q.includes("tws") || q.includes("soundbar") || q.includes("speaker") || q.includes("audio")) return "headphones";
  if (/\b(?:phone|phones|mobile|mobiles|smartphone|smartphones|5g)\b/i.test(q)) return "phones";
  if (q.includes("saree") || q.includes("kurti") || q.includes("lehenga") || q.includes("ethnic") || q.includes("shirt") || q.includes("tshirt") || q.includes("t-shirt") || q.includes("dress") || q.includes("clothing")) return "fashion";
  if (q.includes("shoe") || q.includes("shoes") || q.includes("sneaker") || q.includes("footwear")) return "footwear";
  if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("workout") || q.includes("yoga") || q.includes("massage gun")) return "fitness";
  if (q.includes("air fryer") || q.includes("blender") || q.includes("mixer") || q.includes("kettle") || q.includes("appliance") || q.includes("kitchen")) return "appliances";
  if (q.includes("watch") || q.includes("ghadi") || q.includes("smartwatch")) return "watches";
  if (q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("cologne")) return "fragrances";
  if (q.includes("backpack") || q.includes("bag") || q.includes("luggage") || q.includes("wallet")) return "bags";

  // 2. Look back in conversation history from newest to oldest
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      const text = (msg.text || msg.content || "").toLowerCase();
      if (text.includes("laptop") || text.includes("computer") || text.includes("macbook")) return "laptops";
      if (text.includes("headphone") || text.includes("earphone") || text.includes("earbud") || text.includes("tws") || text.includes("soundbar") || text.includes("audio")) return "headphones";
      if (/\b(?:phone|phones|mobile|mobiles|smartphone|smartphones|5g)\b/i.test(text)) return "phones";
      if (text.includes("saree") || text.includes("kurti") || text.includes("lehenga") || text.includes("ethnic") || text.includes("shirt") || text.includes("clothing")) return "fashion";
      if (text.includes("shoe") || text.includes("shoes") || text.includes("sneaker") || text.includes("footwear")) return "footwear";
      if (text.includes("gym") || text.includes("fitness") || text.includes("dumbbell") || text.includes("yoga")) return "fitness";
      if (text.includes("air fryer") || text.includes("blender") || text.includes("kitchen")) return "appliances";
      if (text.includes("watch") || text.includes("smartwatch")) return "watches";
      if (text.includes("perfume") || text.includes("fragrance") || text.includes("oud")) return "fragrances";
      if (text.includes("backpack") || text.includes("bag") || text.includes("luggage")) return "bags";
    }
  }

  return null;
}

// Helper: Check if user has already specified requirements or is responding to the questionnaire
export function hasUserSpecifiedRequirements(userQuery = "", conversationHistory = []) {
  const q = userQuery.toLowerCase().trim();

  // 0. User confirmation signal: "product confirm hai", "haan product confirm hai", "okay find it", "bas ab products dikhao"
  if (/\b(?:product\s*confirm\s*hai|confirm\s*hai|confirm\s*karo|haan\s*product\s*confirm\s*hai|haan\s*bhai\s*dikha|bas\s*ab\s*products\s*dikhao|requirements\s*complete|yes\s*this\s*is\s*what\s*i\s*want|okay\s*find\s*it|find\s*it\s*now|show\s*matches|show\s*products)\b/i.test(q)) {
    return true;
  }

  // 0B. Follow-up refinements: "show cheaper ones", "under 70k", "only hp", "better battery", "second one"
  if (/\b(?:show\s*cheaper|cheaper\s*ones|under\s*\d+|only\s+[a-z]+|better\s*battery|better\s*performance|first\s*one|second\s*one|third\s*one|fourth\s*one|this\s*one|that\s*one)\b/i.test(q)) {
    return true;
  }

  // If user is switching or introducing a broad category without concrete specs (e.g. "actually I want a smartphone", "laptop dikhao", "show me phones")
  const isBroadCategoryRequest = (
    /^(?:i\s*need|i\s*want|show\s*me|actually\s*i\s*want|actually|instead|mujhe|muje|mujhe\s*bhi)?\s*(?:a\s*|an\s*)?(?:laptop|laptops|computer|macbook|phone|phones|mobile|mobiles|smartphone|smartphones|5g|headphone|headphones|earphones|earbuds|tws|saree|sarees|kurti|kurtis|shoes|shoe|perfume|fragrance|watch|smartwatch|air\s*fryer|blender|gym|fitness|bag|backpack)(?:\s*(?:instead|chahiye|dikhao|leke\s*aao|please))?[.!?]*$/i.test(q)
  );
  if (isBroadCategoryRequest) {
    return false;
  }

  // 1. If query came from interactive questionnaire submission
  if (q.includes('|') || q.includes('under ₹') || q.includes('selected:') || q.includes('opt-') || q.includes('priority')) {
    return true;
  }

  // 2. Direct consultative advice question
  if (q.includes("konsa lu") || q.includes("kaunsa lu") || q.includes("tere hisab se") || q.includes("kya lena chahiye") || q.includes("suggest kar ek") || q.includes("konsa best") || q.includes("kaunsa best")) {
    return true;
  }

  // 3. If user query has multiple concrete specs (e.g. 16gb ram, rtx 4060, 50k gaming, banarasi silk)
  const concreteSpecKeywords = [
    '16gb', '32gb', '8gb', 'rtx', 'gtx', '4050', '4060', '4070', '4080', 'i5', 'i7', 'i9', 'ryzen', 'ssd', '512gb', '1tb', 'oled', '144hz', '240hz',
    'banarasi', 'georgette', 'chikankari', 'cotton', 'silk', 'anc', '35db', 'tws', 'dumbbell', 'cast iron', 'size 8', 'size 9', 'size 7',
    'gaming', 'esports', 'coding', 'software dev', 'video editing', 'multitasking', 'budget student'
  ];
  const specCount = concreteSpecKeywords.filter(w => q.includes(w)).length;
  const hasBudgetSpec = /\d+k|\d+\s*(?:hazar|thousand)|under\s*\d+|₹\d+/i.test(q);

  if (specCount >= 2 || (specCount >= 1 && hasBudgetSpec) || (hasBudgetSpec && (q.includes("gaming") || q.includes("coding") || q.includes("heavy") || q.includes("office") || q.includes("banarasi")))) {
    return true;
  }

  // 4. If conversation history shows category is active or questionnaire was already presented
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const lastAssistantMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant' || m.role === 'model');
    const wasQuestionnaireOrPromptAsked = lastAssistantMsg && (
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("priorit") ||
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("requirement") ||
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("specification") ||
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("questionnaire") ||
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("looking for") ||
      (lastAssistantMsg.message || lastAssistantMsg.text || "").toLowerCase().includes("options")
    );

    const hasPreferenceWords = specCount >= 1 || hasBudgetSpec || q.includes("gaming") || q.includes("coding") || q.includes("office") || q.includes("heavy") || q.includes("battery") || q.includes("camera") || q.includes("esport") || q.includes("student") || q.includes("work") || q.includes("budget");
    if (hasPreferenceWords || wasQuestionnaireOrPromptAsked) {
      return true;
    }
  }

  return false;
}

// Conversation State Machine Constants
export const ConversationState = {
  GREETING: 'GREETING',
  IDENTITY: 'IDENTITY',
  NON_COMMERCE: 'NON_COMMERCE',
  DISCOVERING_INTENT: 'DISCOVERING_INTENT',
  COLLECTING_REQUIREMENTS: 'COLLECTING_REQUIREMENTS',
  REQUIREMENTS_COMPLETE: 'REQUIREMENTS_COMPLETE',
  RETRIEVING_PRODUCTS: 'RETRIEVING_PRODUCTS',
  RECOMMENDING: 'RECOMMENDING',
  CART_ACTION: 'CART_ACTION',
  POLICY: 'POLICY',
  COUPONS: 'COUPONS',
  UNCLEAR: 'UNCLEAR'
};

// Helper: Detect conversational state and intent accurately
export function analyzeConversationState(userQuery = "", conversationHistory = [], cartContext = [], userProfile = {}) {
  const q = userQuery.toLowerCase().trim();

  // 1. Non-Commerce Scope Guard (Coding, Homework, Medical, Politics)
  if (isNonCommerceQuery(userQuery)) {
    return {
      state: ConversationState.NON_COMMERCE,
      intent: 'non_commerce',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 2. Fast Cart & Checkout Actions
  const isRemoveFromCart = (
    /\b(?:remove|delete|hatao|hata\s*do|nikal\s*do)\b/i.test(q) ||
    /\bcart\s*se\s*(?:hata|nikal)\b/i.test(q) ||
    /\bcancel\s*(?:item|cart|product|order)\b/i.test(q)
  ) && !q.includes("noise cancellation") && !q.includes("anc");

  const isShowCart = /\b(?:cart\s*dikhao|show\s*cart|view\s*cart|my\s*cart|cart\s*me\s*kya)\b/i.test(q);
  const isCheckout = /\b(?:checkout|payment|pay|order\s*book|order\s*place|buy\s*now)\b/i.test(q);

  if (isRemoveFromCart || isShowCart || isCheckout) {
    return {
      state: ConversationState.CART_ACTION,
      intent: isRemoveFromCart ? 'remove_from_cart' : (isShowCart ? 'show_cart' : 'checkout'),
      shoppingIntent: true,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 3. Identity / Capabilities ("Who are you", "kya kr skta hai tu", "aap kya kar sakte ho", "tell me about yourself")
  const isIdentity = (
    /\b(?:who\s*are\s*you|tell\s*me\s*about\s*yourself|aap\s*kaun\s*ho|tu\s*kaun\s*hai)\b/i.test(q) ||
    /\b(?:kya\s*(?:kar|kr)\s*(?:sakta|sakte|skta|skte)\s*(?:hai|ho|tu|aap)?)\b/i.test(q) ||
    /\b(?:what\s*can\s*you\s*do|what\s*do\s*you\s*do)\b/i.test(q) ||
    q.includes("kya kar sakte") || q.includes("kya kr skta") || q.includes("who are you") || q.includes("aap kaun ho")
  );
  if (isIdentity) {
    return {
      state: ConversationState.IDENTITY,
      intent: 'identity',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 3B. Product Requirement Confirmation / Finalize signal ("product confirm hai", "haan bhai dikha", "yes this is what I want", "okay find it", "bas ab products dikhao")
  const isRequirementConfirmation = (
    /\b(?:product\s*confirm\s*hai|confirm\s*hai|confirm\s*karo|haan\s*product\s*confirm\s*hai|haan\s*bhai\s*dikha|bas\s*ab\s*products\s*dikhao|requirements\s*complete|yes\s*this\s*is\s*what\s*i\s*want|okay\s*find\s*it|find\s*it\s*now|show\s*matches|show\s*products)\b/i.test(q)
  );
  if (isRequirementConfirmation) {
    const contextualCategory = getActiveCategoryFromContext(userQuery, conversationHistory) || "laptops";
    return {
      state: ConversationState.REQUIREMENTS_COMPLETE,
      intent: 'product_recommendation',
      shoppingIntent: true,
      category: contextualCategory,
      requirementsComplete: true,
      shouldSearchProducts: true
    };
  }

  // 4. Greetings & Casual Banter ("Hello", "Hello bhai", "Kesa hai", "Kaise ho", "Kya haal", "Kya scene hai", "Kya kar raha hai", "Aaj college bahut tiring tha", "Good morning", "How are you", "Whats up", "Thanks", "Okay", "Cool", "Nice")
  const isGreetingOrBanter = (
    /\b(?:hello|hi|hey|hii|heyy|namaste|pranam|good\s*(?:morning|afternoon|evening|night)|yo|hola|assalam|salaam)\b/i.test(q) ||
    /\b(?:how\s*are\s*you|how\s*r\s*u|wassup|what'?s\s*up|kaise\s*ho|kaisa\s*hai|kesa\s*hai|kya\s*haal|kya\s*chal\s*raha|kya\s*scene\s*hai|kya\s*kar\s*raha\s*hai|kya\s*kr\s*rha\s*h)\b/i.test(q) ||
    /\b(?:college|office|school|tiring|thak\s*gaya|bore\s*ho\s*raha|mood|kuch\s*nahi|aur\s*batao)\b/i.test(q) ||
    /^(?:thanks|thank\s*you|shukriya|dhanyawad|ok|okay|cool|nice|great|thik\s*hai|theek\s*hai|sahi\s*hai|achha|acha)[!.]*$/i.test(q)
  );

  const productTerms = [
    'laptop', 'computer', 'macbook', 'phone', 'mobile', 'smartphone', '5g', 'headphone', 'earphone',
    'earbuds', 'tws', 'saree', 'kurti', 'lehenga', 'shirt', 'tshirt', 't-shirt', 'shoe', 'shoes',
    'sneaker', 'watch', 'perfume', 'air fryer', 'blender', 'gym', 'fitness', 'dumbbell', 'yoga', 'bag', 'backpack'
  ];
  const hasProductKeywords = productTerms.some(term => q.includes(term));

  if (isGreetingOrBanter && !hasProductKeywords) {
    return {
      state: ConversationState.GREETING,
      intent: 'greeting',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 5. Coupons & Store Policies
  const isCoupon = /\b(?:coupon|coupons|discount|discounts|promo|promo\s*code|offer|offers|vip100|first50)\b/i.test(q);
  if (isCoupon && !hasProductKeywords) {
    return {
      state: ConversationState.COUPONS,
      intent: 'coupons',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 6. Policies
  const isPolicy = /\b(?:delivery|shipping|return|returns|refund|refunds|safe\s*hai|secure|razorpay|cod|guarantee)\b/i.test(q);
  if (isPolicy && !hasProductKeywords) {
    return {
      state: ConversationState.POLICY,
      intent: 'policy',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 7. Gibberish / Random letters check ("asdfgh", "ulla", "xyz123")
  const isGibberish = !hasProductKeywords && (
    /^(?:asdf|asdfgh|qwerty|zxcv|ulla|xyz|abcd|bla|blabla|\d+|[b-df-hj-np-tv-z]{5,})$/i.test(q) ||
    (q.length < 15 && !/[aeiouy]/i.test(q) && !/hi|ok/i.test(q))
  );
  if (isGibberish) {
    return {
      state: ConversationState.UNCLEAR,
      intent: 'unclear',
      shoppingIntent: false,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 7. Generic Shopping Intent Without Category ("I want to buy something", "Mujhe kuch kharidna hai", "I want something nice", "Suggest something")
  const isGenericShoppingIntent = (
    /^(?:i\s*want\s*to\s*buy\s*something|buy\s*something|kuch\s*kharidna\s*hai|mujhe\s*kuch\s*kharidna\s*hai|kuch\s*lena\s*hai|kuch\s*kharidna|shopping\s*karni\s*hai|i\s*want\s*something\s*nice|kuch\s*acha\s*dikhao|kuch\s*naya\s*dikhao|suggest\s*something|recommend\s*something)[?!.]*$/i.test(q) ||
    ((q.includes("buy") || q.includes("kharidna") || q.includes("shopping") || q.includes("suggest") || q.includes("recommend")) && !hasProductKeywords)
  );

  if (isGenericShoppingIntent) {
    return {
      state: ConversationState.DISCOVERING_INTENT,
      intent: 'discovering_intent',
      shoppingIntent: true,
      category: null,
      requirementsComplete: false,
      shouldSearchProducts: false
    };
  }

  // 8. Category-Specific Query Detected (Query or Context)
  let detectedCategory = null;
  if (q.includes("laptop") || q.includes("computer") || q.includes("macbook") || q.includes("pc")) {
    detectedCategory = "laptops";
  } else if (q.includes("headphone") || q.includes("earphone") || q.includes("earbud") || q.includes("tws") || q.includes("speaker") || q.includes("audio")) {
    detectedCategory = "headphones";
  } else if (/\b(?:phone|phones|mobile|mobiles|smartphone|smartphones|5g)\b/i.test(q)) {
    detectedCategory = "phones";
  } else if (q.includes("saree") || q.includes("kurti") || q.includes("lehenga") || q.includes("ethnic") || q.includes("shirt") || q.includes("tshirt") || q.includes("t-shirt") || q.includes("dress") || q.includes("clothing")) {
    detectedCategory = "fashion";
  } else if (q.includes("shoe") || q.includes("shoes") || q.includes("sneaker") || q.includes("footwear")) {
    detectedCategory = "footwear";
  } else if (q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("workout") || q.includes("yoga") || q.includes("massage gun")) {
    detectedCategory = "fitness";
  } else if (q.includes("air fryer") || q.includes("blender") || q.includes("mixer") || q.includes("kettle") || q.includes("appliance") || q.includes("kitchen")) {
    detectedCategory = "appliances";
  } else if (q.includes("watch") || q.includes("ghadi") || q.includes("smartwatch")) {
    detectedCategory = "watches";
  } else if (q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("cologne")) {
    detectedCategory = "fragrances";
  } else if (q.includes("backpack") || q.includes("bag") || q.includes("luggage") || q.includes("wallet")) {
    detectedCategory = "bags";
  }

  // If query does not name a category, retrieve the active category from conversational context
  if (!detectedCategory) {
    const contextualCategory = getActiveCategoryFromContext(userQuery, conversationHistory);
    if (contextualCategory) {
      detectedCategory = contextualCategory;
    }
  }

  const userHasSpecified = hasUserSpecifiedRequirements(userQuery, conversationHistory);

  if (detectedCategory) {
    if (userHasSpecified) {
      return {
        state: ConversationState.REQUIREMENTS_COMPLETE,
        intent: 'product_recommendation',
        shoppingIntent: true,
        category: detectedCategory,
        requirementsComplete: true,
        shouldSearchProducts: true
      };
    } else {
      return {
        state: ConversationState.COLLECTING_REQUIREMENTS,
        intent: 'requirement_discovery',
        shoppingIntent: true,
        category: detectedCategory,
        requirementsComplete: false,
        shouldSearchProducts: false
      };
    }
  }

  // Direct Consultative Advice Questions
  if (q.includes("konsa lu") || q.includes("kaunsa lu") || q.includes("tere hisab se") || q.includes("kya lena chahiye") || q.includes("suggest kar ek")) {
    return {
      state: ConversationState.REQUIREMENTS_COMPLETE,
      intent: 'advice',
      shoppingIntent: true,
      category: 'laptops',
      requirementsComplete: true,
      shouldSearchProducts: true
    };
  }

  // Fallback for general text query
  return {
    state: ConversationState.UNCLEAR,
    intent: 'unclear',
    shoppingIntent: false,
    category: null,
    requirementsComplete: false,
    shouldSearchProducts: false
  };
}

// Backward compatibility helper
export function detectConversationalIntent(userQuery, conversationHistory = []) {
  const analysis = analyzeConversationState(userQuery, conversationHistory);
  return analysis.state;
}

// Helper: Check for Impossible / Out-of-Catalog Budgets honestly
export function checkImpossibleBudget(userQuery, numericBudget) {
  if (!numericBudget || isNaN(numericBudget)) return null;
  const q = (userQuery || "").toLowerCase();

  // Laptop minimums in catalog: Budget laptops start at ₹24,990; Gaming laptops at ₹37,490
  if (q.includes("gaming laptop") || (q.includes("laptop") && (q.includes("game") || q.includes("gaming") || q.includes("rtx")))) {
    if (numericBudget < 25000) {
      return {
        isImpossible: true,
        categoryName: "gaming laptops",
        categoryNameHindi: "gaming laptops",
        minPrice: 37490,
        requestedBudget: numericBudget
      };
    }
  } else if (q.includes("laptop") || q.includes("computer") || q.includes("macbook")) {
    if (numericBudget < 15000) {
      return {
        isImpossible: true,
        categoryName: "laptops",
        categoryNameHindi: "laptops",
        minPrice: 24990,
        requestedBudget: numericBudget
      };
    }
  } else if (q.includes("phone") || q.includes("smartphone") || q.includes("5g")) {
    if (numericBudget < 3000) {
      return {
        isImpossible: true,
        categoryName: "5G smartphones",
        categoryNameHindi: "5G smartphones",
        minPrice: 7499,
        requestedBudget: numericBudget
      };
    }
  }

  return null;
}

// Dedicated Questionnaire & Structured Requirements Submission Processor
export async function processAIAgentRequirements({
  sessionId,
  requirementSessionId,
  category = "laptops",
  questionId = null,
  answer = null,
  customInput = null,
  isStep = false,
  requirements = {},
  history = [],
  cartContext = [],
  userProfile = {}
}) {
  const catKey = (category || "").toLowerCase();
  let normalizedCategory = "laptops";
  if (catKey.includes("laptop") || catKey.includes("computer")) normalizedCategory = "laptops";
  else if (catKey.includes("headphone") || catKey.includes("audio") || catKey.includes("earbud")) normalizedCategory = "headphones";
  else if (catKey.includes("phone") || catKey.includes("mobile") || catKey.includes("smart")) normalizedCategory = "phones";
  else if (catKey.includes("fashion") || catKey.includes("ethnic") || catKey.includes("saree") || catKey.includes("clothing")) normalizedCategory = "fashion";
  else if (catKey.includes("footwear") || catKey.includes("shoe")) normalizedCategory = "footwear";
  else if (catKey.includes("fitness") || catKey.includes("gym")) normalizedCategory = "fitness";
  else if (catKey.includes("appliance") || catKey.includes("kitchen")) normalizedCategory = "appliances";
  else if (catKey.includes("watch")) normalizedCategory = "watches";
  else if (catKey.includes("fragrance") || catKey.includes("perfume")) normalizedCategory = "fragrances";
  else if (catKey.includes("bag") || catKey.includes("luggage")) normalizedCategory = "bags";

  // Merge structured answer if provided
  const accumulated = { ...requirements };
  if (questionId && answer) {
    accumulated[questionId] = answer;
    if (questionId === 'usage' && Array.isArray(answer)) {
      accumulated.priorities = Array.from(new Set([...(accumulated.priorities || []), ...answer]));
    } else if (questionId === 'budget' && typeof answer === 'string' && /^\d+$/.test(answer)) {
      accumulated.budget = Number(answer);
      accumulated.isBudgetActive = true;
    }
  }
  if (customInput && typeof customInput === 'string' && customInput.trim()) {
    accumulated.customRequirements = [accumulated.customRequirements, customInput.trim()].filter(Boolean).join("; ");
  }

  // If this was an intermediate questionnaire step, check if next question is needed
  if (isStep && questionId) {
    const nextQ = getDynamicQuestionnaireForCategory(normalizedCategory, accumulated, accumulated);
    if (nextQ && nextQ.id !== questionId) {
      const isHindi = isHindiOrHinglish((history[history.length - 1]?.text || category) + " " + (answer || ""));
      const reply = isHindi
        ? `Samajh gaya bhai! 👍 Ab ye batao: ${nextQ.text}`
        : `Got your preference! 👍 Next up: ${nextQ.text}`;
      return {
        success: true,
        state: ConversationState.COLLECTING_REQUIREMENTS,
        reply,
        text: reply,
        questionnaire: nextQ,
        requirements: accumulated,
        products: []
      };
    }
  }

  const priorities = Array.isArray(accumulated.priorities) ? accumulated.priorities : [];
  const customReq = accumulated.customRequirements || accumulated.customInput || "";
  const budget = accumulated.isBudgetActive && accumulated.budget ? Number(accumulated.budget) : null;
  const isBudgetActive = Boolean(accumulated.isBudgetActive && budget);

  const queryComposite = [
    normalizedCategory,
    priorities.join(" "),
    customReq,
    isBudgetActive && budget ? `under ${budget}` : ''
  ].filter(Boolean).join(" ");

  const stateAnalysis = {
    state: ConversationState.REQUIREMENTS_COMPLETE,
    intent: 'product_recommendation',
    shoppingIntent: true,
    category: normalizedCategory,
    requirementsComplete: true,
    shouldSearchProducts: true
  };

  const detectedReqs = {
    category: normalizedCategory,
    intent: priorities.join(" & ") || 'Custom Specs',
    budgetConstraint: isBudgetActive && budget ? `Under ₹${budget.toLocaleString('en-IN')}` : 'Flexible Budget',
    numericBudget: budget,
    isBudgetActive,
    priorities,
    customRequirements: customReq
  };

  // Retrieve matching products via structured catalog search
  const matched = searchProductsLocally({
    category: normalizedCategory,
    priorities,
    requirements: priorities,
    customRequirements: customReq,
    budget,
    isBudgetActive,
    query: queryComposite
  });

  const candidatePool = matched.slice(0, 30);
  const topProducts = candidatePool.slice(0, 5);

  const contextPackage = buildContextPackage(
    queryComposite,
    history,
    cartContext,
    userProfile,
    stateAnalysis,
    detectedReqs
  );

  if (genAI) {
    const geminiResult = await callGeminiWithContext(contextPackage, candidatePool.slice(0, 15));
    if (geminiResult && geminiResult.message) {
      let finalProducts = [];
      if (Array.isArray(geminiResult.recommendations) && geminiResult.recommendations.length > 0) {
        for (const rec of geminiResult.recommendations) {
          const p = productsById[rec.productId];
          if (p && !finalProducts.some(existing => existing.id === p.id)) {
            if (isBudgetActive && budget && p.price > budget) continue;
            finalProducts.push({
              ...p,
              matchRank: rec.matchRank || (finalProducts.length + 1),
              whyItMatches: rec.whyMatches || `Matches your requirement for ${detectedReqs.intent || 'performance'}.`,
              keyHighlight: rec.keyHighlight || (finalProducts.length === 0 ? "Best Overall Match 🥇" : "Top Recommendation")
            });
          }
        }
      }
      if (finalProducts.length === 0) {
        finalProducts = topProducts.length > 0 ? enrichProductsWithRequirementMatch(topProducts, detectedReqs, queryComposite) : [];
      }

      const relatedProducts = finalProducts.length > 0 ? getRelatedProductsForCategory(queryComposite, finalProducts) : [];

      let upsell = null;
      if (finalProducts.length > 0) {
        if (normalizedCategory === "laptops") {
          upsell = {
            title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
            price: 399,
            pitchMessage: "Pairs with your high-performance laptop setup."
          };
        } else if (normalizedCategory === "phones") {
          upsell = {
            title: "65W GaN Fast Charger with Braided Type-C Cable",
            price: 299,
            pitchMessage: "Powers your smartphone up to 3x faster."
          };
        }
      }

      return {
        success: true,
        state: ConversationState.REQUIREMENTS_COMPLETE,
        reply: geminiResult.message,
        text: geminiResult.message,
        products: finalProducts,
        relatedProducts: relatedProducts,
        upsellPitch: upsell,
        requirements: accumulated,
        suggestedFollowUpQueries: geminiResult.suggestedFollowUpQueries || ["Show My Cart 🛒", "Proceed to Checkout ⚡", "Top Deals Today 🔥"]
      };
    }
  }

  return generateFallbackResponse(
    queryComposite,
    topProducts,
    true,
    userProfile,
    'PRODUCT_QUERY',
    detectedReqs
  );
}

// Build complete, structured context package on every request
export function buildContextPackage(userQuery, conversationHistory = [], cartContext = [], userProfile = {}, stateAnalysis = {}, detectedReqs = {}) {
  return {
    assistantRole: "Infinity Store AI Shopping Assistant",
    websiteContext: {
      name: "Infinity Store",
      purpose: "AI-powered shopping assistant with 1,00,250+ structured catalog products",
      availableCategories: [
        "Laptops & Tech",
        "5G Smartphones & Gadgets",
        "Wireless Audio & Noise Cancelling Headphones",
        "Festive Sarees, Kurtis & Ethnic Wear",
        "Men Fashion & Streetwear",
        "Footwear & Athletic Shoes",
        "Home & Smart Kitchen Appliances",
        "Fitness, Dumbbells & Training Gear",
        "Watches & Accessories",
        "Luxury Fragrances & Perfumes",
        "Bags, Backpacks & Luggage"
      ],
      storePolicies: {
        shipping: "Free Express Delivery PAN-India across 28,000+ pincodes",
        payments: "100% Secure Razorpay 256-bit Encrypted Payments (UPI, Cards, NetBanking)",
        returns: "7-Day Easy Returns with instant doorstep pickup and refund",
        coupons: "FIRST50 (Flat ₹50 OFF 1st order), VIP100 (Flat ₹100 OFF above ₹499)"
      }
    },
    conversationState: {
      state: stateAnalysis.state || ConversationState.GREETING,
      shoppingIntent: stateAnalysis.shoppingIntent || false,
      category: stateAnalysis.category || null,
      subcategory: null,
      requirementsComplete: stateAnalysis.requirementsComplete || false
    },
    requirements: {
      selected: detectedReqs.keySpecsMatched || [],
      priorities: detectedReqs.priorities || [],
      budget: detectedReqs.numericBudget || null,
      isBudgetActive: Boolean(detectedReqs.isBudgetActive && detectedReqs.numericBudget),
      customRequirements: detectedReqs.customRequirements || ""
    },
    cartContext: (cartContext || []).map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      price: c.price
    })),
    userProfile: {
      learnedInterests: userProfile?.learnedInterests || [],
      preferredBudget: userProfile?.preferredBudget || "Flexible"
    },
    conversationHistory: (conversationHistory || []).slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      message: m.text || m.content || m.message || ''
    })),
    currentUserMessage: userQuery,
    availableActions: [
      "chat",
      "ask_requirement",
      "search_products",
      "recommend_products",
      "cart",
      "checkout"
    ]
  };
}

// Call Gemini with full context package to generate dynamic response and structured decisions
export async function callGeminiWithContext(contextPackage, candidateProducts = [], image = null) {
  if (!genAI) return null;

  const productContext = candidateProducts.length > 0
    ? candidateProducts.map((p, i) => `[Candidate #${i + 1}] ID: "${p.id}" | "${p.title}" | Price: Rs.${p.price} (MRP Rs.${p.originalPrice || p.price}) | Rating: ${p.rating}★ | Specs: ${p.fabric || p.description || ''} | SubCat: ${p.subCategory || ''}`).join('\n')
    : "NO PRODUCTS RETRIEVED (Conversational / Intent Discovery / Requirement Phase).";

  const systemInstruction = `You are Infinity Store's AI shopping assistant.
Your job is to help users discover and purchase products available on Infinity Store (1,00,250+ structured catalog products).
You are conversational, helpful, grounded, and natural.
You are NOT a generic AI assistant. You must stay strictly within the shopping domain.

CORE INSTRUCTIONS:
1. Generate EVERY conversational response dynamically. Never use predefined or hardcoded response templates.
2. The store UI is English, but your conversational language MUST naturally match the user's language (English, Hindi, or natural Hinglish).
3. If the user attaches/uploads an image of a product, visually analyze the product (category, type, style, color, pattern, material, brand) and recommend closely matching or exact products from Infinity Store catalog.
4. If the user is simply greeting or casual chatting (e.g. "Hello", "How are you", "Hello bhai", "kya kar raha hai", "aaj college bahut tiring tha"), converse warmly and naturally as a friendly shopping companion. DO NOT dump or show product cards on casual conversations.
5. If the user expresses a general desire to buy something without naming a category ("I want to buy something", "kuch kharidna hai"), ask what kind of product they are looking for.
6. If the user asks a non-shopping question (e.g. coding, C++ binary search, homework, medical, legal), politely refuse and redirect to shopping in their language.
7. When the user identifies a broad category (e.g. "I need a laptop", "show me phones", "I want headphones", "saree dikhao") for the first time without specific features, provide a dynamic specification questionnaire tailored specifically to that product category.
8. When recommending products:
   - CRITICAL GROUNDING RULE: You can ONLY recommend products present in the CANDIDATE PRODUCTS FROM INVENTORY above.
   - Return their exact IDs in recommendedProductIds and recommendations.
   - NEVER invent products, prices, specs, ratings, or IDs.
   - Rank top 3 to 6 candidates based on user's hard constraints (budget, specs) and soft preferences.
   - Provide clear, user-facing reasons why each product fits (e.g. fits budget, RAM, thermals).
9. If the user sets an impossible budget for a category (e.g. gaming laptop under ₹5,000), explain that no options exist in the catalog within that budget, mention the minimum starting price (e.g. ₹37,490 for gaming laptops), and ask if they'd like to adjust their budget.
10. For cart actions (remove item, show cart, checkout), generate natural confirmation messages and set agentAction.

Always return strict JSON format:
{
  "message": "Your natural markdown response dynamically generated in user's language without any predefined templates",
  "language": "hinglish" | "english" | "hindi",
  "intent": "greeting" | "shopping" | "scope_guard" | "cart_action" | "requirement_discovery" | "product_recommendation" | "advice" | "unclear",
  "state": "GREETING" | "DISCOVERING_INTENT" | "COLLECTING_REQUIREMENTS" | "REQUIREMENTS_COMPLETE" | "CART_ACTION" | "NON_COMMERCE" | "UNCLEAR",
  "category": "laptops" | "phones" | "headphones" | "fashion" | "footwear" | "fitness" | "appliances" | "watches" | "fragrances" | "bags" | null,
  "requirementsComplete": boolean,
  "shouldSearchProducts": boolean,
  "shouldAskQuestion": boolean,
  "questionnaire": {
    "id": "question_id",
    "title": "Category-specific title",
    "text": "Question text",
    "type": "single_select" | "multi_select",
    "options": [
      { "id": "opt-1", "label": "Option label with specs", "value": "Option value" }
    ],
    "customPlaceholder": "Enter any specific requirement, feature, brand, specification, or preference..."
  } | null,
  "requirements": {
    "priorities": ["priority1", "priority2"],
    "budget": number | null
  },
  "recommendedProductIds": ["prod-id-1", "prod-id-2"],
  "recommendations": [
    {
      "productId": "prod-id-1",
      "matchRank": 1,
      "whyMatches": "Concise user-facing explanation why it fits their requirement",
      "keyHighlight": "Best Overall Match"
    }
  ],
  "agentAction": {
    "type": "REMOVE_FROM_CART" | "SHOW_CART" | "INITIATE_CHECKOUT",
    "target": "item keyword or all"
  } | null,
  "suggestedFollowUpQueries": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`;

  const prompt = `COMPLETE APPLICATION CONTEXT PACKAGE:
${JSON.stringify(contextPackage, null, 2)}

CANDIDATE PRODUCTS FROM INVENTORY:
${productContext}

Analyze the user message, context package, and candidate inventory. ${image ? "Also analyze the user's uploaded product image visually to identify the category, style, and features." : ""} Return the structured JSON with your dynamic conversational message.`;

  // Build multimodal parts
  const promptParts = [{ text: prompt }];
  if (image && typeof image === 'string') {
    try {
      let mimeType = "image/jpeg";
      let base64Data = image;
      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }
      promptParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    } catch (imgErr) {
      console.warn("[Gemini] Failed to attach image part:", imgErr.message);
    }
  }

  const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const modelName of modelCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: promptParts }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.warn(`[Gemini] ${modelName} call failed:`, e.message);
    }
  }

  return null;
}

// Main AI Agent Query Processing Function
export async function processAIAgentQuery(userQuery, conversationHistory = [], cartContext = [], userProfile = {}, image = null) {
  const stateAnalysis = analyzeConversationState(userQuery, conversationHistory, cartContext, userProfile);
  const detectedReqs = extractDetailedRequirements(userQuery, conversationHistory);
  const impossibleBudget = checkImpossibleBudget(userQuery, detectedReqs.numericBudget);

  // If user uploaded an image, treat it as direct product discovery/recommendation
  if (image) {
    stateAnalysis.state = ConversationState.REQUIREMENTS_COMPLETE;
    stateAnalysis.requirementsComplete = true;
    stateAnalysis.shouldSearchProducts = true;
  }

  let candidateProducts = [];
  if (impossibleBudget && impossibleBudget.isImpossible) {
    stateAnalysis.state = ConversationState.COLLECTING_REQUIREMENTS;
    stateAnalysis.requirementsComplete = false;
    stateAnalysis.shouldSearchProducts = false;
    candidateProducts = [];
  } else if (stateAnalysis.state === ConversationState.REQUIREMENTS_COMPLETE || stateAnalysis.shouldSearchProducts) {
    const rawMatches = searchProductsLocally({
      category: stateAnalysis.category || (image ? "all" : "laptops"),
      query: userQuery,
      budget: detectedReqs.numericBudget,
      isBudgetActive: Boolean(detectedReqs.numericBudget)
    });
    candidateProducts = rawMatches.slice(0, 5);
  }

  const contextPackage = buildContextPackage(
    userQuery,
    conversationHistory,
    cartContext,
    userProfile,
    stateAnalysis,
    detectedReqs
  );
  if (impossibleBudget && impossibleBudget.isImpossible) {
    contextPackage.impossibleBudget = impossibleBudget;
  }
  if (image) {
    contextPackage.hasUploadedImage = true;
  }

  // 1. Invoke Gemini with Full Context Package & Image
  if (genAI) {
    const geminiResult = await callGeminiWithContext(contextPackage, candidateProducts, image);
    if (geminiResult && geminiResult.message) {
      const finalState = impossibleBudget?.isImpossible ? ConversationState.COLLECTING_REQUIREMENTS : (geminiResult.state || stateAnalysis.state);
      const shouldShow = !impossibleBudget?.isImpossible && (geminiResult.shouldSearchProducts || finalState === ConversationState.REQUIREMENTS_COMPLETE) && candidateProducts.length > 0;

      // If questionnaire needed for category
      let questionnaire = geminiResult.questionnaire;
      if (finalState === ConversationState.COLLECTING_REQUIREMENTS && !questionnaire && !impossibleBudget?.isImpossible) {
        questionnaire = getInteractiveQuestionnaireForCategory(userQuery);
      }

      let finalProducts = [];
      if (shouldShow) {
        if (Array.isArray(geminiResult.recommendations) && geminiResult.recommendations.length > 0) {
          for (const rec of geminiResult.recommendations) {
            const p = productsById[rec.productId];
            if (p && !finalProducts.some(existing => existing.id === p.id)) {
              if (detectedReqs.isBudgetActive && detectedReqs.numericBudget && p.price > detectedReqs.numericBudget) continue;
              finalProducts.push({
                ...p,
                matchRank: rec.matchRank || (finalProducts.length + 1),
                whyItMatches: rec.whyMatches || `Matches your requirement for ${detectedReqs.intent || 'performance'}.`,
                keyHighlight: rec.keyHighlight || (finalProducts.length === 0 ? "Best Overall Match 🥇" : "Top Recommendation")
              });
            }
          }
        }
        if (finalProducts.length === 0) {
          finalProducts = enrichProductsWithRequirementMatch(candidateProducts, detectedReqs, userQuery);
        }
      }
      const relatedProducts = finalProducts.length > 0 ? getRelatedProductsForCategory(userQuery, finalProducts) : [];

      let inChatCheckout = null;
      if (geminiResult.agentAction?.type === "SHOW_CART" || geminiResult.agentAction?.type === "INITIATE_CHECKOUT") {
        inChatCheckout = {
          ready: true,
          message: "Payment Gateway Ready! Secure 1-Click Pay with Razorpay:",
          actionText: "⚡ Pay Now with Razorpay"
        };
      }

      return {
        success: true,
        state: finalState,
        reply: geminiResult.message,
        text: geminiResult.message,
        agentAction: geminiResult.agentAction || null,
        questionnaire: questionnaire || null,
        products: finalProducts,
        relatedProducts: relatedProducts,
        inChatCheckout: inChatCheckout,
        suggestedFollowUpQueries: geminiResult.suggestedFollowUpQueries || (questionnaire ? questionnaire.options.slice(0, 4).map(o => o.label || o.value) : ["Show My Cart 🛒", "Top Deals Today 🔥"])
      };
    }
  }

  // 2. Dynamic Fallback Generation (Used only if Gemini API is unreachable)
  return generateDynamicFallback(userQuery, stateAnalysis, detectedReqs, candidateProducts, conversationHistory, cartContext, userProfile);
}

// Graceful dynamic fallback generator for network/API outages
function generateDynamicFallback(userQuery, stateAnalysis, detectedReqs, candidateProducts, conversationHistory, cartContext, userProfile) {
  const isHindi = isHindiOrHinglish(userQuery);
  const q = userQuery.toLowerCase().trim();
  const impossibleBudget = checkImpossibleBudget(userQuery, detectedReqs.numericBudget);
  let reply = "";
  let questionnaire = null;
  let products = [];
  let relatedProducts = [];
  let agentAction = null;
  let inChatCheckout = null;

  if (impossibleBudget && impossibleBudget.isImpossible) {
    reply = isHindi
      ? `Infinity Store par ${impossibleBudget.categoryNameHindi} ₹${impossibleBudget.minPrice.toLocaleString('en-IN')} se start hote hain. ₹${impossibleBudget.requestedBudget.toLocaleString('en-IN')} ke budget mein koi ${impossibleBudget.categoryNameHindi} available nahi hai. Kya aap ₹${impossibleBudget.minPrice.toLocaleString('en-IN')} ya usse upar ke options dekhna chahenge?`
      : `In our catalog, ${impossibleBudget.categoryName} start at ₹${impossibleBudget.minPrice.toLocaleString('en-IN')}. We don't have models under ₹${impossibleBudget.requestedBudget.toLocaleString('en-IN')}. Would you like to explore options starting at ₹${impossibleBudget.minPrice.toLocaleString('en-IN')}?`;
  } else if (stateAnalysis.state === ConversationState.NON_COMMERCE) {
    reply = isHindi
      ? "Main sirf Infinity Store par products aur shopping mein aapki help karta hoon. Aap bataiye aapko kya kharidna hai, main best options dhoondh ke dunga! 😊"
      : "I'm focused on helping you shop on Infinity Store. Tell me what product or category you're looking for and I'll help you find the right match!";
  } else if (stateAnalysis.state === ConversationState.IDENTITY) {
    reply = isHindi
      ? "Main **Infinity AI** hoon — aapka personal shopping assistant! 🤖✨ Main aapko 1,00,250+ catalog products mein se perfect items dhoondhne aur Razorpay se safe payment karne mein help karta hoon.\n\nAap batayein, aaj kya dekhna chahenge?"
      : "Hey! I'm your **Infinity AI** shopping assistant! 🤖✨ Tell me what product or category you're looking for, and I'll help you discover the perfect match from our 1,00,250+ product catalog.";
  } else if (stateAnalysis.state === ConversationState.GREETING) {
    if (q.includes("college") || q.includes("tiring") || q.includes("thak")) {
      reply = isHindi
        ? "Arre bhai, college ke din waise hi tiring hote hain! 😅 Thoda relax karo aur fresh ho jao. Agar mood lift karne ke liye koi cool gadgets, music gear ya sneakers dekhne hon toh batao!"
        : "Sounds like a really tiring day! Take some rest and unwind. If you want to browse some cool tech, headphones, or comfy clothes to refresh your mood, I'm right here! 😊";
    } else if (q.includes("kya kar raha") || q.includes("kya kr rha")) {
      reply = isHindi
        ? "Bas ready hoon 😄 Batao kya dekhna hai ya kis cheez mein help chahiye?"
        : "Just here and ready to help! 😄 What are you looking to explore today?";
    } else if (q.includes("hello bhai") || q.includes("hey bhai")) {
      reply = isHindi
        ? "Hey bhai! 👋 Kya scene hai? Main yahin hoon."
        : "Hey brother! 👋 What's up? I'm right here.";
    } else {
      const isHowAreYou = /how\s*are\s*you|kaise\s*ho|kya\s*haal|kesa\s*hai|kaisa\s*hai/i.test(q);
      reply = isHowAreYou
        ? (isHindi ? "Main badhiya hoon! Main aapki shopping mein kya madad kar sakta hoon? Bataiye aaj kya dekhna chahenge?" : "I'm doing great! What can I help you shop for today?")
        : (isHindi ? "Hey! Aap aaj kya kharidna chahte hain? (Jaise Laptops, Smartphones, Festive Sarees, Headphones ya Shoes)" : "Hey! What are you looking to buy today?");
    }
  } else if (stateAnalysis.state === ConversationState.DISCOVERING_INTENT) {
    reply = isHindi
      ? "Haan, bilkul! Aap kya kharidna chahte hain? (Jaise: Laptops, Smartphones, Festive Wear, Headphones, ya Fitness Gear?)"
      : "Sure! What are you looking to buy today? (e.g. Laptops, Smartphones, Festive Wear, Headphones, or Fitness Gear)";
  } else if (stateAnalysis.state === ConversationState.COLLECTING_REQUIREMENTS) {
    questionnaire = getInteractiveQuestionnaireForCategory(userQuery);
    reply = isHindi
      ? "Bilkul! Aapke liye best matches nikalne ke liye bas neeche apni requirements tick karein ya custom budget/specs type karein 👇"
      : "I'd love to help you find the perfect match! Please select your specifications from the options below or enter custom details 👇";
  } else if (stateAnalysis.state === ConversationState.REQUIREMENTS_COMPLETE && candidateProducts.length > 0) {
    products = enrichProductsWithRequirementMatch(candidateProducts, detectedReqs, userQuery);
    relatedProducts = getRelatedProductsForCategory(userQuery, products);
    reply = isHindi
      ? `Aapki requirement **${detectedReqs.intent || 'Performance'}** (${detectedReqs.budgetConstraint || 'Best Value'}) ke hisaab se top matched options nikal liye hain! 💻🔥 Neeche review karein:`
      : `I have matched the top products for your requirement **${detectedReqs.intent || 'Performance'}** (${detectedReqs.budgetConstraint || 'Best Value'})! Explore curated matches below:`;
  } else if (stateAnalysis.state === ConversationState.CART_ACTION) {
    const isRemove = stateAnalysis.intent === 'remove_from_cart';
    if (isRemove) {
      reply = isHindi ? "Item aapke cart se hata diya gaya hai." : "Item has been removed from your cart.";
      agentAction = { type: "REMOVE_FROM_CART", target: "all" };
    } else {
      reply = isHindi ? "Ye raha aapka live cart summary:" : "Here is your live cart summary:";
      agentAction = { type: "SHOW_CART" };
      inChatCheckout = { ready: true, message: "Proceed with Razorpay checkout:", actionText: "Proceed to Razorpay Payment ⚡" };
    }
  } else {
    reply = isHindi
      ? "Sorry, mujhe samajh nahi aaya. Aap bataiye aapko kis product ya category mein help chahiye? 😊"
      : "Sorry, I didn't quite understand that. Could you tell me what product or category you'd like to shop for? 😊";
  }

  return {
    success: true,
    state: stateAnalysis.state,
    reply,
    text: reply,
    agentAction,
    questionnaire,
    products,
    relatedProducts,
    inChatCheckout,
    suggestedFollowUpQueries: questionnaire ? questionnaire.options.slice(0, 4).map(o => o.label) : ["Laptops & Tech 💻", "5G Smartphones 📱", "Show My Cart 🛒"]
  };
}

// Legacy fallback response adapter
function generateFallbackResponse(userQuery, topProducts = [], shouldShowProducts = false, userProfile = {}, intentType = 'PRODUCT_QUERY', detectedReqs = {}) {
  const stateAnalysis = { state: ConversationState.REQUIREMENTS_COMPLETE, shouldSearchProducts: true };
  return generateDynamicFallback(userQuery, stateAnalysis, detectedReqs, topProducts, [], [], userProfile);
}

/**
 * Server-Sent Events (SSE) AI Streaming Endpoint Handler
 * Event Types: status, message, question, products, action, done, error
 */
export async function streamAIAgentQuery(userQuery, conversationHistory = [], cartContext = [], userProfile = {}, image = null, sessionId = "default_session", res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isConnected = true;
  res.on('close', () => {
    isConnected = false;
  });

  const sendEvent = (event, data) => {
    if (!isConnected) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { message: 'Infinity AI is understanding your request...' });

    // 1. Execute AI commerce pipeline
    const result = await processAIAgentQuery(userQuery, conversationHistory, cartContext, userProfile, image, sessionId);

    if (!isConnected) return;

    // 2. Stream Conversational Text Progressively (event: message)
    const replyText = result.reply || result.text || "";
    const words = replyText.split(' ');
    for (let i = 0; i < words.length; i += 2) {
      if (!isConnected) break;
      const chunk = words.slice(i, i + 2).join(' ') + (i + 2 < words.length ? ' ' : '');
      sendEvent('message', { text: chunk });
      await new Promise(r => setTimeout(r, 20));
    }

    if (!isConnected) return;

    // 3. Emit Structured Events (question, products, action, done)
    if (result.questionnaire) {
      sendEvent('question', result.questionnaire);
    }

    if (result.products && result.products.length > 0) {
      sendEvent('products', {
        products: result.products,
        relatedProducts: result.relatedProducts || []
      });
    }

    if (result.agentAction) {
      sendEvent('action', result.agentAction);
    }

    sendEvent('done', {
      success: true,
      state: result.state,
      products: result.products || [],
      relatedProducts: result.relatedProducts || [],
      questionnaire: result.questionnaire || null,
      agentAction: result.agentAction || null,
      inChatCheckout: result.inChatCheckout || null,
      suggestedFollowUpQueries: result.suggestedFollowUpQueries || [],
      updatedUserProfile: result.updatedUserProfile || null,
      fullText: replyText
    });

    res.end();
  } catch (err) {
    console.error('[AI Stream Error]:', err);
    if (isConnected) {
      sendEvent('error', { error: err.message || 'Stream processing error' });
      res.end();
    }
  }
}
