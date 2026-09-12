/**
 * =========================================================================================
 * INFINITY STORE — PRODUCTION ECOMMERCE PRODUCT SEARCH ENGINE
 * =========================================================================================
 *
 * Implemented Data Structures & Algorithms:
 * 1. INVERTED INDEX with Field Weighting & Posting Lists (Average O(1) Token Lookup)
 * 2. PREFIX TRIE with Frequency-Ranked Autocomplete Cache (O(K) Prefix Lookup)
 * 3. BK-TREE with DAMERAU-LEVENSHTEIN DISTANCE (O(log V) Typo Correction & Transpositions)
 * 4. DYNAMIC EDIT-DISTANCE THRESHOLD based on Token Length (1-3: 0, 4-5: 1, 6-8: 2, 9+: 2-3)
 * 5. REPEATED-CHARACTER NORMALIZER (Handles "hodieeee" -> "hoodie", "laptoooop" -> "laptop")
 * 6. BRAND BK-TREE & BRAND INDEX (Handles "samsng" -> "Samsung", "aple" -> "Apple", "nik" -> "Nike")
 * 7. ATTRIBUTE & SPECIFICATION INDEX (Handles "16gb", "rtx 4060", "1tb ssd", "5g", "amoled", "5.5l")
 * 8. PRICE CONSTRAINT PARSER (Extracts "under 50000", "below 20k", "₹5000", "50k", "20 hazar", "between X and Y")
 * 9. HINGLISH QUERY NORMALIZER ("mujhe laptop chahiye", "gaming wala laptop", "ladko ke shoes")
 * 10. CONTROLLED ECOMMERCE SYNONYM DICTIONARY (Category-Aware)
 * 11. MODIFIED OKAPI BM25 with EXACT PHRASE & FIELD BOOSTING
 * 12. STREAMING MIN-HEAP (Top-K Selection in O(M log K) without full array sorting)
 * =========================================================================================
 */

import { IndexSnapshotManager } from './IndexSnapshotManager.js';

// ==========================================
// 1. DAMERAU-LEVENSHTEIN DISTANCE
// ==========================================
/**
 * Computes Damerau-Levenshtein distance with adjacent transposition support:
 * - Insertions
 * - Deletions
 * - Substitutions
 * - Transpositions (e.g. "lapotp" -> "laptop" is distance 1)
 */
export function damerauLevenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1 || !s2) return Math.max(s1 ? s1.length : 0, s2 ? s2.length : 0);

  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const d = [];
  const maxdist = len1 + len2;

  for (let i = 0; i <= len1 + 1; i++) {
    d[i] = new Array(len2 + 2).fill(0);
  }

  d[0][0] = maxdist;
  for (let i = 0; i <= len1; i++) {
    d[i + 1][0] = maxdist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= len2; j++) {
    d[0][j + 1] = maxdist;
    d[1][j + 1] = j;
  }

  const da = {};

  for (let i = 1; i <= len1; i++) {
    let db = 0;
    for (let j = 1; j <= len2; j++) {
      const i1 = da[s2[j - 1]] || 0;
      const j1 = db;
      let cost = 1;
      if (s1[i - 1] === s2[j - 1]) {
        cost = 0;
        db = j;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j + 1] + 1, // deletion
        d[i + 1][j] + 1, // insertion
        d[i][j] + cost,  // substitution
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // adjacent transposition
      );
    }
    da[s1[i - 1]] = i;
  }

  return d[len1 + 1][len2 + 1];
}

/**
 * Dynamic Edit-Distance Threshold based on token length
 */
export function getDynamicEditDistance(token) {
  const len = token.length;
  if (len <= 3) return 0; // exact / prefix only for short 1-3 char words (e.g. "air", "red", "pc")
  if (len <= 5) return 1; // max 1 edit for 4-5 char words (e.g. "latop" -> "laptop", "hodie" -> "hoodie")
  if (len <= 8) return 2; // max 2 edits for 6-8 char words (e.g. "smartphne" -> "smartphone")
  return 2;              // max 2 edits for 9+ chars
}

