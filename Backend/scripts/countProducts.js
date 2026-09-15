import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/Product.js';

dotenv.config({ path: './.env' });

async function countProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Product.countDocuments();
    console.log(`TOTAL_PRODUCTS_COUNT: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

countProducts();
