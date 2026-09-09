import { generate100KProducts } from './generator.js';
import { fullCategoryHierarchy } from './catalogHierarchy.js';

// Generate 125,000+ products on startup across 22 major categories
export const allProducts = generate100KProducts();

console.log(`📦 Loaded ${allProducts.length.toLocaleString()} high-quality products into Infinity Store Catalog across 22 categories!`);

// Fast product lookup map by ID
export const productsById = allProducts.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

// Inverted Tag Index for lightning-fast keyword lookup across 125k items
const tagIndex = new Map();
allProducts.forEach((p, idx) => {
  p.tags.forEach(tag => {
    const t = tag.toLowerCase();
    if (!tagIndex.has(t)) tagIndex.set(t, []);
    tagIndex.get(t).push(idx);
  });
});

// Complete Category Hierarchy with all 22 major categories and accurate live item counts
export const categoryHierarchy = fullCategoryHierarchy.map(cat => ({
  mainCategory: cat.name,
  slug: cat.slug,
  id: cat.id,
  icon: cat.icon,
  subCategories: cat.subCategories,
  itemCount: allProducts.filter(p => p.category === cat.slug || p.mainCategory.toLowerCase() === cat.name.toLowerCase()).length
}));

// High-speed semantic & keyword query searcher across 125k+ items
export function searchProductsLocally(queryOrOptions = "", userPreferences = {}) {
  let q = "";
  let explicitCategory = null;
  let explicitRequirements = [];
  let explicitBudget = null;
  let isBudgetActive = false;

  if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
    explicitCategory = queryOrOptions.category || "";
    explicitRequirements = Array.isArray(queryOrOptions.requirements) ? queryOrOptions.requirements : (queryOrOptions.priorities || []);
    explicitBudget = queryOrOptions.budget || queryOrOptions.maxPrice || null;
    isBudgetActive = Boolean(queryOrOptions.isBudgetActive || explicitBudget);
    q = [
      explicitCategory,
      explicitRequirements.join(" "),
      queryOrOptions.customQuery || queryOrOptions.customRequirements || "",
      queryOrOptions.query || ""
    ].join(" ").toLowerCase().trim();
  } else {
    q = (queryOrOptions || "").toLowerCase().trim();
  }

  const rawWords = q.split(/\s+/).filter(w => w.length > 1);

  const STOP_WORDS = new Set([
    'hello', 'hi', 'hey', 'bhai', 'bro', 'sir', 'ji', 'kya', 'kr', 'kar', 'skta', 'sakta', 'hai', 'hain',
    'tu', 'tum', 'aap', 'mera', 'meri', 'mujhe', 'muje', 'ko', 'se', 'me', 'mein', 'par', 'tha', 'thi',
    'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'to', 'for', 'of', 'in', 'on', 'with',
    'how', 'what', 'who', 'when', 'where', 'why', 'can', 'you', 'do', 'doing', 'kesa', 'kaisa', 'kaise', 'haal', 'accha', 'acha'
  ]);

  const words = rawWords.filter(w => !STOP_WORDS.has(w));

  if (!rawWords.length && !explicitCategory) {
    return [];
  }

  // Intent classification across all 22 major categories
  const catLower = (explicitCategory || "").toLowerCase();
  const isLaptop = catLower.includes("laptop") || catLower.includes("computer") || q.includes("laptop") || q.includes("notebook") || q.includes("macbook") || q.includes("coding laptop");
  const isAudio = catLower.includes("audio") || catLower.includes("headphone") || q.includes("headphone") || q.includes("earphone") || q.includes("earbud") || q.includes("tws") || q.includes("soundbar") || q.includes("speaker") || q.includes("anc") || q.includes("neckband");
  const isPhone = !isAudio && (catLower.includes("phone") || catLower.includes("mobile") || q.includes("smartphone") || q.includes("mobile") || /\bphone\b/i.test(q) || q.includes("5g"));
  const isSmartwatch = catLower.includes("smartwatch") || q.includes("smartwatch") || q.includes("calling watch") || q.includes("fitness band") || (q.includes("watch") && (q.includes("calling") || q.includes("smart") || q.includes("bluetooth")));
  const isWatch = !isSmartwatch && (catLower.includes("watch") || q.includes("watch") || q.includes("ghadi") || q.includes("chronograph") || q.includes("wrist watch"));
  const isTV = catLower.includes("tv") || q.includes("tv") || q.includes("smart tv") || q.includes("television") || q.includes("projector");
  const isCamera = catLower.includes("camera") || q.includes("camera") || q.includes("dslr") || q.includes("mirrorless") || q.includes("lens") || q.includes("gimbal") || q.includes("vlog");
  const isGaming = q.includes("gaming") || q.includes("mouse") || q.includes("keyboard") || q.includes("headset") || q.includes("controller") || q.includes("gamepad") || q.includes("rtx") || q.includes("console");
  const isCar = catLower.includes("car") || q.includes("car") || q.includes("dashcam") || q.includes("tire") || q.includes("auto");
  const isBike = catLower.includes("bike") || q.includes("bike") || q.includes("motorcycle") || q.includes("helmet") || q.includes("biker") || q.includes("riding");
  const isKitchenAppliance = catLower.includes("appliance") || catLower.includes("kitchen") || q.includes("air fryer") || q.includes("fryer") || q.includes("blender") || q.includes("mixer") || q.includes("coffee") || q.includes("kettle") || q.includes("induction") || q.includes("juicer") || q.includes("toaster") || q.includes("cookware");
  const isGymFitness = catLower.includes("fitness") || catLower.includes("sport") || q.includes("gym") || q.includes("fitness") || q.includes("dumbbell") || q.includes("dumble") || q.includes("yoga") || q.includes("massage gun") || q.includes("skipping") || q.includes("workout") || q.includes("protein") || q.includes("shaker") || q.includes("exercise") || q.includes("badminton") || q.includes("rope");
  const isPerfume = catLower.includes("fragrance") || catLower.includes("perfume") || q.includes("perfume") || q.includes("fragrance") || q.includes("oud") || q.includes("attar") || q.includes("scent") || q.includes("cologne") || q.includes("edp") || q.includes("itr") || q.includes("khushboo");
  const isGrooming = catLower.includes("grooming") || q.includes("trimmer") || q.includes("shaver") || q.includes("hair straightener") || q.includes("hair dryer") || q.includes("curler") || q.includes("beard") || q.includes("grooming");
  const isLuggage = catLower.includes("bag") || catLower.includes("luggage") || catLower.includes("travel") || q.includes("backpack") || q.includes("luggage") || q.includes("trolley") || q.includes("duffel") || q.includes("travel bag") || q.includes("bag");
  const isTshirt = q.includes("tshirt") || q.includes("t-shirt") || q.includes("tee") || q.includes("hoodie") || q.includes("hoddiee");
  const isShirt = !isTshirt && (q.includes("shirt") || q.includes("formal shirt") || q.includes("oxford") || q.includes("kurta shirt") || q.includes("shrt"));
  const isSaree = catLower.includes("ethnic") || catLower.includes("saree") || q.includes("saree") || q.includes("sari") || q.includes("banarasi") || q.includes("silk saree") || q.includes("kanjivaram");
  const isKurti = q.includes("kurti") || q.includes("kurta") || q.includes("anarkali") || q.includes("suit");
  const isJeans = q.includes("jean") || q.includes("jeans") || q.includes("cargo") || q.includes("pant") || q.includes("trouser") || q.includes("trackpant");
  const isShoes = catLower.includes("footwear") || catLower.includes("shoe") || q.includes("shoe") || q.includes("shoes") || q.includes("sneaker") || q.includes("footwear") || q.includes("sandal") || q.includes("loafer") || q.includes("jutti") || q.includes("boots");
  const isBeauty = catLower.includes("beauty") || q.includes("serum") || q.includes("lipstick") || q.includes("lipstik") || q.includes("makeup") || q.includes("glow") || q.includes("skincare") || q.includes("sunscreen");
  const isFurniture = catLower.includes("furniture") || q.includes("chair") || q.includes("desk") || q.includes("table") || q.includes("sofa") || q.includes("bed") || q.includes("mattress");
  const isHomeDecor = catLower.includes("decor") || q.includes("bedsheet") || q.includes("curtain") || q.includes("curtian") || q.includes("cushion") || q.includes("diffuser") || q.includes("lamp") || q.includes("painting");
  const isBooks = catLower.includes("book") || q.includes("book") || q.includes("dsa") || q.includes("coding interview") || q.includes("algorithm") || q.includes("study");
  const isPets = catLower.includes("pet") || q.includes("dog food") || q.includes("cat food") || q.includes("pet bed") || q.includes("puppy");
  const isKids = catLower.includes("kid") || catLower.includes("baby") || q.includes("toy") || q.includes("toys") || q.includes("rc car") || q.includes("drone") || q.includes("stroller");
  const isTools = catLower.includes("tool") || q.includes("drill") || q.includes("toolkit") || q.includes("screwdriver") || q.includes("measuring");
  const isSmartHome = catLower.includes("smart home") || q.includes("cctv") || q.includes("smart plug") || q.includes("wifi camera") || q.includes("smart light");
  const isWalletOrShades = q.includes("wallet") || q.includes("sunglass") || q.includes("shades") || q.includes("belt");
  const isJewellery = catLower.includes("jewel") || q.includes("jewel") || q.includes("necklace") || q.includes("earring") || q.includes("bangle") || q.includes("gold");
  const isToy = isKids || q.includes("toy");
  const isHome = isHomeDecor || isKitchenAppliance || isFurniture;

  const hasCategoryIntent = isLaptop || isPhone || isAudio || isTV || isCamera || isGaming || isCar || isBike || isKitchenAppliance || isGymFitness || isPerfume || isGrooming || isLuggage || isWalletOrShades || isTshirt || isShirt || isSaree || isKurti || isJeans || isShoes || isBeauty || isFurniture || isHomeDecor || isBooks || isPets || isKids || isTools || isSmartHome || isJewellery || Boolean(explicitCategory);

  // If query is conversational or has no shopping intent words, DO NOT return random products
  if (!hasCategoryIntent && words.length === 0) {
    return [];
  }

  // Price constraints check
  let maxPriceConstraint = null;
  if (isBudgetActive && explicitBudget && !isNaN(Number(explicitBudget))) {
    maxPriceConstraint = Number(explicitBudget);
  } else {
    const cleanedQuery = q.replace(/,/g, '');
    const priceMatch = cleanedQuery.match(/(?:under|below|less\s*than|max\s*price|budget\s*(?:is|of|under|:)?|₹)\s*(\d+)|(\d+)\s*(?:ke\s*andar|tak|max|rs|inr|budget)/i);
    if (priceMatch) {
      const p = parseInt(priceMatch[1] || priceMatch[2]);
      if (p > 50 && p <= 500000) maxPriceConstraint = p;
    }
  }

  const candidates = [];

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    let score = 0;
    const titleLower = p.title.toLowerCase();
    const subCat = p.subCategory || "";
    const catSlug = p.category || "";

    // Exact Category Match Boosting
    if (explicitCategory && (catSlug === explicitCategory || p.mainCategory.toLowerCase() === explicitCategory.toLowerCase())) {
      score += 150;
    }

    if (isLaptop) {
      if (catSlug === "laptops-computers" || p.tags.some(t => t.includes("laptop") || t.includes("ultrabook") || t.includes("macbook") || t.includes("computer"))) score += 80;
      else score -= 45;
    } else if (isPhone) {
      if (catSlug === "smartphones-mobile" || p.tags.some(t => t.includes("phone") || t.includes("smartphone") || t.includes("mobile") || t.includes("5g"))) score += 80;
      else score -= 45;
    } else if (isAudio) {
      if (catSlug === "audio" || p.tags.some(t => t.includes("audio") || t.includes("headphones") || t.includes("earbuds") || t.includes("soundbar") || t.includes("speaker"))) score += 80;
      else score -= 45;
    } else if (isSmartwatch) {
      if (titleLower.includes("smartwatch") || titleLower.includes("calling watch") || titleLower.includes("fitness band")) score += 70;
      else score -= 35;
    } else if (isWatch) {
      if (subCat.includes("Accessories") && (titleLower.includes("watch") || titleLower.includes("chronograph"))) score += 60;
      else score -= 35;
    } else if (isTV) {
      if (catSlug === "tv-entertainment" || p.tags.some(t => t.includes("tv") || t.includes("projector"))) score += 80;
      else score -= 45;
    } else if (isCamera) {
      if (catSlug === "cameras" || p.tags.some(t => t.includes("camera") || t.includes("lens") || t.includes("gimbal"))) score += 80;
      else score -= 45;
    } else if (isKitchenAppliance) {
      if (catSlug === "home-kitchen" || p.tags.some(t => t.includes("air fryer") || t.includes("blender") || t.includes("coffee") || t.includes("kettle") || t.includes("induction") || t.includes("kitchen appliance"))) score += 80;
      else score -= 45;
    } else if (isGymFitness) {
      if (catSlug === "fitness-sports" || p.tags.some(t => t.includes("gym") || t.includes("fitness") || t.includes("dumbbell") || t.includes("massage gun") || t.includes("yoga") || t.includes("workout"))) score += 80;
      else score -= 45;
    } else if (isPerfume) {
      if (catSlug === "fragrances" || p.tags.some(t => t.includes("perfume") || t.includes("fragrance") || t.includes("oud") || t.includes("attar") || t.includes("edp") || t.includes("scent"))) score += 85;
      else score -= 50;
    } else if (isGrooming) {
      if (p.tags.some(t => t.includes("trimmer") || t.includes("hair straightener") || t.includes("grooming") || t.includes("shaver"))) score += 70;
      else score -= 35;
    } else if (isLuggage) {
      if (catSlug === "travel-luggage" || p.tags.some(t => t.includes("backpack") || t.includes("luggage") || t.includes("trolley") || t.includes("duffel") || t.includes("travel bag"))) score += 70;
      else score -= 35;
    } else if (isWalletOrShades) {
      if (p.tags.some(t => t.includes("wallet") || t.includes("sunglasses") || t.includes("belt"))) score += 70;
      else score -= 35;
    } else if (isCar) {
      if (catSlug === "automotive" && titleLower.includes("car")) score += 70;
      else if (titleLower.includes("car")) score += 40;
      else score -= 35;
    } else if (isBike) {
      if (catSlug === "automotive" && (titleLower.includes("bike") || titleLower.includes("helmet") || titleLower.includes("riding"))) score += 70;
      else score -= 35;
    } else if (isGaming) {
      if (catSlug === "gaming" || p.tags.some(t => t.includes("gaming") || t.includes("keyboard") || t.includes("mouse") || t.includes("controller"))) score += 70;
      else score -= 40;
    } else if (isTshirt) {
      if (subCat.includes("T-Shirt") || titleLower.includes("t-shirt") || titleLower.includes("tee") || titleLower.includes("hoodie")) score += 70;
      else score -= 30;
    } else if (isShirt) {
      if (subCat.includes("Shirt") || titleLower.includes("shirt")) score += 70;
      else score -= 30;
    } else if (isSaree) {
      if (catSlug === "women-fashion" && (subCat.includes("Saree") || titleLower.includes("saree") || titleLower.includes("sari"))) score += 80;
      else score -= 45;
    } else if (isKurti) {
      if (subCat.includes("Kurta") || subCat.includes("Kurti") || titleLower.includes("kurti") || titleLower.includes("anarkali")) score += 70;
      else score -= 35;
    } else if (isJeans) {
      if (subCat.includes("Bottomwear") || titleLower.includes("jean") || titleLower.includes("cargo") || titleLower.includes("trouser")) score += 70;
      else score -= 30;
    } else if (isShoes) {
      if (subCat.includes("Footwear") || titleLower.includes("shoe") || titleLower.includes("sneaker") || titleLower.includes("boots")) score += 70;
      else score -= 30;
    } else if (isBeauty) {
      if (catSlug === "beauty-care" || p.category === "beauty-health" || p.tags.some(t => t.includes("serum") || t.includes("lipstick") || t.includes("skincare"))) score += 70;
      else score -= 30;
    } else if (isFurniture) {
      if (catSlug === "furniture" || p.tags.some(t => t.includes("chair") || t.includes("desk") || t.includes("table") || t.includes("sofa") || t.includes("bed"))) score += 75;
      else score -= 40;
    } else if (isHomeDecor) {
      if (catSlug === "home-decor" || p.tags.some(t => t.includes("bedsheet") || t.includes("curtain") || t.includes("cushion") || t.includes("diffuser") || t.includes("lamp"))) score += 75;
      else score -= 40;
    } else if (isBooks) {
      if (catSlug === "books-education" || p.tags.some(t => t.includes("book") || t.includes("dsa") || t.includes("algorithm"))) score += 80;
      else score -= 40;
    } else if (isPets) {
      if (catSlug === "pet-supplies" || p.tags.some(t => t.includes("dog food") || t.includes("cat food") || t.includes("pet bed"))) score += 80;
      else score -= 40;
    } else if (isKids) {
      if (catSlug === "baby-kids" || p.tags.some(t => t.includes("toy") || t.includes("rc car") || t.includes("drone") || t.includes("baby"))) score += 80;
      else score -= 40;
    } else if (isTools) {
      if (catSlug === "industrial-tools" || p.tags.some(t => t.includes("drill") || t.includes("tool") || t.includes("screwdriver"))) score += 80;
      else score -= 40;
    } else if (isSmartHome) {
      if (catSlug === "smart-home" || p.tags.some(t => t.includes("cctv") || t.includes("smart plug") || t.includes("wifi camera"))) score += 80;
      else score -= 40;
    }

    // Token matching across title, tags and category
    for (const w of words) {
      if (titleLower.includes(w)) score += 18;
      if (p.tags.some(t => t.includes(w))) score += 14;
      if (subCat.toLowerCase().includes(w)) score += 12;
      if (p.mainCategory?.toLowerCase().includes(w)) score += 10;
    }

    // Apply strict price constraint if specified
    if (maxPriceConstraint && maxPriceConstraint > 0) {
      if (p.price <= maxPriceConstraint) {
        score += 50;
      } else {
        score -= 500; // Strictly penalize products that exceed user's stated budget
      }
    }

    if (score > 0) {
      if (!maxPriceConstraint || p.price <= maxPriceConstraint) {
        candidates.push({ product: p, score });
      }
    }
  }

  if (candidates.length === 0) {
    return [];
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(c => c.product);
}
