import { allProducts } from './data/products/index.js';
import { ProductSearchEngine } from './search/SearchEngine.js';

console.log("==================================================================");
console.log("   INFINITY STORE — ECOMMERCE SEARCH ENGINE BENCHMARK SUITE       ");
console.log("==================================================================");

const searchEngine = new ProductSearchEngine(allProducts);

const REQUIRED_QUERIES = [
  { q: "laptop", expectedCategory: "laptops-computers", desc: "Exact single word" },
  { q: "latop", expectedCategory: "laptops-computers", desc: "Substitution typo" },
  { q: "lptop", expectedCategory: "laptops-computers", desc: "Missing character typo" },
  { q: "lapotp", expectedCategory: "laptops-computers", desc: "Transposition typo" },
  { q: "hodie", expectedCategory: "men-fashion", desc: "Typo" },
  { q: "hodieeee", expectedCategory: "men-fashion", desc: "Repeated characters typo" },
  { q: "hoodie", expectedCategory: "men-fashion", desc: "Exact single word" },
  { q: "smartphone", expectedCategory: "smartphones-mobile", desc: "Exact single word" },
  { q: "smartphne", expectedCategory: "smartphones-mobile", desc: "Missing letter typo" },
  { q: "samsng phone", expectedCategory: "smartphones-mobile", desc: "Brand typo + multi-word" },
  { q: "iphne", expectedCategory: "smartphones-mobile", desc: "Brand typo" },
  { q: "wireles hedphne", expectedCategory: "audio", desc: "Multi-word typos" },
  { q: "air frer", expectedCategory: "home-kitchen", desc: "Multi-word typo" },
  { q: "gaming laptop", expectedCategory: "laptops-computers", desc: "Multi-word exact" },
  { q: "gaming lapto", expectedCategory: "laptops-computers", desc: "Multi-word typo" },
  { q: "rtx 4060 laptop", expectedCategory: "laptops-computers", desc: "Attribute + category" },
  { q: "16gb laptop", expectedCategory: "laptops-computers", desc: "RAM Spec + category" },
  { q: "5g phone", expectedCategory: "smartphones-mobile", desc: "Connectivity + category" },
  { q: "anc headphones", expectedCategory: "audio", desc: "Feature + category" },
  { q: "silk saree", expectedCategory: "women-fashion", desc: "Fabric + category" },
  { q: "running shoes", expectedCategory: "men-fashion", desc: "Product type" },
  { q: "red nike shoes", expectedCategory: "men-fashion", desc: "Color + Brand + Product" },
  { q: "air fryer under 5000", expectedCategory: "home-kitchen", desc: "Category + Price Constraint", maxPrice: 5000 },
  { q: "laptop under 50000", expectedCategory: "laptops-computers", desc: "Category + Price Constraint", maxPrice: 50000 }
];

const latencies = [];
let passCount = 0;

console.log("\n🧪 EXECUTING 24 REQUIRED BENCHMARK QUERIES:\n");

REQUIRED_QUERIES.forEach((test, idx) => {
  const t0 = performance.now();
  const res = searchEngine.search(test.q, { limit: 10 });
  const latency = +(performance.now() - t0).toFixed(2);
  latencies.push(latency);

  const top = res.products ? res.products[0] : null;
  const isCorrect = top && (
    top.category === test.expectedCategory ||
    top.mainCategory?.toLowerCase().includes(test.expectedCategory.toLowerCase()) ||
    test.expectedCategory.includes(top.category) ||
    (test.expectedCategory === 'audio' && top.category === 'electronics')
  );

  let pricePassed = true;
  if (test.maxPrice && top) {
    pricePassed = top.price <= test.maxPrice;
  }

  const passed = isCorrect && pricePassed && res.total > 0;
  if (passed) passCount++;

  console.log(`[${idx + 1}/24] "${test.q}" (${test.desc})`);
  console.log(`      ⚡ Latency: ${latency}ms | Total Matches: ${res.total.toLocaleString()}`);
  if (res.didYouMean) {
    console.log(`      💡 Did You Mean: "${res.didYouMean}"`);
  }
  if (top) {
    console.log(`      🏆 Top Match: "${top.title.substring(0, 65)}..."`);
    console.log(`         Category: ${top.category} | Price: ₹${top.price?.toLocaleString()} | Brand: ${top.brand || 'N/A'}`);
  } else {
    console.log(`      ❌ No products returned!`);
  }
  console.log(`      ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
});

latencies.sort((a, b) => a - b);
const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
const p50 = latencies[Math.floor(latencies.length * 0.5)].toFixed(2);
const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);

console.log("==================================================================");
console.log(`   BENCHMARK SUMMARY: ${passCount} / ${REQUIRED_QUERIES.length} QUERIES PASSED`);
console.log(`   - Average Latency : ${avgLatency} ms`);
console.log(`   - P50 Latency     : ${p50} ms`);
console.log(`   - P95 Latency     : ${p95} ms`);
console.log(`   - Max Latency     : ${latencies[latencies.length - 1]} ms`);
console.log("==================================================================");
