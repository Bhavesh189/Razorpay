import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import { Product } from './src/models/Product.js';
import { ProductSearchEngine } from './search/SearchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const test = async () => {
  await connectDB();
  const products = await Product.find({ isActive: true }).limit(5000).lean();
  console.log(`Loaded ${products.length} products`);
  
  const engine = new ProductSearchEngine(products);
  const result = engine.search('latop');
  console.log('Result for latop:', result.products.length);
  console.log('Did you mean:', result.didYouMean);
  console.log('Query:', result.query);
  
  process.exit(0);
};

test();
