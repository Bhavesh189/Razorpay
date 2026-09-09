import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const INDEX_VERSION = 3;
export const DEFAULT_SNAPSHOT_PATH = path.join(__dirname, '../data/search_index.snapshot.json');

/**
 * Production Index Snapshot Manager
 * Provides atomic snapshot writes, checksum validation, versioning,
 * and sub-second warm start hydration for 125,000+ catalog search indexes.
 */
export class IndexSnapshotManager {
  constructor(snapshotPath = DEFAULT_SNAPSHOT_PATH, version = INDEX_VERSION) {
    this.snapshotPath = snapshotPath;
    this.version = version;
  }

  /**
   * Serializes the search engine data structures into a clean JSON-safe snapshot
   */
  serialize(engine, catalogLength) {
    // 1. Inverted Index Map -> Object
    const invertedIndexObj = {};
    for (const [token, postings] of engine.invertedIndex.entries()) {
      invertedIndexObj[token] = postings;
    }

    // 2. Map<string, Set<number>> -> Record<string, number[]>
    const mapSetToObj = (map) => {
      const obj = {};
      for (const [k, set] of map.entries()) {
        obj[k] = Array.from(set);
      }
      return obj;
    };

    // 3. Price buckets
    const priceBucketsObj = {};
    if (engine.priceBuckets) {
      for (const [k, set] of Object.entries(engine.priceBuckets)) {
        priceBucketsObj[k] = Array.from(set);
      }
    }

    // 4. Vocabularies
    const bkVocab = engine.bkTree?.vocabulary ? Array.from(engine.bkTree.vocabulary) : [];
    const brandBKVocab = engine.brandBKTree?.vocabulary ? Array.from(engine.brandBKTree.vocabulary) : [];

    const snapshotData = {
      version: this.version,
      catalogLength,
      avgDocLength: engine.avgDocLength,
      docLengths: Array.from(engine.docLengths || []),
      invertedIndex: invertedIndexObj,
      categoryBuckets: mapSetToObj(engine.categoryBuckets || new Map()),
      subCategoryBuckets: mapSetToObj(engine.subCategoryBuckets || new Map()),
      genderBuckets: mapSetToObj(engine.genderBuckets || new Map()),
      brandIndex: mapSetToObj(engine.brandIndex || new Map()),
      productTypeIndex: mapSetToObj(engine.productTypeIndex || new Map()),
      attributeIndex: mapSetToObj(engine.attributeIndex || new Map()),
      priceBuckets: priceBucketsObj,
      mallBucket: Array.from(engine.mallBucket || []),
      bkVocab,
      brandBKVocab,
      createdAt: new Date().toISOString()
    };

    // Compute SHA-256 checksum over content
    const jsonString = JSON.stringify(snapshotData);
    const checksum = crypto.createHash('sha256').update(jsonString).digest('hex');

    return {
      version: this.version,
      catalogLength,
      checksum,
      createdAt: snapshotData.createdAt,
      data: snapshotData
    };
  }

  /**
   * Saves snapshot atomically: writes to temporary file then renames to target file
   */
  async saveSnapshot(engine, catalogLength, targetPath = this.snapshotPath) {
    try {
      const serialized = this.serialize(engine, catalogLength);
      const tempPath = `${targetPath}.tmp.${Date.now()}`;

      // Ensure directory exists
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const jsonStr = JSON.stringify(serialized);
      fs.writeFileSync(tempPath, jsonStr, 'utf-8');

      // Atomic rename
      fs.renameSync(tempPath, targetPath);
      console.log(`💾 [SearchSnapshot] Successfully saved atomic index snapshot (${(Buffer.byteLength(jsonStr) / 1024 / 1024).toFixed(2)} MB)`);
      return true;
    } catch (err) {
      console.error(`⚠️ [SearchSnapshot] Failed to save snapshot:`, err.message);
      return false;
    }
  }

  /**
   * Checks whether a valid snapshot exists and matches catalog size, version, and checksum
   */
  loadSnapshot(expectedCatalogLength, targetPath = this.snapshotPath) {
    if (!fs.existsSync(targetPath)) {
      return null;
    }

    try {
      const fileContent = fs.readFileSync(targetPath, 'utf-8');
      const snapshot = JSON.parse(fileContent);

      // Validate version
      if (snapshot.version !== this.version) {
        console.warn(`⚠️ [SearchSnapshot] Snapshot version mismatch (got ${snapshot.version}, expected ${this.version}). Triggering rebuild.`);
        return null;
      }

      // Validate catalog count
      if (snapshot.catalogLength !== expectedCatalogLength) {
        console.warn(`⚠️ [SearchSnapshot] Catalog size mismatch (snapshot has ${snapshot.catalogLength}, current catalog has ${expectedCatalogLength}). Triggering rebuild.`);
        return null;
      }

      // Validate checksum if present
      if (snapshot.checksum && snapshot.data) {
        const computed = crypto.createHash('sha256').update(JSON.stringify(snapshot.data)).digest('hex');
        if (computed !== snapshot.checksum) {
          console.warn(`⚠️ [SearchSnapshot] Snapshot checksum mismatch (corrupted file). Triggering rebuild.`);
          return null;
        }
      }

      return snapshot;
    } catch (err) {
      console.warn(`⚠️ [SearchSnapshot] Failed to parse or load snapshot: ${err.message}. Triggering rebuild.`);
      return null;
    }
  }

  /**
   * Hydrates the ProductSearchEngine instance with restored snapshot data
   */
  hydrateEngine(engine, snapshotData) {
    const { data } = snapshotData;

    engine.avgDocLength = data.avgDocLength;
    engine.docLengths = new Float32Array(data.docLengths);

    // 1. Inverted Index Map
    engine.invertedIndex = new Map();
    for (const [token, postings] of Object.entries(data.invertedIndex || {})) {
      engine.invertedIndex.set(token, postings);
      // Re-populate Prefix Trie
      for (const p of postings.slice(0, 10)) {
        engine.prefixTrie.insert(token, p.docIndex, 2);
      }
    }

    // 2. Buckets & Indexes
    const objToMapSet = (obj) => {
      const map = new Map();
      for (const [k, arr] of Object.entries(obj || {})) {
        map.set(k, new Set(arr));
      }
      return map;
    };

    engine.categoryBuckets = objToMapSet(data.categoryBuckets);
    engine.subCategoryBuckets = objToMapSet(data.subCategoryBuckets);
    engine.genderBuckets = objToMapSet(data.genderBuckets);
    engine.brandIndex = objToMapSet(data.brandIndex);
    engine.productTypeIndex = objToMapSet(data.productTypeIndex);
    engine.attributeIndex = objToMapSet(data.attributeIndex);

    engine.priceBuckets = {};
    for (const [k, arr] of Object.entries(data.priceBuckets || {})) {
      engine.priceBuckets[k] = new Set(arr);
    }
    engine.mallBucket = new Set(data.mallBucket || []);

    // 3. BK-Trees
    for (const word of (data.bkVocab || [])) {
      engine.bkTree.insert(word);
    }
    for (const word of (data.brandBKVocab || [])) {
      engine.brandBKTree.insert(word);
    }

    return true;
  }
}