// ==========================================
// 2. CONTROLLED ECOMMERCE SYNONYMS DICTIONARY
// ==========================================
export const ECOMMERCE_SYNONYMS = {
  // Mobile / Phone
  "mobile": ["smartphone", "phone"],
  "phone": ["smartphone", "mobile"],
  "mobiles": ["smartphone", "mobile"],
  "phones": ["smartphone", "mobile"],
  "cellphone": ["smartphone", "mobile"],

  // Laptops / Computers
  "laptop": ["notebook", "ultrabook", "computer"],
  "laptops": ["laptop", "notebook", "computer"],
  "notebook": ["laptop"],
  "ultrabook": ["laptop"],
  "computer": ["laptop", "pc", "desktop"],
  "pc": ["desktop", "gaming pc", "computer"],

  // Audio / Headphones
  "headphones": ["headset", "earphones", "earbuds"],
  "headphone": ["headphones", "headset"],
  "headset": ["headphones", "gaming headset"],
  "earbuds": ["tws", "wireless earbuds", "earphones"],
  "earbud": ["earbuds", "tws"],
  "earphones": ["earbuds", "headphones", "neckband"],
  "earphone": ["earphones", "earbuds"],
  "tws": ["earbuds", "wireless earbuds"],
  "soundbar": ["speaker", "soundbar"],
  "speakers": ["speaker", "bluetooth speaker"],
  "speaker": ["bluetooth speaker", "soundbar"],

  // TV / Entertainment
  "tv": ["smart tv", "television"],
  "tvs": ["smart tv", "television"],
  "television": ["smart tv", "tv"],
  "projector": ["projectors", "home cinema"],

  // Fashion & Apparel
  "hoodie": ["sweatshirt", "hooded sweatshirt"],
  "hoodies": ["hoodie", "sweatshirt"],
  "sweatshirt": ["hoodie"],
  "sweatshirts": ["hoodie"],
  "tshirt": ["t-shirt", "tee"],
  "tshirts": ["t-shirt", "tees"],
  "tee": ["t-shirt", "tshirt"],
  "tees": ["t-shirt", "tshirts"],
  "shirt": ["formal shirt", "casual shirt"],
  "shirts": ["shirt"],
  "saree": ["sari", "saari"],
  "sari": ["saree"],
  "saari": ["saree"],
  "sarees": ["saree"],
  "kurti": ["kurta", "anarkali"],
  "kurtis": ["kurti", "kurta"],
  "kurta": ["kurti", "kurta set"],
  "jeans": ["denim", "pants", "trousers"],
  "jean": ["jeans"],
  "pants": ["trousers", "jeans", "cargo"],
  "trousers": ["pants", "chinos"],
  "cargo": ["cargo pants"],
  "cargos": ["cargo pants"],

  // Footwear
  "shoes": ["footwear", "sneakers", "running shoes"],
  "shoe": ["shoes", "sneakers"],
  "sneakers": ["shoes", "trainers", "sneaker"],
  "sneaker": ["sneakers", "shoes"],
  "footwear": ["shoes", "sandals"],
  "loafers": ["formal shoes", "shoes"],
  "loafer": ["loafers", "shoes"],
  "boots": ["hiking boots", "shoes"],

  // Home, Kitchen & Living
  "airfryer": ["air fryer", "fryer"],
  "fryer": ["air fryer"],
  "sofa": ["couch", "sectional sofa"],
  "couch": ["sofa"],
  "kettle": ["electric kettle"],
  "mixer": ["blender", "grinder"],
  "blender": ["mixer", "juicer"],
  "curtains": ["curtain", "blackout curtains"],
  "curtain": ["curtains"],
  "bedsheet": ["bedsheets"],
  "bedsheets": ["bedsheet"],

  // Beauty & Fragrance
  "perfume": ["fragrance", "scent", "edp", "attar"],
  "perfumes": ["perfume", "fragrance"],
  "fragrance": ["perfume", "scent"],
  "attar": ["perfume", "concentrated perfume oil"],
  "scent": ["perfume", "fragrance"],
  "lipstick": ["liquid lipstick", "lip gloss"],
  "lipsticks": ["lipstick"],
  "serum": ["face serum", "skin serum"],
  "trimmer": ["beard trimmer", "shaver"],
  "shaver": ["trimmer", "electric razor"],

  // Fitness & Sports
  "dumbbells": ["dumbbell", "weights"],
  "dumbbell": ["dumbbells"],
  "gym": ["workout", "fitness"],
  "skipping": ["skipping rope", "jump rope"],
  "jumprope": ["skipping rope"],
  "rope": ["skipping rope"],
  "football": ["soccer", "match ball"],
  "cricket": ["cricket bat", "sports gear"],
  "badminton": ["badminton racket", "shuttlecock"]
};

// Common informal/phonetic aliases to fast-track
const PHONETIC_MAP = {
  "dumble": "dumbbells",
  "dumbles": "dumbbells",
  "dumbel": "dumbbells",
  "dumbell": "dumbbells",
  "dumbells": "dumbbells",
  "hoddie": "hoodie",
  "hoddiee": "hoodie",
  "hoodi": "hoodie",
  "hodie": "hoodie",
  "hodiee": "hoodie",
  "hodieeee": "hoodie",
  "lptop": "laptop",
  "latop": "laptop",
  "lapotp": "laptop",
  "lpatop": "laptop",
  "phne": "smartphone",
  "smartphne": "smartphone",
  "smartphn": "smartphone",
  "samsng": "samsung",
  "samsnug": "samsung",
  "iphne": "iphone",
  "iphon": "iphone",
  "hedphne": "headphone",
  "hedphones": "headphones",
  "headphne": "headphones",
  "earbud": "earbuds",
  "erbuds": "earbuds",
  "airfrer": "air fryer",
  "airfrer": "air fryer",
  "frer": "fryer",
  "shrt": "shirt",
  "shirtt": "shirt",
  "tshrt": "tshirt",
  "sari": "saree",
  "sare": "saree",
  "saari": "saree",
  "lipstik": "lipstick",
  "lipstic": "lipstick",
  "perfme": "perfume",
  "perfum": "perfume",
  "adiddas": "adidas",
  "nik": "nike",
  "lenvo": "lenovo",
  "delll": "dell"
};

// ==========================================
// 3. STREAMING MIN-HEAP (Top-K Selection)
// ==========================================
export class MinHeap {
  constructor(maxCapacity = 24) {
    this.heap = [];
    this.maxCapacity = maxCapacity;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0] || null;
  }

  insert(item) {
    if (this.heap.length < this.maxCapacity) {
      this.heap.push(item);
      this._siftUp(this.heap.length - 1);
    } else if (item.score > this.heap[0].score) {
      this.heap[0] = item;
      this._siftDown(0);
    }
  }

  _siftUp(idx) {
    let parent = Math.floor((idx - 1) / 2);
    while (idx > 0 && this.heap[idx].score < this.heap[parent].score) {
      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
      idx = parent;
      parent = Math.floor((idx - 1) / 2);
    }
  }

  _siftDown(idx) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let smallest = idx;

      if (left < length && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (right < length && this.heap[right].score < this.heap[smallest].score) {
        smallest = right;
      }
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }

  toSortedArray() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

