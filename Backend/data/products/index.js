import { generate100KProducts } from './generator.js';

// Generate 100,000+ products on startup
export const allProducts = generate100KProducts();

console.log(`📦 Loaded ${allProducts.length.toLocaleString()} high-quality products into Infinity Store Catalog!`);

// Fast product lookup map by ID
export const productsById = allProducts.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

// Inverted Tag Index for lightning-fast keyword lookup across 100k items
const tagIndex = new Map();
allProducts.forEach((p, idx) => {
  p.tags.forEach(tag => {
    const t = tag.toLowerCase();
    if (!tagIndex.has(t)) tagIndex.set(t, []);
    tagIndex.get(t).push(idx);
  });
});

// Complete Category Hierarchy with all subcategories
export const categoryHierarchy = [
  {
    mainCategory: "Electronics",
    slug: "electronics",
    subCategories: ["Laptops & Computers", "Smartphones & Mobile", "Gaming & PC Gear", "Audio & Wearables", "Mobile Accessories"],
    itemCount: allProducts.filter(p => p.mainCategory === "Electronics").length
  },
  {
    mainCategory: "Automotive",
    slug: "automotive",
    subCategories: ["Car Accessories", "Bike Accessories & Gear"],
    itemCount: allProducts.filter(p => p.mainCategory === "Automotive").length
  },
  {
    mainCategory: "Clothing",
    slug: "women-ethnic",
    subCategories: ["Sarees", "Kurta Sets", "Kurtis", "T-Shirts", "Shirts", "Bottomwear"],
    itemCount: allProducts.filter(p => p.mainCategory === "Clothing").length
  },
  {
    mainCategory: "Home & Kitchen",
    slug: "home-kitchen",
    subCategories: ["Home Furnishing & Kitchen", "Home Furnishing", "Kitchen & Dining", "Home Decor"],
    itemCount: allProducts.filter(p => p.mainCategory === "Home & Kitchen").length
  },
  {
    mainCategory: "Beauty & Health",
    slug: "beauty-health",
    subCategories: ["Skincare & Makeup", "Makeup", "Skincare"],
    itemCount: allProducts.filter(p => p.mainCategory === "Beauty & Health").length
  },
  {
    mainCategory: "Jewellery & Accessories",
    slug: "jewellery-accessories",
    subCategories: ["Jewellery", "Footwear", "Women Bags"],
    itemCount: allProducts.filter(p => p.mainCategory === "Jewellery & Accessories" || p.mainCategory === "Bags & Footwear").length
  }
];

