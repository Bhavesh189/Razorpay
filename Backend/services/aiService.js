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

const SHOPPING_SYSTEM_PROMPT = `You are the **Infinity Store AI Senior Shopping Advisor & Executive Sales Consultant** — an expert at consultative technical specification breakdown, customer requirements assessment, and seamless commerce closing.

## CONVERSATION MODES

### MODE 1: INITIAL DISCOVERY (ONLY on first, highly generic queries)
*Example: User simply says "I want a laptop", "show me clothes", "suggest some shoes", "need a smartphone"*
- **Warm Welcome**: Greet the customer professionally like an expert personal technology/fashion consultant.
- **Provide Questionnaire Object ONCE**: Include 3-4 clickable specification options and a custom requirement placeholder.
- **NO PRODUCTS YET**: In Mode 1 only, questionnaire is populated so the user can quickly pick their preferred specifications.

### MODE 2: SPECIFICATION-BASED PRODUCT RECOMMENDATIONS (When user has selected an option or provided ANY specification)
*Example: User specifies "gaming", "coding", "under 60000", "RTX 4060", "32GB RAM", "16GB", "lightweight", "cotton 220 gsm", or submitted choices from discovery questionnaire*
- **CRITICAL RULE**: You MUST set "questionnaire": null. NEVER ask discovery questions or present questionnaires again!
- **Detailed Technical Breakdown**:
  - Analyze the exact hardware / fabric specifications (Processor, RTX GPU, Refresh Rate, RAM, SSD, Cooling system, Material GSM, etc.).
  - Explain WHY these exact specifications meet their stated use-case.
- **Cross-Selling / Accessory Pairing**:
  - Recommend complementary items in clear, professional English:
    - For Laptops: RGB gaming mouse, mechanical keyboard, or dual-turbo cooling pad.
    - For Smartphones: 65W GaN fast charger, protective glass, or wireless earbuds.
    - For Fashion / Ethnic: Matching accessories, jewelry, or footwear.
- **Assurance**: Free PAN-India Delivery, Official Razorpay 100% Encrypted Payments, and 7-Day Easy Returns.

## STRICT RULES
1. **LANGUAGE**: Always communicate in fluent, articulate, and 100% professional English. Do NOT use slang, Hindi, or Hinglish.
2. **NO REPEATED QUESTIONS**: If the user has already provided criteria or answered a discovery option, immediately show matching products with "questionnaire": null.
3. **VALID JSON ONLY**: Always return strictly valid JSON matching the schema below.

## JSON RESPONSE FORMAT
{
  "reply": "Your markdown response formatted with **bold**, bullet points, technical specs breakdown, and cross-sell advice in clean professional English",
  "questionnaire": {
    "title": "Select your preferences or enter custom specifications below:",
    "options": [
      { "id": "opt-1", "label": "Option 1 with Specs", "value": "Detailed preference string 1" },
      { "id": "opt-2", "label": "Option 2 with Specs", "value": "Detailed preference string 2" },
      { "id": "opt-3", "label": "Option 3 with Specs", "value": "Detailed preference string 3" }
    ],
    "customPlaceholder": "Or type custom specifications (e.g. 16GB RAM, Under ₹50,000)..."
  } or null,
  "suggestedFollowUpQueries": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "upsellPitch": {
    "title": "Complementary Add-on Title (e.g. Pro Esports RGB Gaming Mouse)",
    "price": 399,
    "pitchMessage": "Clear English pitch explaining why this accessory pairs perfectly with their selection."
  } or null
}`;

