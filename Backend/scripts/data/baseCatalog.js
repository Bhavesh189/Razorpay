// Advanced Procedural Base Catalog Generator
// Generates highly realistic base products which are then expanded by variants to reach 10,000+

const IPHONE_MODELS = ["13", "13 Pro", "13 Pro Max", "14", "14 Plus", "14 Pro", "14 Pro Max", "15", "15 Plus", "15 Pro", "15 Pro Max", "16", "16 Plus", "16 Pro", "16 Pro Max"];
const GALAXY_MODELS = ["S22", "S22+", "S22 Ultra", "S23", "S23+", "S23 Ultra", "S24", "S24+", "S24 Ultra", "S25", "S25+", "S25 Ultra"];
const PIXEL_MODELS = ["6", "6 Pro", "6a", "7", "7 Pro", "7a", "8", "8 Pro", "8a", "9", "9 Pro", "9 Pro XL"];

const MACBOOK_MODELS = ["Air 13\" M1", "Air 13\" M2", "Air 15\" M2", "Air 13\" M3", "Air 15\" M3", "Pro 14\" M2 Pro", "Pro 16\" M2 Max", "Pro 14\" M3 Pro", "Pro 16\" M3 Max"];
const DELL_MODELS = ["XPS 13", "XPS 15", "XPS 17", "Inspiron 14", "Inspiron 15", "Inspiron 16 Plus", "Alienware m16", "Alienware m18"];

const NIKE_SHOES = ["Air Max 270", "Air Max 90", "Air Force 1", "React Infinity Run", "ZoomX Vaporfly", "Pegasus 40", "Dunk Low", "Blazer Mid '77"];
const ADIDAS_SHOES = ["Ultraboost 1.0", "Ultraboost Light", "Stan Smith", "Superstar", "NMD_R1", "Samba OG", "Gazelle"];

export const baseCatalog = [];

// 1. GENERATE SMARTPHONES
IPHONE_MODELS.forEach(model => {
  baseCatalog.push({
    name: `Apple iPhone ${model}`,
    brand: "Apple",
    category: "Smartphones",
    mainCategory: "electronics",
    subCategory: "Smartphones",
    basePrice: 79900 + (model.includes("Pro") ? 30000 : 0) + (model.includes("Max") ? 10000 : 0),
    image: "https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/1.png",
    variants: {
      storage: ["128GB", "256GB", "512GB", "1TB"],
      color: ["Midnight", "Starlight", "Product Red", "Blue", "Purple", "Titanium Black", "Titanium Natural"],
      condition: ["New", "Refurbished - Excellent", "Refurbished - Good"]
    }
  });
});

GALAXY_MODELS.forEach(model => {
  baseCatalog.push({
    name: `Samsung Galaxy ${model}`,
    brand: "Samsung",
    category: "Smartphones",
    mainCategory: "electronics",
    subCategory: "Smartphones",
    basePrice: 74900 + (model.includes("Ultra") ? 40000 : 0) + (model.includes("+") ? 15000 : 0),
    image: "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/1.png",
    variants: {
      storage: ["128GB", "256GB", "512GB", "1TB"],
      color: ["Phantom Black", "Cream", "Green", "Lavender", "Titanium Gray", "Titanium Violet"],
      condition: ["New", "Refurbished - Excellent", "Refurbished - Good"]
    }
  });
});

PIXEL_MODELS.forEach(model => {
  baseCatalog.push({
    name: `Google Pixel ${model}`,
    brand: "Google",
    category: "Smartphones",
    mainCategory: "electronics",
    subCategory: "Smartphones",
    basePrice: 59900 + (model.includes("Pro") ? 30000 : 0),
    image: "https://cdn.dummyjson.com/products/images/smartphones/iPhone%20X/1.png", // fallback
    variants: {
      storage: ["128GB", "256GB", "512GB"],
      color: ["Obsidian", "Snow", "Hazel", "Bay", "Porcelain", "Mint"],
      condition: ["New", "Refurbished - Excellent"]
    }
  });
});

// 2. GENERATE LAPTOPS
MACBOOK_MODELS.forEach(model => {
  baseCatalog.push({
    name: `Apple MacBook ${model}`,
    brand: "Apple",
    category: "Laptops",
    mainCategory: "electronics",
    subCategory: "Laptops",
    basePrice: 99900 + (model.includes("Pro") ? 80000 : 0) + (model.includes("Max") ? 60000 : 0),
    image: "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/1.png",
    variants: {
      memory: ["8GB", "16GB", "24GB", "32GB", "64GB", "96GB", "128GB"],
      storage: ["256GB", "512GB", "1TB", "2TB", "4TB", "8TB"],
      color: ["Space Gray", "Silver", "Midnight", "Starlight"],
      keyboard: ["US English", "UK English", "Arabic"]
    }
  });
});