// ==========================================
// 4. PREFIX TRIE for Fast Autocomplete
// ==========================================
class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.word = null;
    this.topDocIndices = new Set();
    this.frequency = 0;
  }
}

export class PrefixTrie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, docIndex, boost = 1) {
    if (!word || typeof word !== 'string') return;
    const cleanWord = word.toLowerCase().trim();
    if (cleanWord.length < 2) return;

    let curr = this.root;
    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!curr.children.has(char)) {
        curr.children.set(char, new TrieNode());
      }
      curr = curr.children.get(char);
      if (curr.topDocIndices.size < 20 && docIndex !== undefined) {
        curr.topDocIndices.add(docIndex);
      }
    }
    curr.isEndOfWord = true;
    curr.word = cleanWord;
    curr.frequency += boost;
  }

  searchPrefix(prefix, limit = 8) {
    if (!prefix) return { suggestions: [], matchedDocIndices: [] };
    const cleanPrefix = prefix.toLowerCase().trim();
    let curr = this.root;

    for (let i = 0; i < cleanPrefix.length; i++) {
      const char = cleanPrefix[i];
      if (!curr.children.has(char)) {
        return { suggestions: [], matchedDocIndices: [] };
      }
      curr = curr.children.get(char);
    }

    const suggestions = [];
    const queue = [curr];

    while (queue.length > 0 && suggestions.length < limit * 3) {
      const node = queue.shift();
      if (node.isEndOfWord) {
        suggestions.push({ word: node.word, frequency: node.frequency });
      }
      for (const child of node.children.values()) {
        queue.push(child);
      }
    }

    suggestions.sort((a, b) => b.frequency - a.frequency);

    return {
      suggestions: suggestions.slice(0, limit).map(s => s.word),
      matchedDocIndices: Array.from(curr.topDocIndices)
    };
  }
}

// ==========================================
// 5. BK-TREE (Damerau-Levenshtein Metric Tree)
// ==========================================
class BKTreeNode {
  constructor(word) {
    this.word = word;
    this.children = new Map(); // distance -> BKTreeNode
  }
}

export class BKTree {
  constructor() {
    this.root = null;
    this.vocabulary = new Set();
  }

  insert(word) {
    if (!word || word.length < 3) return;
    const cleanWord = word.toLowerCase().trim();
    if (this.vocabulary.has(cleanWord)) return;
    this.vocabulary.add(cleanWord);

    if (!this.root) {
      this.root = new BKTreeNode(cleanWord);
      return;
    }

    let curr = this.root;
    while (true) {
      const dist = damerauLevenshteinDistance(cleanWord, curr.word);
      if (dist === 0) return;

      if (curr.children.has(dist)) {
        curr = curr.children.get(dist);
      } else {
        curr.children.set(dist, new BKTreeNode(cleanWord));
        break;
      }
    }
  }

  search(word, maxDistance = 2, limit = 5) {
    if (!this.root || !word) return [];
    const cleanWord = word.toLowerCase().trim();
    const results = [];
    const candidates = [this.root];

    while (candidates.length > 0) {
      const node = candidates.pop();
      const dist = damerauLevenshteinDistance(cleanWord, node.word);

      if (dist <= maxDistance) {
        results.push({ word: node.word, distance: dist });
      }

      const low = Math.max(1, dist - maxDistance);
      const high = dist + maxDistance;

      for (let d = low; d <= high; d++) {
        if (node.children.has(d)) {
          candidates.push(node.children.get(d));
        }
      }
    }

    return results
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(r => r.word);
  }
}

// =========================================================================
// 6. MAIN PRODUCT SEARCH ENGINE (DSA POWERED)
// =========================================================================
export class ProductSearchEngine {
  constructor(products = []) {
    this.products = products;
    this.totalDocs = products.length;

    // Inverted Index: token -> Array<{ docIndex, weight }>
    this.invertedIndex = new Map();
    this.docLengths = new Float32Array(products.length);
    this.avgDocLength = 0;

    // Advanced Data Structures
    this.prefixTrie = new PrefixTrie();
    this.bkTree = new BKTree();
    this.brandBKTree = new BKTree();

    // Categorical & Specialized Filter Buckets
    this.categoryBuckets = new Map();
    this.subCategoryBuckets = new Map();
    this.genderBuckets = new Map();
    this.brandIndex = new Map(); // brandLower -> Set<docIndex>
    this.productTypeIndex = new Map(); // typeLower -> Set<docIndex>
    this.attributeIndex = new Map(); // attrLower -> Set<docIndex>
    this.priceBuckets = {
      "0-199": new Set(),
      "200-499": new Set(),
      "500-999": new Set(),
      "1000+": new Set()
    };
    this.mallBucket = new Set();

    // Fast Snapshot Loader / Cold Start Rebuilder
    const snapshotManager = new IndexSnapshotManager();
    const warmStartStart = performance.now();
    const snapshot = products.length >= 10000 ? snapshotManager.loadSnapshot(products.length) : null;

    if (snapshot) {
      snapshotManager.hydrateEngine(this, snapshot);
      const warmDuration = +(performance.now() - warmStartStart).toFixed(2);
      console.log(`⚡ [SearchEngine] Warm start: Index snapshot load time: ${warmDuration}ms across ${this.totalDocs.toLocaleString('en-IN')} items`);
    } else {
      this._buildIndex();
      if (products.length >= 10000) {
        snapshotManager.saveSnapshot(this, products.length).catch(() => {});
      }
    }
  }