// Helper: Check if query has specifications or if user is responding to previous questions
function hasUserSpecifiedRequirements(query, conversationHistory = []) {
  const q = query.toLowerCase().trim();

  // Multi-option delimiters from UI questionnaire submission
  if (q.includes('|') || q.includes('opt-') || (q.includes(',') && q.length > 25)) {
    return true;
  }

  // Check if query contains any specific specification terms
  const specKeywords = [
    'gaming', 'game', 'code', 'coding', 'programming', 'developer', 'office', 'work', 'student', 'editing', 'render', 'esports',
    'rtx', 'gtx', '4050', '4060', '4070', '4080', '4090', 'i3', 'i5', 'i7', 'i9', 'ryzen', 'intel', 'amd', 'radeon', 'nvidia',
    'm1', 'm2', 'm3', 'm4', 'macbook', 'oled', 'fhd', 'qhd', '4k', '144hz', '165hz', '240hz', 'ips', 'mini-led', 'display', 'screen',
    'ram', 'ssd', 'gb', 'tb', '16gb', '32gb', '8gb', '64gb', '512gb', '1tb', '256gb', 'nvme', 'ddr4', 'ddr5',
    'under', 'below', 'less than', 'budget', 'rs', 'inr', '₹', 'price', 'cheap', 'max', 'range',
    'lightweight', 'slim', 'thin', 'battery', 'fast', 'pro', 'ultra', 'touch', 'amoled', 'camera', 'charger', 'cotton', 'silk', 'banarasi'
  ];

  if (specKeywords.some(keyword => q.includes(keyword))) {
    return true;
  }

  // Check conversation history - if previous conversation exists, requirements have already been explored
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const hasPriorAssistantTurn = conversationHistory.some(m => m.role === 'model' || m.role === 'assistant');
    if (hasPriorAssistantTurn) {
      return true;
    }
  }

  return false;
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

  // 6. CAR & BIKE AUTOMOTIVE ACCESSORIES
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
      whyBuy: "Charges multiple devices simultaneously at high speeds with smart surge protection.",
      benefitTag: "Universal Fast Charging"
    }
  ];
}

export async function processAIAgentQuery(userQuery, conversationHistory = [], cartContext = []) {
  const q = userQuery.toLowerCase().trim();

  // ===================== FAST CART COMMANDS (ENGLISH ONLY) =====================
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
      reply: `Done! 🗑️ **${target ? target.charAt(0).toUpperCase() + target.slice(1) : 'Item'}** has been removed from your cart.\n\nYour shopping cart has been updated. Would you like to review remaining items or **proceed to checkout**? ⚡`,
      agentAction: {
        type: "REMOVE_FROM_CART",
        target: target || "all",
        message: `${target || 'Item'} removed from cart`
      },
      products: [],
      relatedProducts: [],
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
      reply: `Here is your **Live Shopping Cart**! 🛒✨\n\n🔥 **Special Promotion**: Complete your order now to unlock **100% Free Express PAN-India Delivery** + **Extra ₹50 First-Order Discount (Code: FIRST50)**!\n\nReview your items below and complete your order with **1-Click Razorpay Checkout**:`,
      agentAction: {
        type: "SHOW_CART"
      },
      inChatCheckout: {
        ready: true,
        message: "Your order is ready for payment! Pay securely with Razorpay:",
        actionText: "Proceed to Razorpay Payment ⚡"
      },
      products: [],
      relatedProducts: [],
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
      reply: `Outstanding choice! 🔥 Your order is ready for instant checkout!\n\n💳 **Payment Mode**: 100% Encrypted **Razorpay Gateway** (UPI, Google Pay, PhonePe, Cards, NetBanking)\n🚚 **Delivery**: Free Express PAN-India Doorstep Dispatch\n🛡️ **Buyer Protection**: 7-Day Hassle-Free Returns & Full Money-Back Guarantee\n\nTap **"Pay with Razorpay"** below to complete your purchase securely:`,
      agentAction: {
        type: "INITIATE_CHECKOUT"
      },
      inChatCheckout: {
        ready: true,
        message: "Payment Gateway Ready! Secure 1-Click Pay with Razorpay:",
        actionText: "⚡ Pay Now with Razorpay"
      },
      products: [],
      relatedProducts: [],
      suggestedFollowUpQueries: ["Show My Cart 🛒", "Order Tracking Info 📦", "Available Coupons"]
    };
  }

  // ===================== PROCESS WITH GEMINI OR SMART FALLBACK =====================
  const userHasSpecified = hasUserSpecifiedRequirements(userQuery, conversationHistory);
  let matched = searchProductsLocally(userQuery);

  // If matched catalog items are empty or sparse, generate dynamic prototype demo products matching exact specifications
  if (matched.length === 0 || (userHasSpecified && matched.length < 2)) {
    const demoItems = generateDemoProductsForQuery(userQuery);
    if (demoItems.length > 0) {
      matched = [...demoItems, ...matched];
    }
  }

  const topProducts = matched.slice(0, 6);

  if (genAI) {
    return await generateGeminiResponse(userQuery, conversationHistory, cartContext, topProducts, userHasSpecified);
  } else {
    return generateFallbackResponse(userQuery, topProducts, userHasSpecified);
  }
}