DELL_MODELS.forEach(model => {
  baseCatalog.push({
    name: `Dell ${model}`,
    brand: "Dell",
    category: "Laptops",
    mainCategory: "electronics",
    subCategory: "Laptops",
    basePrice: 85900,
    image: "https://cdn.dummyjson.com/products/images/laptops/Asus%20Zenbook%20Pro%20Dual%2015/1.png",
    variants: {
      processor: ["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 7", "AMD Ryzen 9"],
      memory: ["8GB", "16GB", "32GB", "64GB"],
      storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD"],
      display: ["FHD+", "4K UHD+", "OLED Touch"],
      graphics: ["Integrated", "RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080"]
    }
  });
});

// 3. GENERATE SHOES
NIKE_SHOES.forEach(model => {
  baseCatalog.push({
    name: `Nike ${model}`,
    brand: "Nike",
    category: "Shoes",
    mainCategory: "fashion",
    subCategory: "Shoes",
    basePrice: 10999,
    image: "https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png",
    variants: {
      size: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "UK 13"],
      color: ["Triple Black", "White/Platinum", "University Red", "Game Royal", "Cool Grey", "Neon Yellow"],
      width: ["Regular", "Wide (4E)"]
    }
  });
});

ADIDAS_SHOES.forEach(model => {
  baseCatalog.push({
    name: `Adidas ${model}`,
    brand: "Adidas",
    category: "Shoes",
    mainCategory: "fashion",
    subCategory: "Shoes",
    basePrice: 9999,
    image: "https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Jordan%201%20Red%20And%20Black/1.png",
    variants: {
      size: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "UK 13"],
      color: ["Core Black", "Cloud White", "Grey Two", "Legend Ink", "Scarlet"],
      width: ["Regular"]
    }
  });
});

// 4. GENERATE HOME & FURNITURE
const SOFA_MODELS = ["KIVIK 3-Seat", "FRIHETEN Sleeper", "LANDSKRONA", "SÖDERHAMN", "VIMLE", "STOCKHOLM"];
SOFA_MODELS.forEach(model => {
  baseCatalog.push({
    name: `IKEA ${model} Sofa`,
    brand: "IKEA",
    category: "Furniture",
    mainCategory: "home",
    subCategory: "Furniture",
    basePrice: 45000,
    image: "https://cdn.dummyjson.com/products/images/furniture/Bedside%20Table%20African%20Cherry/1.png",
    variants: {
      fabric: ["Tresund light beige", "Tibbleby beige/grey", "Kelinge grey-turquoise", "Hillared anthracite", "Gunnared dark grey", "Viarp beige/brown", "Saxemara light blue"],
      armrests: ["Standard", "Wide", "None"],
      legs: ["Wood", "Metal", "Black Steel"],
      configuration: ["Standard 3-Seat", "With Chaise Longue", "Corner Section"]
    }
  });
});

// Combine arrays logically to build name permutations
export function generateVariations(product) {
  const variations = [];
  const variantKeys = Object.keys(product.variants);
  
  // Helper for recursive combination
  function buildCombos(currentIndex, currentAttrString, currentTags) {
    if (currentIndex === variantKeys.length) {
      variations.push({
        title: `${product.name} - ${currentAttrString}`.trim().replace(/ -$/, ""),
        price: product.basePrice + Math.floor(Math.random() * 2000), // Random slight variance in pricing based on options
        originalPrice: product.basePrice + 3000 + Math.floor(Math.random() * 4000),
        discount: Math.floor(Math.random() * 25) + 5,
        brand: product.brand,
        mainCategory: product.mainCategory,
        subCategory: product.subCategory,
        category: product.category,
        image: product.image,
        tags: [product.brand.toLowerCase(), product.subCategory.toLowerCase(), product.mainCategory.toLowerCase(), ...currentTags]
      });
      return;
    }
    
    const key = variantKeys[currentIndex];
    const options = product.variants[key];
    
    for (const option of options) {
      buildCombos(
        currentIndex + 1, 
        currentAttrString ? `${currentAttrString}, ${option}` : option,
        [...currentTags, option.toLowerCase()]
      );
    }
  }
  
  buildCombos(0, "", []);
  return variations;
}