  /**
   * Tokenizes text into meaningful alphanumeric words, preserving models like rtx 4060, s23, ps5
   */
  _tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter(w => w.length > 0);
  }

  /**
   * Reduces repeated character runs (>=3) into candidates:
   * e.g. "hodieeee" -> ["hodiee", "hodie"]
   * e.g. "laptoooop" -> ["laptoop", "laptop"]
   */
  _normalizeRepeatedChars(token) {
    if (!token || token.length < 3) return [token];
    const hasRuns = /(.)\1{2,}/.test(token);
    if (!hasRuns) return [token];

    const reducedTwo = token.replace(/(.)\1{2,}/g, '$1$1');
    const reducedOne = token.replace(/(.)\1{2,}/g, '$1');
    return Array.from(new Set([token, reducedTwo, reducedOne]));
  }

  _buildIndex() {
    const startTime = Date.now();
    let totalLength = 0;
    const uniqueVocab = new Set();
    const uniqueBrands = new Set();

    for (let i = 0; i < this.products.length; i++) {
      const p = this.products[i];
      let docLen = 0;

      // 1. Index Title Tokens (Weight: 5.0)
      const titleTokens = this._tokenize(p.title);
      titleTokens.forEach(t => {
        this._addPosting(t, i, 5.0);
        this.prefixTrie.insert(t, i, 4);
        uniqueVocab.add(t);
        docLen++;
      });

      // 2. Index Brand Tokens (Weight: 4.5)
      if (p.brand) {
        const brandKey = p.brand.toLowerCase().trim();
        if (!this.brandIndex.has(brandKey)) this.brandIndex.set(brandKey, new Set());
        this.brandIndex.get(brandKey).add(i);

        const bTokens = this._tokenize(p.brand);
        bTokens.forEach(t => {
          this._addPosting(t, i, 4.5);
          uniqueBrands.add(t);
          this.prefixTrie.insert(t, i, 3);
          uniqueVocab.add(t);
          docLen++;
        });
      }

      // 3. Index Category, SubCategory & Product Type (Weight: 3.5)
      const catTokens = [
        ...this._tokenize(p.category),
        ...this._tokenize(p.mainCategory),
        ...this._tokenize(p.subCategory),
        ...this._tokenize(p.productType)
      ];
      catTokens.forEach(t => {
        this._addPosting(t, i, 3.5);
        this.prefixTrie.insert(t, i, 2);
        uniqueVocab.add(t);
        docLen++;
      });

      if (p.productType) {
        const typeKey = p.productType.toLowerCase().trim();
        if (!this.productTypeIndex.has(typeKey)) this.productTypeIndex.set(typeKey, new Set());
        this.productTypeIndex.get(typeKey).add(i);
      }

      // 4. Index Tags (Weight: 3.0)
      if (Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          const tTokens = this._tokenize(tag);
          tTokens.forEach(t => {
            this._addPosting(t, i, 3.0);
            this.prefixTrie.insert(t, i, 2);
            uniqueVocab.add(t);
            docLen++;
          });
        });
      }

      // 5. Fast Attribute Index for specs (e.g. 16gb, rtx, 4060, amoled, 5g, 1tb)
      titleTokens.forEach(t => {
        if (/\d+(?:gb|tb|l|v|w|fps|hz|mp)|rtx|gtx|amoled|oled|intel|ryzen|snapdragon|anc|5g|4k/i.test(t)) {
          if (!this.attributeIndex.has(t)) this.attributeIndex.set(t, new Set());
          this.attributeIndex.get(t).add(i);
        }
      });

      // 6. Index Fabric & Materials (Weight: 1.5)
      if (p.fabric) {
        this._tokenize(p.fabric).forEach(t => {
          this._addPosting(t, i, 1.5);
          docLen++;
        });
      }

      this.docLengths[i] = docLen;
      totalLength += docLen;

      // 7. Populate Filter Buckets
      const catKey = (p.category || "").toLowerCase();
      if (!this.categoryBuckets.has(catKey)) this.categoryBuckets.set(catKey, new Set());
      this.categoryBuckets.get(catKey).add(i);

      const mainCatKey = (p.mainCategory || "").toLowerCase();
      if (!this.categoryBuckets.has(mainCatKey)) this.categoryBuckets.set(mainCatKey, new Set());
      this.categoryBuckets.get(mainCatKey).add(i);

      const subCatKey = (p.subCategory || "").toLowerCase();
      if (!this.subCategoryBuckets.has(subCatKey)) this.subCategoryBuckets.set(subCatKey, new Set());
      this.subCategoryBuckets.get(subCatKey).add(i);

      const genderKey = (p.gender || "all").toLowerCase();
      if (!this.genderBuckets.has(genderKey)) this.genderBuckets.set(genderKey, new Set());
      this.genderBuckets.get(genderKey).add(i);

      if (p.price <= 199) this.priceBuckets["0-199"].add(i);
      else if (p.price <= 499) this.priceBuckets["200-499"].add(i);
      else if (p.price <= 999) this.priceBuckets["500-999"].add(i);
      else this.priceBuckets["1000+"].add(i);

      if (p.infinityMall) this.mallBucket.add(i);
    }

    // Batch insert unique vocabulary into BK-Trees (exclude pure numbers like #101)
    for (const word of uniqueVocab) {
      if (!/^\d+$/.test(word)) {
        this.bkTree.insert(word);
      }
    }
    for (const bWord of uniqueBrands) {
      this.brandBKTree.insert(bWord);
    }

    this.avgDocLength = totalLength / Math.max(1, this.products.length);
    console.log(`⚡ [SearchEngine] Cold start: Index rebuild time across ${this.products.length.toLocaleString('en-IN')} items: ${Date.now() - startTime}ms (${this.invertedIndex.size.toLocaleString('en-IN')} unique vocabulary tokens, Trie & BK-Tree ready)`);
  }

  _addPosting(token, docIndex, fieldWeight) {
    if (!this.invertedIndex.has(token)) {
      this.invertedIndex.set(token, []);
    }
    const postings = this.invertedIndex.get(token);
    if (postings.length === 0 || postings[postings.length - 1].docIndex !== docIndex) {
      postings.push({ docIndex, weight: fieldWeight });
    } else {
      postings[postings.length - 1].weight += fieldWeight;
    }
  }

  _getIdf(token) {
    const docFreq = this.invertedIndex.has(token) ? this.invertedIndex.get(token).length : 0;
    if (docFreq === 0) return 0;
    return Math.log(1 + (this.totalDocs - docFreq + 0.5) / (docFreq + 0.5));
  }

  /**
   * Comprehensive Query Normalization & Intent Extraction
   */
  _parseQuery(rawQuery = "") {
    let clean = (rawQuery || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    // 1. Extract Price Constraints (e.g. "under 50000", "below 20k", "₹5000", "20 hazar", "between 2000 and 5000")
    let extractedMaxPrice = null;
    let extractedMinPrice = null;

    // Check "between X and Y"
    const betweenMatch = clean.match(/(?:between|from)\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (betweenMatch) {
      extractedMinPrice = parseInt(betweenMatch[1], 10);
      extractedMaxPrice = parseInt(betweenMatch[2], 10);
      clean = clean.replace(betweenMatch[0], ' ');
    }

    // Check "Xk" or "X hazar" or "X lakh"
    const kMatch = clean.match(/(?:under|below|less\s*than|upto|up\s*to|max|budget\s*(?:is|of|under|:)?|around|₹|rs\.?|inr)?\s*(\d+)\s*(k|hazar|thousand|lakh)\b/i);
    if (kMatch) {
      const num = parseInt(kMatch[1], 10);
      const unit = kMatch[2].toLowerCase();
      let val = num;
      if (unit === 'k' || unit === 'hazar' || unit === 'thousand') val = num * 1000;
      else if (unit === 'lakh') val = num * 100000;

      extractedMaxPrice = val;
      clean = clean.replace(kMatch[0], ' ');
    }

    // Check "under 50000" or "50000 ke andar"
    const directPriceMatch = clean.match(/(?:under|below|less\s*than|max\s*price|budget\s*(?:is|of|under|:)?|around|₹|rs\.?|inr)\s*(\d{3,7})|(\d{3,7})\s*(?:ke\s*andar|tak|max|rs|inr|budget)/i);
    if (directPriceMatch) {
      const numStr = directPriceMatch[1] || directPriceMatch[2];
      if (numStr) {
        extractedMaxPrice = parseInt(numStr, 10);
        clean = clean.replace(directPriceMatch[0], ' ');
      }
    }

    // 2. Extract Hinglish Gender / Context
    let extractedGender = "all";
    if (/\b(?:ladko\s*ke|purush|gents|men)\b/i.test(clean)) {
      extractedGender = "Men";
      clean = clean.replace(/\b(?:ladko\s*ke|purush|gents)\b/gi, ' ');
    } else if (/\b(?:ladkiyon\s*ki|mahila|women|ladies)\b/i.test(clean)) {
      extractedGender = "Women";
      clean = clean.replace(/\b(?:ladkiyon\s*ki|mahila|ladies)\b/gi, ' ');
    }

    // Strip common Hinglish filler words
    clean = clean
      .replace(/\b(?:mujhe|chahiye|dikhaye|dikhao|wala|wali|wale|ke\s*liye|for|under|below|around)\b/gi, ' ')
      .replace(/[!?,;:@#$%^&*()_+=~`"'{}\[\]\\\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      cleanedQuery: clean,
      extractedMaxPrice,
      extractedMinPrice,
      extractedGender
    };
  }

  /**
   * Fast Autocomplete & Suggestions using Trie + BK-Tree + Synonyms
   */
  getSuggestions(query, limit = 6) {
    const start = performance.now();
    if (!query || query.trim().length === 0) {
      return {
        query: "",
        suggestions: ["Laptops", "Smartphones", "Wireless Earbuds", "Banarasi Sarees", "Gym Dumbbells", "Hoodies", "Air Fryers"],
        instantProducts: [],
        didYouMean: null,
        timeMs: +(performance.now() - start).toFixed(2)
      };
    }

    const { cleanedQuery } = this._parseQuery(query);
    const tokens = this._tokenize(cleanedQuery);
    const lastToken = tokens[tokens.length - 1] || cleanedQuery;

    // Check phonetic / synonym for suggestions
    let target = PHONETIC_MAP[lastToken] || ECOMMERCE_SYNONYMS[lastToken]?.[0] || lastToken;

    let { suggestions, matchedDocIndices } = this.prefixTrie.searchPrefix(target, limit);
    let didYouMean = null;

    if (suggestions.length === 0 && lastToken.length >= 3) {
      const fuzzy = this.bkTree.search(lastToken, getDynamicEditDistance(lastToken), 3);
      if (fuzzy.length > 0) {
        didYouMean = fuzzy[0];
        const fuzzySug = this.prefixTrie.searchPrefix(didYouMean, limit);
        suggestions.push(...fuzzySug.suggestions);
        matchedDocIndices.push(...fuzzySug.matchedDocIndices);
      }
    }

    if (PHONETIC_MAP[lastToken] && !didYouMean && PHONETIC_MAP[lastToken] !== lastToken) {
      didYouMean = PHONETIC_MAP[lastToken];
    }

    const instantProducts = (matchedDocIndices || [])
      .slice(0, 6)
      .map(idx => this.products[idx])
      .filter(Boolean);

    return {
      query,
      suggestions: Array.from(new Set(suggestions)).slice(0, limit),
      instantProducts,
      didYouMean,
      timeMs: +(performance.now() - start).toFixed(2)
    };
  }

  /**
   * Main High-Performance Search across 1,25,000+ items
   * Combines exact match, phrase boost, typo tolerance, synonyms, attribute detection, and Top-K Min-Heap
   */
  search(queryOrOptions = {}, extraOptions = {}) {
    const start = performance.now();
    let opts = {};
    if (typeof queryOrOptions === 'string') {
      opts = { query: queryOrOptions, ...extraOptions };
    } else {
      opts = { ...queryOrOptions, ...extraOptions };
    }

    let {
      query = "",
      category = "all",
      subCategory = "all",
      gender = "all",
      priceRange = "all",
      minRating = 0,
      minDiscount = 0,
      color = "all",
      size = "all",
      onlyInfinityMall = false,
      sortBy = "relevance",
      page = 1,
      limit = 24
    } = opts;

    const isInfinityMall = String(onlyInfinityMall) === 'true';
    const parsedMinRating = Number(minRating) || 0;
    const parsedMinDiscount = Number(minDiscount) || 0;

    // 1. Query Normalization & Intent Extraction
    const {
      cleanedQuery,
      extractedMaxPrice,
      extractedMinPrice,
      extractedGender
    } = this._parseQuery(query);

    if (extractedGender !== "all" && gender === "all") {
      gender = extractedGender;
    }

    const rawTokens = this._tokenize(cleanedQuery);

    // Empty search: return default category listing
    if (rawTokens.length === 0) {
      const filtered = [];
      const catFilterSet = category !== "all" ? this.categoryBuckets.get(category.toLowerCase()) : null;
      const subCatFilterSet = subCategory !== "all" ? this.subCategoryBuckets.get(subCategory.toLowerCase()) : null;
      const genderFilterSet = (gender !== "all" && gender !== "All") ? this.genderBuckets.get(gender.toLowerCase()) : null;
      const priceFilterSet = priceRange !== "all" ? this.priceBuckets[priceRange] : null;

      for (let i = 0; i < this.totalDocs; i++) {
        if (catFilterSet && !catFilterSet.has(i)) continue;
        if (subCatFilterSet && !subCatFilterSet.has(i)) continue;
        if (genderFilterSet && !genderFilterSet.has(i) && this.products[i].gender !== "All") continue;
        if (priceFilterSet && !priceFilterSet.has(i)) continue;
        if (isInfinityMall && !this.mallBucket.has(i)) continue;
        if (extractedMaxPrice && this.products[i].price > extractedMaxPrice) continue;
        if (extractedMinPrice && this.products[i].price < extractedMinPrice) continue;
        if (parsedMinRating > 0 && this.products[i].rating < parsedMinRating) continue;
        if (parsedMinDiscount > 0 && this.products[i].discount < parsedMinDiscount) continue;
        filtered.push(this.products[i]);
      }

      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;

      return {
        success: true,
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        searchTimeMs: +(performance.now() - start).toFixed(2),
        query: query || "",
        correctedQuery: null,
        didYouMean: null,
        products: filtered.slice(startIndex, startIndex + limit)
      };
    }

    // 2. Token-Level Exact Match, Phonetic Alias, Brand Typo, & BK-Tree Fuzzy Resolution
    const exactTokens = new Set();
    const synonymTokens = new Set();
    const fuzzyTokens = new Set();
    const detectedBrands = new Set();
    const correctedTokenMap = {};
    let hasAnyCorrection = false;

    // Check full query phrase in PHONETIC_MAP first (e.g. "air frer" -> "air fryer", "skipping rope" -> "skipping rope")
    if (PHONETIC_MAP[cleanedQuery]) {
      const aliasTokens = this._tokenize(PHONETIC_MAP[cleanedQuery]);
      aliasTokens.forEach(t => synonymTokens.add(t));
      hasAnyCorrection = true;
    }

    for (const rawToken of rawTokens) {
      let resolvedToken = rawToken;

      // A. Check direct phonetic / typo map
      if (PHONETIC_MAP[rawToken]) {
        resolvedToken = PHONETIC_MAP[rawToken];
        hasAnyCorrection = true;
        correctedTokenMap[rawToken] = resolvedToken;
        this._tokenize(resolvedToken).forEach(t => synonymTokens.add(t));
        continue;
      }

      // B. Check repeated character runs (e.g. "hodieeee" -> "hodie" -> "hoodie")
      const candidateVariants = this._normalizeRepeatedChars(rawToken);
      let foundVariant = null;
      for (const variant of candidateVariants) {
        if (PHONETIC_MAP[variant]) {
          foundVariant = PHONETIC_MAP[variant];
          break;
        }
        if (this.invertedIndex.has(variant)) {
          foundVariant = variant;
          break;
        }
      }
      if (foundVariant) {
        resolvedToken = foundVariant;
        if (resolvedToken !== rawToken) hasAnyCorrection = true;
        correctedTokenMap[rawToken] = resolvedToken;
        exactTokens.add(resolvedToken);
        continue;
      }

      // C. Check exact match in Inverted Index
      if (this.invertedIndex.has(rawToken)) {
        exactTokens.add(rawToken);
        continue;
      }

      // D. Check Brand BK-Tree (e.g. "samsng" -> "samsung", "aple" -> "apple", "nik" -> "nike")
      const brandMatches = this.brandBKTree.search(rawToken, getDynamicEditDistance(rawToken), 1);
      if (brandMatches.length > 0) {
        const brandMatch = brandMatches[0];
        detectedBrands.add(brandMatch);
        synonymTokens.add(brandMatch);
        correctedTokenMap[rawToken] = brandMatch;
        hasAnyCorrection = true;
        continue;
      }

      // E. Check BK-Tree with dynamic edit distance
      const dynamicDist = getDynamicEditDistance(rawToken);
      if (dynamicDist > 0) {
        const fuzzyMatches = this.bkTree.search(rawToken, dynamicDist, 2);
        if (fuzzyMatches.length > 0) {
          const topFuzzy = fuzzyMatches[0];
          fuzzyTokens.add(topFuzzy);
          correctedTokenMap[rawToken] = topFuzzy;
          hasAnyCorrection = true;
          continue;
        }
      }

      // F. Fallback: Prefix Trie
      const prefixMatches = this.prefixTrie.searchPrefix(rawToken, 2);
      if (prefixMatches.suggestions.length > 0) {
        prefixMatches.suggestions.forEach(s => synonymTokens.add(s));
        correctedTokenMap[rawToken] = prefixMatches.suggestions[0];
        hasAnyCorrection = true;
        continue;
      }

      // Unknown token - keep as is
      exactTokens.add(rawToken);
    }

    // Reconstruct corrected query & "Did you mean?"
    let correctedQuery = null;
    let didYouMean = null;
    if (hasAnyCorrection) {
      const correctedWords = rawTokens.map(t => correctedTokenMap[t] || t);
      const rebuilt = correctedWords.join(' ').trim();
      if (rebuilt !== cleanedQuery) {
        correctedQuery = rebuilt;
        didYouMean = rebuilt;
      }
    }

    // Expand Synonyms for all exact & corrected tokens
    const allKnownTokens = new Set([...exactTokens, ...synonymTokens, ...fuzzyTokens]);
    allKnownTokens.forEach(tok => {
      if (ECOMMERCE_SYNONYMS[tok]) {
        ECOMMERCE_SYNONYMS[tok].forEach(syn => {
          this._tokenize(syn).forEach(st => synonymTokens.add(st));
        });
      }
    });

    // 3. Score Posting Lists using Okapi BM25 + Field Weighting
    const docScores = new Map();
    const k1 = 1.2;
    const b = 0.75;

    const applyPostings = (tokensSet, multiplier, matchBonus) => {
      tokensSet.forEach(token => {
        const postings = this.invertedIndex.get(token);
        if (postings && postings.length > 0) {
          const idf = this._getIdf(token);
          for (let j = 0; j < postings.length; j++) {
            const { docIndex, weight } = postings[j];
            const docLen = this.docLengths[docIndex] || 1;
            const tfScore = (weight * (k1 + 1)) / (weight + k1 * (1 - b + b * (docLen / this.avgDocLength)));
            const termScore = (idf * tfScore * multiplier) + matchBonus;

            docScores.set(docIndex, (docScores.get(docIndex) || 0) + termScore);
          }
        }
      });
    };

    // Priority 1: Exact tokens have HIGHEST weight (+600 bonus)
    if (exactTokens.size > 0) {
      applyPostings(exactTokens, 4.5, 600);
    }

    // Priority 2: Synonyms & Brand tokens (+400 bonus)
    if (synonymTokens.size > 0) {
      applyPostings(synonymTokens, 3.5, 400);
    }

    // Priority 3: Fuzzy typo tokens (Lower base +50 bonus to ensure exact matches dominate)
    if (fuzzyTokens.size > 0) {
      applyPostings(fuzzyTokens, 1.5, 50);
    }

    // Candidate retrieval completed
    const retrievalTime = +(performance.now() - start).toFixed(2);
    const rankingStart = performance.now();

    // 4. Candidate Filtering (O(1) Set checks)
    const candidateIndices = Array.from(docScores.keys());

    let catFilterSet = category !== "all" ? this.categoryBuckets.get(category.toLowerCase()) : null;
    let subCatFilterSet = subCategory !== "all" ? this.subCategoryBuckets.get(subCategory.toLowerCase()) : null;
    const genderFilterSet = (gender !== "all" && gender !== "All") ? this.genderBuckets.get(gender.toLowerCase()) : null;
    const priceFilterSet = priceRange !== "all" ? this.priceBuckets[priceRange] : null;

    // Auto-unwind category lock if user is on category page but explicitly searched another category keyword
    if (candidateIndices.length > 0 && catFilterSet) {
      const matchInCat = candidateIndices.some(idx => catFilterSet.has(idx));
      if (!matchInCat) {
        catFilterSet = null;
        subCatFilterSet = null;
      }
    }

    const filteredCandidates = [];
    const searchTokensList = Array.from(new Set([...exactTokens, ...synonymTokens, ...fuzzyTokens, ...rawTokens]));
    const validTokens = searchTokensList.filter(t => t.length > 2);
    const specKeywords = validTokens.filter(t => /\d+(?:gb|tb|l|v|w|fps|hz|mp)|rtx|gtx|amoled|oled|intel|ryzen|snapdragon|anc|5g|4k/i.test(t));
    const hasSpecKeywords = specKeywords.length > 0;
    const effectivePhrase = correctedQuery || cleanedQuery;

    for (let i = 0; i < candidateIndices.length; i++) {
      const docIdx = candidateIndices[i];
      const p = this.products[docIdx];
      if (!p) continue;

      // Strict user filters
      if (catFilterSet && !catFilterSet.has(docIdx)) continue;
      if (subCatFilterSet && !subCatFilterSet.has(docIdx)) continue;
      if (genderFilterSet && !genderFilterSet.has(docIdx) && p.gender !== "All") continue;
      if (priceFilterSet && !priceFilterSet.has(docIdx)) continue;
      if (isInfinityMall && !this.mallBucket.has(docIdx)) continue;
      if (parsedMinRating > 0 && p.rating < parsedMinRating) continue;
      if (parsedMinDiscount > 0 && p.discount < parsedMinDiscount) continue;
      if (color !== "all" && !p.colors?.some(c => c.toLowerCase().includes(color.toLowerCase()))) continue;
      if (size !== "all" && !p.sizes?.includes(size)) continue;

      // Stated Price Constraint check from query (e.g. "under 50000", "air fryer under 5000")
      if (extractedMaxPrice && p.price > extractedMaxPrice) continue;
      if (extractedMinPrice && p.price < extractedMinPrice) continue;

      let score = docScores.get(docIdx) || 1.0;
      const titleLower = p.title.toLowerCase();
      const brandLower = (p.brand || "").toLowerCase();

      // A. Exact Phrase Matching on Title (+3000 boost)
      if (titleLower.includes(effectivePhrase) || titleLower.includes(cleanedQuery)) {
        score += 3000;
      }

      // B. Exact Token in Title (+1500 boost per token)
      for (let j = 0; j < validTokens.length; j++) {
        if (titleLower.includes(validTokens[j])) {
          score += 1500;
        }
      }

      // C. Brand Matching (+2500 boost)
      if (detectedBrands.size > 0) {
        for (const db of detectedBrands) {
          if (brandLower.includes(db)) {
            score += 2500;
          }
        }
      }

      // D. Product Type & Subcategory Alignment (+1800 boost)
      if (p.productType) {
        const pt = p.productType.toLowerCase();
        for (let j = 0; j < validTokens.length; j++) {
          if (pt.includes(validTokens[j])) { score += 1800; break; }
        }
      }
      if (p.subCategory) {
        const sc = p.subCategory.toLowerCase();
        for (let j = 0; j < validTokens.length; j++) {
          if (sc.includes(validTokens[j])) { score += 1200; break; }
        }
      }

      // E. Attribute & Spec Matching (+1200 boost via O(1) attributeIndex lookup)
      if (hasSpecKeywords) {
        for (let j = 0; j < specKeywords.length; j++) {
          const attrSet = this.attributeIndex.get(specKeywords[j]);
          if (attrSet && attrSet.has(docIdx)) {
            score += 1500;
          }
        }
      }

      // F. Small popularity / rating bonus
      score += (p.rating || 4.0) * 2.0;
      if (p.infinityMall) score += 5.0;

      filteredCandidates.push({ product: p, score });
    }

    // 5. Sorting & Streaming Top-K Selection via Min-Heap
    let sortedResults = [];
    if (sortBy === 'price-low') {
      filteredCandidates.sort((a, b) => a.product.price - b.product.price);
      sortedResults = filteredCandidates;
    } else if (sortBy === 'price-high') {
      filteredCandidates.sort((a, b) => b.product.price - a.product.price);
      sortedResults = filteredCandidates;
    } else if (sortBy === 'rating') {
      filteredCandidates.sort((a, b) => b.product.rating - a.product.rating);
      sortedResults = filteredCandidates;
    } else if (sortBy === 'discount') {
      filteredCandidates.sort((a, b) => b.product.discount - a.product.discount);
      sortedResults = filteredCandidates;
    } else {
      // Relevance sorting: Use Min-Heap for Top-K extraction
      if (filteredCandidates.length > limit * 3) {
        const topHeap = new MinHeap(limit * Math.max(1, page));
        for (let i = 0; i < filteredCandidates.length; i++) {
          topHeap.insert(filteredCandidates[i]);
        }
        sortedResults = topHeap.toSortedArray();
      } else {
        filteredCandidates.sort((a, b) => b.score - a.score);
        sortedResults = filteredCandidates;
      }
    }

    const totalCount = filteredCandidates.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = sortedResults.slice(startIndex, startIndex + limit).map(item => item.product);

    const timeMs = +(performance.now() - start).toFixed(2);
    const rankingTime = +(performance.now() - rankingStart).toFixed(2);
    if (query && typeof query === 'string' && query.trim()) {
      console.log(`⚡ [Search] query: "${query}" -> retrieval time: ${retrievalTime}ms -> ranking time: ${rankingTime}ms -> total time: ${timeMs}ms`);
    }

    return {
      success: true,
      total: totalCount,
      totalPages,
      currentPage: page,
      limit,
      searchTimeMs: timeMs,
      query: query || "",
      correctedQuery: didYouMean || null,
      didYouMean: didYouMean || null,
      effectiveQuery: effectivePhrase,
      parsedIntent: {
        category: category !== "all" ? category : null,
        subCategory: subCategory !== "all" ? subCategory : null,
        gender: gender !== "all" ? gender : null,
        maxPrice: extractedMaxPrice,
        minPrice: extractedMinPrice,
        detectedBrands: Array.from(detectedBrands)
      },
      products: paginatedProducts,
      results: paginatedProducts
    };
  }
}