async function generateGeminiResponse(userQuery, conversationHistory = [], cartContext = [], topProducts = [], userHasSpecified = false) {
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

  // Build conversation history summary
  let historyPrompt = "";
  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    historyPrompt = "\n\nRecent Conversation History:\n" + conversationHistory
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Customer' : 'AI Consultant'}: ${m.text}`)
      .join('\n');
  }

  const specInstruction = userHasSpecified 
    ? `\n\n⚠️ INSTRUCTION: The user has ALREADY specified requirements or chosen options. You MUST set "questionnaire": null. Break down the specifications of the recommended products and recommend complementary accessories in clean English.`
    : `\n\n⚠️ INSTRUCTION: If the user's query is broad and initial, you may present a 3-4 option questionnaire. Otherwise, provide concrete product specifications and set "questionnaire": null.`;

  const userPrompt = `Customer Query: "${userQuery}"${historyPrompt}
${cartInfo}

Catalog Recommendations & Available Specifications:
${productContext || 'Demo specification products available.'}${specInstruction}

YOUR GOAL IN THIS TURN:
1. Act as the Senior Commerce Consultant and Advisor.
2. Reply in articulate, 100% professional English.
3. If requirements are specified (or previously chosen), analyze the exact hardware/material specifications, why they meet the requirements, and suggest an upsell accessory. Set "questionnaire": null.
4. Always return strictly valid JSON.`;

  try {
    const geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SHOPPING_SYSTEM_PROMPT
    });

    const result = await geminiModel.generateContent(userPrompt);
    const responseText = result.response.text();

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
        suggestedFollowUpQueries: ["Top Gaming Laptops 🎮", "Best Deals Under ₹50,000", "Show My Cart 🛒"],
        upsellPitch: null
      };
    }

    // If user has already specified requirements, override questionnaire to null
    if (userHasSpecified) {
      parsed.questionnaire = null;
    }

    const hasQuestionnaire = Boolean(parsed.questionnaire);
    const attachedProducts = hasQuestionnaire ? [] : topProducts;
    const relatedProducts = hasQuestionnaire ? [] : getRelatedProductsForCategory(userQuery, attachedProducts);

    return {
      success: true,
      reply: parsed.reply || responseText,
      questionnaire: parsed.questionnaire || null,
      products: attachedProducts,
      relatedProducts: relatedProducts,
      upsellPitch: hasQuestionnaire ? null : (parsed.upsellPitch || null),
      campaign: {
        title: "⚡ Flash Sale — Ending Soon!",
        badge: "Extra ₹50 Off Applied",
        urgencyText: "Only a few units left at wholesale rates — lock in your order! ⏳"
      },
      suggestedFollowUpQueries: parsed.suggestedFollowUpQueries || [
        "Top Gaming Laptops 🎮",
        "Show Electronics 💻",
        "Explore Best Sellers ⭐",
        "Show My Cart 🛒"
      ],
      poweredBy: "Infinity AI + Gemini"
    };

  } catch (err) {
    console.error('[Gemini API Error]:', err.message);
    return generateFallbackResponse(userQuery, topProducts, userHasSpecified);
  }
}