// High-speed semantic & keyword query searcher across 100k+ items
export function searchProductsLocally(query = "", userPreferences = {}) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);

  if (!words.length) {
    return allProducts.slice(0, 8);
  }

  // Intent classification
  const isLaptop = q.includes("laptop") || q.includes("notebook") || q.includes("macbook");
  const isPhone = q.includes("phone") || q.includes("smartphone") || q.includes("mobile") || q.includes("5g");
  const isCar = q.includes("car") || q.includes("dashcam") || q.includes("vacuum") || q.includes("tire") || q.includes("auto");
  const isBike = q.includes("bike") || q.includes("motorcycle") || q.includes("helmet") || q.includes("biker") || q.includes("riding");
  const isGaming = q.includes("game") || q.includes("gaming") || q.includes("mouse") || q.includes("keyboard") || q.includes("headset") || q.includes("khelna");
  const isTshirt = q.includes("tshirt") || q.includes("t-shirt") || q.includes("tee");
  const isShirt = !isTshirt && (q.includes("shirt") || q.includes("formal shirt") || q.includes("oxford"));
  const isSaree = q.includes("saree") || q.includes("banarasi") || q.includes("silk saree") || q.includes("kanjivaram");
  const isKurti = q.includes("kurti") || q.includes("kurta") || q.includes("anarkali");
  const isJeans = q.includes("jean") || q.includes("jeans") || q.includes("cargo") || q.includes("pant") || q.includes("trouser");
  const isShoes = q.includes("shoe") || q.includes("shoes") || q.includes("sneaker") || q.includes("footwear") || q.includes("sandal") || q.includes("loafer");
  const isBeauty = q.includes("serum") || q.includes("lipstick") || q.includes("makeup") || q.includes("glow") || q.includes("skincare") || q.includes("cream");
  const isHome = q.includes("bedsheet") || q.includes("kitchen") || q.includes("curtain") || q.includes("cookware") || q.includes("ghar");
  const isJewellery = q.includes("jewellery") || q.includes("choker") || q.includes("necklace") || q.includes("ring") || q.includes("earring") || q.includes("jhumka");

  // Price constraints check
  let maxPriceConstraint = null;
  const cleanedQuery = q.replace(/,/g, '');
  const priceMatch = cleanedQuery.match(/(?:under|below|less\s*than|max\s*price|budget\s*(?:is|of|under|:)?|₹)\s*(\d+)|(\d+)\s*(?:ke\s*andar|tak|max|rs|inr|budget)/i);
  if (priceMatch) {
    const rawVal = priceMatch[1] || priceMatch[2];
    if (rawVal) {
      maxPriceConstraint = parseInt(rawVal, 10);
    }
  }

  const candidates = [];
  const scanLimit = allProducts.length;

  for (let i = 0; i < scanLimit; i++) {
    const p = allProducts[i];
    let score = 0;
    const subCat = p.subCategory || "";
    const titleLower = p.title.toLowerCase();

    // Intent scoring
    if (isLaptop) {
      if (subCat === "Laptops & Computers") score += 60;
      else if (titleLower.includes("laptop")) score += 40;
      else if (p.category === "electronics") score += 10;
      else score -= 40;
    } else if (isPhone) {
      if (subCat === "Smartphones & Mobile") score += 60;
      else if (titleLower.includes("phone") || titleLower.includes("smartphone")) score += 40;
      else if (p.category === "electronics") score += 10;
      else score -= 40;
    } else if (isCar) {
      if (subCat === "Car Accessories") score += 60;
      else if (titleLower.includes("car")) score += 40;
      else score -= 35;
    } else if (isBike) {
      if (subCat === "Bike Accessories & Gear") score += 60;
      else if (titleLower.includes("bike") || titleLower.includes("helmet") || titleLower.includes("riding")) score += 40;
      else score -= 35;
    } else if (isGaming) {
      if (subCat === "Gaming & PC Gear") score += 60;
      else if (p.category === "electronics") score += 20;
      else score -= 40;
    } else if (isTshirt) {
      if (subCat === "T-Shirts") score += 60;
      else if (titleLower.includes("t-shirt") || titleLower.includes("tee")) score += 40;
      else score -= 30;
    } else if (isShirt) {
      if (subCat === "Shirts") score += 60;
      else if (titleLower.includes("shirt")) score += 40;
      else score -= 30;
    } else if (isSaree) {
      if (subCat === "Sarees") score += 60;
      else if (p.category === "women-ethnic") score += 20;
      else score -= 35;
    } else if (isKurti) {
      if (subCat === "Kurta Sets" || subCat === "Kurtis") score += 60;
      else if (p.category === "women-ethnic") score += 20;
      else score -= 35;
    } else if (isJeans) {
      if (subCat === "Bottomwear") score += 60;
      else if (titleLower.includes("jean") || titleLower.includes("cargo")) score += 40;
      else score -= 30;
    } else if (isShoes) {
      if (subCat === "Footwear" || subCat === "Men Footwear") score += 60;
      else if (titleLower.includes("shoe") || titleLower.includes("sneaker")) score += 40;
      else score -= 30;
    } else if (isBeauty) {
      if (p.category === "beauty-health") score += 50;
      else score -= 30;
    } else if (isHome) {
      if (p.category === "home-kitchen") score += 50;
      else score -= 30;
    } else if (isJewellery) {
      if (subCat === "Jewellery") score += 60;
      else score -= 30;
    }

    // Token matching
    for (const w of words) {
      if (titleLower.includes(w)) score += 15;
      if (p.tags.some(t => t.includes(w))) score += 10;
      if (subCat.toLowerCase().includes(w)) score += 12;
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
    // If user searched for something specific or with a budget constraint that had no matches,
    // return empty array so the system accurately reports "Product nahi mila"
    return [];
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(c => c.product);
}
