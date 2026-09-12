import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { Product } from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Connected for Image Validation`);
  } catch (error) {
    console.error(`[MongoDB] Error: ${error.message}`);
    process.exit(1);
  }
};

const checkImage = (url) => {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      const contentType = res.headers['content-type'];
      const isImage = contentType && contentType.startsWith('image/');
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 400 && isImage,
        statusCode: res.statusCode,
        contentType
      });
    });

    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Timeout' });
    });
    req.end();
  });
};

const validateImages = async () => {
  await connectDB();
  
  console.log('🔍 Phase 1: Aggregating unique image URLs from Database...');
  
  // Get all unique images
  const products = await Product.find({}, { images: 1 });
  const uniqueUrls = new Set();
  
  products.forEach(p => {
    if (p.images && p.images.length > 0) {
      uniqueUrls.add(p.images[0]);
    }
  });

  const urlsArray = Array.from(uniqueUrls);
  console.log(`📸 Found ${urlsArray.length} unique image URLs across ${products.length} products.`);
  
  console.log('🌐 Phase 2: Running HTTP HEAD verification...');
  let validCount = 0;
  let invalidCount = 0;
  const invalidUrls = [];

  for (let i = 0; i < urlsArray.length; i++) {
    const url = urlsArray[i];
    process.stdout.write(`\rVerifying [${i+1}/${urlsArray.length}]... `);
    const result = await checkImage(url);
    
    if (result.ok) {
      validCount++;
    } else {
      invalidCount++;
      invalidUrls.push({ url, reason: result.error || `HTTP ${result.statusCode} (Type: ${result.contentType})` });
      
      // Mark products with this broken image as inactive
      await Product.updateMany({ images: url }, { isActive: false });
    }
  }
  
  console.log('\n\n========================================');
  console.log('IMAGE VALIDATION COMPLETE');
  console.log('========================================');
  console.log(`Total Unique Images Checked: ${urlsArray.length}`);
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Broken: ${invalidCount}`);
  
  if (invalidCount > 0) {
    console.log('\nBroken Image Details (Affected products marked inactive):');
    invalidUrls.forEach(item => console.log(`- ${item.url} (${item.reason})`));
  } else {
    console.log('\n🎉 ALL IMAGES ARE HEALTHY AND ACCESSIBLE!');
  }
  
  process.exit(0);
};

validateImages();