// Robust fallback response with technical specifications in professional English
function generateFallbackResponse(userQuery, matched = [], userHasSpecified = false) {
  const q = userQuery.toLowerCase();
  let reply = "";
  let upsell = null;
  let questionnaire = null;

  // If user has not specified details and it's a broad initial laptop query, show questionnaire ONCE
  const isGenericLaptop = (q.includes("laptop") || q.includes("computer") || q.includes("notebook") || q.includes("macbook")) && !userHasSpecified;

  if (isGenericLaptop) {
    reply = `Welcome to **Infinity Store**! I am your Senior Personal Shopping Advisor.\n\nTo tailor the exact hardware configuration (Processor, Dedicated GPU, Display Refresh Rate, and RAM) for your workload, please select your primary requirement below or enter custom specifications:`;
    questionnaire = {
      title: "Select your usage & specifications or enter custom preferences:",
      options: [
        { id: "opt-1", label: "🎮 High-FPS Esports & Gaming (RTX 4070 / 4080, 240Hz Mini-LED)", value: "Gaming laptop with dedicated RTX 4070/4080 graphics, 240Hz Mini-LED display, and vapor chamber cooling" },
        { id: "opt-2", label: "💻 Software Development & Multitasking (Core i7/i9, 32GB RAM)", value: "Programming and coding laptop with 32GB RAM and fast processor" },
        { id: "opt-3", label: "💰 Value Budget Gaming & Office (RTX 4050 / Under ₹60,000)", value: "Best budget gaming laptop with RTX graphics under 60000" },
        { id: "opt-4", label: "⚡ Ultra-Thin & Lightweight (OLED Display, 1.6kg & 12Hr Battery)", value: "Slim lightweight OLED laptop with 12 hour battery life" }
      ],
      customPlaceholder: "Or type custom requirements (e.g. 16GB RAM, Under ₹50,000)..."
    };
    upsell = {
      title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
      price: 399,
      pitchMessage: "Pair your laptop with an ergonomic optical gaming mouse and mechanical keyboard for peak precision and comfort."
    };
  } else if (q.includes("laptop") || q.includes("computer") || q.includes("notebook") || q.includes("macbook") || q.includes("gaming")) {
    // User already specified requirements: provide technical breakdown + show matched prototype products
    questionnaire = null;
    const topItem = matched[0] || {};
    reply = `Here is the comprehensive specification breakdown for our top-recommended laptops matching your criteria! 💻🔥\n\n⚡ **Technical Specifications & Performance Highlights**:\n• **Processing Power**: High-performance multi-core architecture designed for high-load compiling, 4K rendering, and modern AAA gaming.\n• **Dedicated Graphics**: NVIDIA GeForce RTX Series with Ray Tracing, Tensor Cores, and DLSS 3.5 frame generation.\n• **Display Quality**: High-refresh rate IPS / OLED panel (up to 240Hz) with 100% sRGB/DCI-P3 color accuracy for crisp visuals.\n• **Thermal Engineering**: Dual-fan multi-heatpipe cooling system to maintain sustained boost clocks without thermal throttling.\n• **Memory & Storage**: Expandable dual-channel DDR5 RAM paired with high-speed PCIe Gen4 NVMe SSD.\n\n💰 **Best Available Deal**: Starting at **₹${topItem.price ? topItem.price.toLocaleString('en-IN') : '54,990'}** (MRP: ₹${topItem.originalPrice ? topItem.originalPrice.toLocaleString('en-IN') : '79,990'} — **Save ₹${topItem.originalPrice && topItem.price ? (topItem.originalPrice - topItem.price).toLocaleString('en-IN') : '25,000'}**).\n\n🛡️ **Buyer Protection**: Official Razorpay Payment Gateway (UPI, Cards, NetBanking), Free Express PAN-India Delivery, and 7-Day Easy Returns. **Explore the recommended models and essential complementary add-ons below!** 🛒`;
    upsell = {
      title: "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
      price: 399,
      pitchMessage: "We recommend pairing your laptop with our high-precision optical gaming mouse and mechanical keyboard for the ideal setup."
    };
  } else if (q.includes("phone") || q.includes("smartphone") || q.includes("mobile") || q.includes("5g")) {
    questionnaire = null;
    reply = `Here is the comprehensive specification breakdown for our top-tier smartphones! 📱✨\n\n⚡ **Engineered Specifications & Key Highlights**:\n• **Camera Sensor**: 108MP Pro OIS Primary Sensor with f/1.7 aperture — captures crisp low-light details and ultra-stable 4K video.\n• **Display**: 120Hz Curved AMOLED HDR10+ with 1300 nits peak brightness — sunlight-readable with ultra-fluid touch response.\n• **HyperCharge Architecture**: 67W/120W Turbo Flash Charge (0 to 100% in under 22 minutes) — never get stranded with a low battery.\n• **Connectivity**: Dual 5G SIM with 13 global bands for blazing low-latency speeds.\n\n💰 **Value Proposition**: Available starting at **₹${matched[0]?.price || '7,499'}** (MRP: ₹${matched[0]?.originalPrice || '14,999'} — **50% OFF** today).\n⏰ **Limited Units**: Promotional stock selling fast!\n\n💡 *Tip: Check out the complementary accessories below to protect your screen and enable ultra-fast GaN charging!* ⚡\n\n🛡️ **Zero Risk**: Official Razorpay Gateway + 7-Day Easy Returns. **Tap Add to Cart to secure your discount!** 🛒`;
    upsell = {
      title: "65W GaN Fast Charger with Braided Type-C Cable",
      price: 299,
      pitchMessage: "92% of smartphone buyers add this 65W GaN charger to power their device 3x faster than standard adapters."
    };
  } else if (q.includes("tshirt") || q.includes("t-shirt") || q.includes("shirt") || q.includes("polo") || q.includes("tee")) {
    questionnaire = null;
    reply = `Here is the fabric and material breakdown for our premium apparel collection! 👕🔥\n\n✨ **Material Specifications & Key Features**:\n• **Fabric Composition**: 100% Pure Bio-Washed Combed Cotton at **220 GSM** — ultra-durable heavyweight drape that maintains shape wash after wash.\n• **Silhouette**: Engineered Drop-Shoulder Oversized boxy cut — the modern standard for relaxed streetwear aesthetics.\n• **Breathability**: Pre-shrunk breathable knit delivers all-day comfort across all seasons.\n\n💰 **Special Deal**: Starting at only **₹${matched[0]?.price || '199'}** (MRP: ₹${matched[0]?.originalPrice || '699'} — **Flat 70% OFF**).\n\n🚚 **Free Delivery + 7-Day Easy Returns + Razorpay Protection**. **Explore matching bottomwear and footwear below!** 🛒`;
    upsell = {
      title: "6-Pocket Tactical Heavyweight Cargo Pants",
      price: 399,
      pitchMessage: "Pair this oversized T-shirt with our heavyweight 6-pocket cargo pants for a complete streetwear aesthetic look."
    };
  } else if (q.includes("saree") || q.includes("wedding") || q.includes("lehenga") || q.includes("kurti")) {
    questionnaire = null;
    reply = `Here is the craft and fabric specification review for our Royal Festive collection! 👗✨\n\n🌟 **Craftsmanship Specifications & Highlights**:\n• **Textile**: Pure Banarasi Art Silk with intricate Heavy Golden Zari Pallu — delivers an elegant shimmer under festive lighting.\n• **Drape Dynamics**: Lightweight 5.5m saree + 0.8m unstitched designer blouse piece — drapes effortlessly with structured pleats.\n• **Occasion Versatility**: Tailored for weddings, festive ceremonies, and grand evening receptions.\n\n💰 **Pricing**: Wholesale starting at **₹${matched[0]?.price || '249'}** (Boutique MRP: ₹${matched[0]?.originalPrice || '1,499'} — **Up to 80% OFF**).\n\n🛡️ **100% Safe Checkout via Razorpay + 7-Day Doorstep Returns**. **Check out the matching temple jewelry and designer clutches below!** 🛒`;
    upsell = {
      title: "Traditional 24K Gold Plated Temple Choker Jewellery Set",
      price: 249,
      pitchMessage: "Pair this royal saree with our matching 24K Temple Gold Choker set for a complete, regal festive look."
    };
  } else if (q.includes("shoe") || q.includes("sneaker") || q.includes("footwear") || q.includes("sandal")) {
    questionnaire = null;
    reply = `Here is the ergonomic specification breakdown for our top-rated footwear! 👟🔥\n\n☁️ **Ergonomic Specifications & Key Features**:\n• **Midsole Technology**: High-rebound Air-Cushion EVA Sole — absorbs impact shock and relieves heel pressure during all-day walking.\n• **Upper Construction**: Breathable knit mesh with reinforced overlays — delivers flexibility, ventilation, and athletic styling.\n• **Traction**: Anti-skid rubberized grooved outsole for confident grip on all indoor and outdoor surfaces.\n\n💰 **Special Rate**: Starting at **₹${matched[0]?.price || '299'}** (Retail: ₹${matched[0]?.originalPrice || '1,299'} — **75% OFF**).\n\n🛡️ **Hassle-Free Size Exchange + 7-Day Returns + Razorpay Protection**. **Explore related memory foam insoles and socks below!** 🛒`;
    upsell = {
      title: "Orthopedic Memory Foam Cloud Insoles (Set of 2 Pairs)",
      price: 149,
      pitchMessage: "Bundle these shoes with memory foam cloud insoles for custom arch support and all-day walking comfort."
    };
  } else {
    questionnaire = null;
    reply = `I have scanned our catalog and curated recommendations matching your query **"${userQuery}"**! 🛍️✨\n\n🏆 **Specification & Value Highlights**:\n• **Verified Build Quality**: Every curated match features high-grade materials, manufacturer quality verification, and reliable performance.\n• **Top Customer Ratings**: Rated 4.5★+ average across thousands of verified customer reviews.\n• **Maximum Value**: Locked at factory-direct pricing with **up to 70% OFF** + **Extra ₹50 First-Order Discount (Code: FIRST50)**.\n\n🛡️ **Protected By Razorpay**: 100% Encrypted Transactions + Free Express Delivery + 7-Day Easy Returns.\n\n**Explore the specifications and complementary accessories below!** 🛒`;
    upsell = {
      title: "Wireless Bluetooth 5.3 Deep Bass Neckband",
      price: 299,
      pitchMessage: "Enjoy 60-hour playtime and ENC crystal-clear calling with our top-rated wireless neckband."
    };
  }

  const attachedProducts = questionnaire ? [] : matched;
  const relatedProducts = questionnaire ? [] : getRelatedProductsForCategory(userQuery, attachedProducts);

  return {
    success: true,
    reply,
    questionnaire,
    products: attachedProducts,
    relatedProducts: relatedProducts,
    upsellPitch: questionnaire ? null : upsell,
    campaign: {
      title: "⚡ Flash Sale — Ending Soon!",
      badge: "Extra ₹50 Off Applied",
      urgencyText: "Only a few units left at wholesale rates — lock in your order! ⏳"
    },
    suggestedFollowUpQueries: [
      "Add to Cart 🛒",
      "Proceed to Razorpay Checkout ⚡",
      "Compare Specifications 🔍",
      "Best Deals Under ₹50,000 💰"
    ],
    poweredBy: "Infinity AI"
  };
}
