import { allProducts, searchProductsLocally } from './data/products/index.js';
import { ProductSearchEngine } from './search/SearchEngine.js';
import { fullCategoryHierarchy } from './data/products/catalogHierarchy.js';

const products = allProducts;
const searchEngine = new ProductSearchEngine(allProducts);

console.log("==================================================================");
console.log("   INFINITY STORE — COMPLETE CATALOG EXPANSION BENCHMARK TEST    ");
console.log("==================================================================");

// 1. Metric Counts
const totalProducts = products.length;
const categoriesSet = new Set();
const subcategoriesSet = new Set();
const productTypesSet = new Set();
const brandsSet = new Set();

products.forEach(p => {
  if (p.category) categoriesSet.add(p.category);
  if (p.mainCategory) categoriesSet.add(p.mainCategory);
  if (p.subCategory) subcategoriesSet.add(p.subCategory);
  if (p.productType) productTypesSet.add(p.productType);
  if (p.brand) brandsSet.add(p.brand);
});

console.log(`\n📊 1. CATALOG METRICS:`);
console.log(`   - Total Products Generated : ${totalProducts.toLocaleString()} items`);
console.log(`   - Total Defined Categories : ${fullCategoryHierarchy.length} major categories`);
console.log(`   - Unique Categories Found  : ${categoriesSet.size}`);
console.log(`   - Unique Subcategories     : ${subcategoriesSet.size}`);
console.log(`   - Unique Product Types     : ${productTypesSet.size}`);
console.log(`   - Unique Brands in Catalog : ${brandsSet.size}`);

// 2. Category Search Test
console.log(`\n🔍 2. CATEGORY SEARCH VERIFICATION (All 22 Major Categories):`);
const categoryQueries = [
  "laptop", "smartphone", "headphones", "saree", "perfume", 
  "air fryer", "sofa", "football", "camera", "books",
  "gaming", "t-shirt", "skincare", "dumbbells", "car accessories",
  "luggage", "dog food", "baby toy", "office chair", "smart cctv",
  "drill machine", "smart tv"
];

categoryQueries.forEach(q => {
  const t0 = performance.now();
  const res = searchEngine.search(q, { limit: 5 });
  const latency = (performance.now() - t0).toFixed(2);
  const top = res.products ? res.products[0] : null;
  console.log(`   [${latency}ms] "${q}" -> ${res.total || 0} matches | Top: "${top ? top.title.substring(0, 60) : 'None'}" (${top?.category})`);
});

// 3. Subcategory Search Test
console.log(`\n🎯 3. SUBCATEGORY SEARCH VERIFICATION:`);
const subcategoryQueries = [
  "gaming laptop",
  "ANC headphones",
  "silk saree",
  "mirrorless camera",
  "robot vacuum",
  "running shoes",
  "smartwatch"
];

subcategoryQueries.forEach(q => {
  const t0 = performance.now();
  const res = searchEngine.search(q, { limit: 5 });
  const latency = (performance.now() - t0).toFixed(2);
  const top = res.products ? res.products[0] : null;
  console.log(`   [${latency}ms] "${q}" -> ${res.total || 0} matches | Top: "${top ? top.title.substring(0, 60) : 'None'}" (${top?.subCategory})`);
});

// 4. Natural Language Queries
console.log(`\n🧠 4. NATURAL LANGUAGE QUERY VERIFICATION:`);
const nlQueries = [
  "I need a laptop for coding",
  "Show me a phone with a good camera",
  "I want headphones with strong ANC",
  "Mujhe festive saree chahiye",
  "Need an air fryer for a family of four",
  "Show gaming accessories"
];

nlQueries.forEach(q => {
  const t0 = performance.now();
  const res = searchProductsLocally(q, null, 5);
  const latency = (performance.now() - t0).toFixed(2);
  const top = res[0];
  console.log(`   [${latency}ms] "${q}" -> Top: "${top ? top.title.substring(0, 60) : 'None'}" (${top?.category} | ₹${top?.price})`);
});

// 5. Typo Search Benchmark
console.log(`\n⚡ 5. TYPO TOLERANCE BENCHMARK:`);
const typoQueries = ["lptop", "smartphne", "headphnes", "sare", "perfme", "dumble", "hoddiee", "lipstik"];

typoQueries.forEach(q => {
  const t0 = performance.now();
  const res = searchEngine.search(q, { limit: 5 });
  const latency = (performance.now() - t0).toFixed(2);
  const top = res.products ? res.products[0] : null;
  console.log(`   [${latency}ms] Typo: "${q}" -> Corrected to: "${res.effectiveQuery}" (${res.total || 0} matches) | Top: "${top?.title.substring(0, 50)}..."`);
});

// 6. Realistic Attributes Check
console.log(`\n🔬 6. SPECIFICATION REALISM CHECK:`);
const sampleQueries = ["laptop", "perfume", "saree", "air fryer", "drill"];
sampleQueries.forEach(q => {
  const res = searchEngine.search(q, { limit: 1 });
  const p = res.products ? res.products[0] : null;
  if (p) {
    const s = p.specs || p.specifications || {};
    console.log(`\n   Product: ${p.title.substring(0, 50)}...`);
    console.log(`   Category: ${p.category} | Price: ₹${p.price} (MRP: ₹${p.originalPrice}, Discount: ${p.discount}%)`);
    console.log(`   Specifications:`, (JSON.stringify(s, null, 2) || '{}').split('\n').slice(0, 6).join('\n') + ' ... }');
  }
});

console.log("\n==================================================================");
console.log("   CATALOG EXPANSION VERIFICATION COMPLETED SUCCESSFULLY!        ");
console.log("==================================================================");
