import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] ✅ Connected to Atlas: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB] ❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Catalog definitions
const CATALOG_TEMPLATES = [
  // ELECTRONICS
  {
    mainCategory: 'electronics',
    subCategory: 'Headphones',
    imageKeyword: 'headphones',
    brands: ['Sony', 'Bose', 'Sennheiser', 'JBL', 'Skullcandy', 'Beats', 'Apple', 'Samsung', 'Jabra', 'Audio-Technica'],
    types: ['On-Ear', 'Over-Ear', 'In-Ear Buds', 'True Wireless Earbuds', 'Neckband', 'Bone Conduction'],
    modifiers: ['Noise Cancelling', 'Extra Bass', 'Sport', 'Pro', 'Max', 'Studio', 'Gaming']
  },
  {
    mainCategory: 'electronics',
    subCategory: 'Smartphones',
    imageKeyword: 'smartphone',
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'Nothing'],
    types: ['Pro', 'Max', 'Ultra', 'Lite', 'Mini', 'Plus', 'Fold', 'Flip'],
    modifiers: ['5G', '256GB', '512GB', '1TB', 'Unlocked', 'Global Version']
  },
  {
    mainCategory: 'electronics',
    subCategory: 'Laptops',
    imageKeyword: 'laptop',
    brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Razer', 'Microsoft'],
    types: ['Gaming', 'Ultrabook', 'Convertible 2-in-1', 'Business', 'Creator', 'Chromebook'],
    modifiers: ['14-inch', '15.6-inch', '17-inch', 'i7 16GB', 'M2', 'RTX 4060']
  },
  {
    mainCategory: 'electronics',
    subCategory: 'Smartwatches',
    imageKeyword: 'smartwatch',
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Amazfit', 'Fossil', 'Titan', 'Boat', 'Noise'],
    types: ['GPS', 'Cellular', 'Fitness Band', 'Rugged', 'Hybrid', 'Classic'],
    modifiers: ['Heart Rate Monitor', 'SpO2', 'AMOLED', 'Waterproof', 'Always-On Display']
  },
  
  // FASHION
  {
    mainCategory: 'fashion',
    subCategory: 'Shoes',
    imageKeyword: 'sneakers',
    brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Vans', 'Converse', 'Asics', 'Skechers', 'Under Armour'],
    types: ['Running', 'Sneakers', 'Training', 'Walking', 'Basketball', 'Skateboarding', 'Slip-on'],
    modifiers: ['Lightweight', 'Breathable', 'Waterproof', 'Air Cushion', 'Classic', 'Pro']
  },
  {
    mainCategory: 'fashion',
    subCategory: 'T-Shirts',
    imageKeyword: 'tshirt',
    brands: ['Zara', 'H&M', 'Levi\'s', 'Gap', 'Uniqlo', 'Tommy Hilfiger', 'Calvin Klein', 'Polo Ralph Lauren', 'Allen Solly', 'US Polo Assn'],
    types: ['Polo', 'Crew Neck', 'V-Neck', 'Henley', 'Graphic Tee', 'Oversized', 'Slim Fit'],
    modifiers: ['100% Cotton', 'Dry Fit', 'Striped', 'Solid', 'Printed', 'Vintage']
  },
  {
    mainCategory: 'fashion',
    subCategory: 'Jeans',
    imageKeyword: 'jeans',
    brands: ['Levi\'s', 'Wrangler', 'Lee', 'Pepe Jeans', 'Spykar', 'Flying Machine', 'Diesel', 'Jack & Jones'],
    types: ['Skinny Fit', 'Slim Fit', 'Regular Fit', 'Bootcut', 'Relaxed Fit', 'Tapered', 'Flared'],
    modifiers: ['Stretch', 'Ripped', 'Dark Wash', 'Light Wash', 'Mid Rise', 'High Rise']
  },

  // HOME
  {
    mainCategory: 'home',
    subCategory: 'Furniture',
    imageKeyword: 'sofa',
    brands: ['IKEA', 'HomeCenter', 'UrbanLadder', 'Pepperfry', 'WoodenStreet', 'Durian', 'Godrej Interio'],
    types: ['Sofa', 'Recliner', 'Coffee Table', 'TV Unit', 'Bookshelf', 'Dining Table', 'Bed Frame'],
    modifiers: ['Solid Wood', 'Engineered Wood', 'Leatherette', 'Fabric', 'Minimalist', 'Vintage']
  },
  {
    mainCategory: 'home',
    subCategory: 'Appliances',
    imageKeyword: 'appliance',
    brands: ['Philips', 'Samsung', 'LG', 'Bosch', 'Dyson', 'Whirlpool', 'Panasonic', 'Haier', 'IFB'],
    types: ['Air Purifier', 'Vacuum Cleaner', 'Microwave Oven', 'Washing Machine', 'Refrigerator', 'Mixer Grinder'],
    modifiers: ['Smart', 'Inverter', 'Energy Efficient', 'Heavy Duty', 'Compact', 'Pro']
  },

  // BEAUTY
  {
    mainCategory: 'beauty',
    subCategory: 'Skincare',
    imageKeyword: 'skincare',
    brands: ['L\'Oreal', 'Olay', 'Neutrogena', 'Clinique', 'Kiehl\'s', 'The Ordinary', 'CeraVe', 'Cetaphil', 'Nivea', 'Plum'],
    types: ['Moisturizer', 'Face Serum', 'Sunscreen SPF 50', 'Face Wash', 'Toner', 'Night Cream', 'Sheet Mask'],
    modifiers: ['Hydrating', 'Anti-Aging', 'Vitamin C', 'Hyaluronic Acid', 'For Oily Skin', 'Fragrance-Free']
  },
  {
    mainCategory: 'beauty',
    subCategory: 'Makeup',
    imageKeyword: 'makeup',
    brands: ['MAC', 'Estee Lauder', 'Maybelline', 'LAKME', 'Nykaa', 'Sugar', 'Colorbar', 'Faces Canada', 'Revlon', 'L\'Oreal'],
    types: ['Foundation', 'Lipstick', 'Mascara', 'Eyeliner', 'Eyeshadow Palette', 'Blush', 'Highlighter', 'Concealer'],
    modifiers: ['Matte', 'Dewy', 'Long Lasting', 'Waterproof', 'Smudge Proof', 'Cruelty Free']
  },

  // JEWELLERY
  {
    mainCategory: 'jewellery',
    subCategory: 'Rings',
    imageKeyword: 'ring',
    brands: ['Tanishq', 'Kalyan', 'Malabar', 'Swarovski', 'Pandora', 'Cartier', 'Tiffany', 'BlueStone', 'CaratLane'],
    types: ['Engagement Ring', 'Wedding Band', 'Cocktail Ring', 'Solitaire', 'Stackable Ring'],
    modifiers: ['18K Gold', '22K Gold', 'Platinum', 'Diamond', 'Rose Gold', 'Silver 925']
  },
  {
    mainCategory: 'jewellery',
    subCategory: 'Necklaces',
    imageKeyword: 'necklace',
    brands: ['Tanishq', 'Kalyan', 'Malabar', 'Swarovski', 'Pandora', 'Cartier', 'Tiffany', 'BlueStone', 'CaratLane'],
    types: ['Pendant Necklace', 'Choker', 'Chain', 'Locket', 'Mangalsutra'],
    modifiers: ['18K Gold', '22K Gold', 'Platinum', 'Diamond', 'Rose Gold', 'Silver 925']
  }
];

function generateProducts(totalCount) {
  const products = [];
  let idCounter = 1;
  const countPerTemplate = Math.ceil(totalCount / CATALOG_TEMPLATES.length);

  for (const tpl of CATALOG_TEMPLATES) {
    // Keep track of used titles to guarantee absolute uniqueness
    const usedTitles = new Set();
    
    for (let i = 0; i < countPerTemplate; i++) {
      if (products.length >= totalCount) break;

      let title = "";
      let attempts = 0;
      while (attempts < 50) {
        const brand = getRandomItem(tpl.brands);
        const type = getRandomItem(tpl.types);
        const modifier = getRandomItem(tpl.modifiers);
        title = `${brand} ${type} - ${modifier}`;
        
        if (!usedTitles.has(title)) {
          usedTitles.add(title);
          break;
        }
        attempts++;
      }
      
      // If we completely exhausted permutations, add the ID to make it unique
      if (attempts >= 50) {
        title = `${title} (Variant ${idCounter})`;
      }

      const originalPrice = getRandomInt(500, 150000);
      const discount = getRandomInt(5, 50);
      const price = Math.floor(originalPrice * (1 - discount / 100));

      const tags = [
        tpl.brands.find(b => title.includes(b))?.toLowerCase(), 
        tpl.subCategory.toLowerCase(), 
        tpl.mainCategory.toLowerCase()
      ].filter(Boolean);

      products.push({
        id: `prod_${tpl.mainCategory.substring(0, 3)}_${idCounter}_${Date.now()}`,
        title,
        price,
        originalPrice,
        discount,
        category: tpl.subCategory,
        mainCategory: tpl.mainCategory,
        subCategory: tpl.subCategory,
        images: [
          `https://loremflickr.com/600/600/${tpl.imageKeyword}?lock=${idCounter}`
        ],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        reviewsCount: getRandomInt(0, 5000),
        tags,
        sizes: tpl.mainCategory === 'fashion' ? ['S', 'M', 'L', 'XL'] : [],
        colors: ['Black', 'White', 'Blue', 'Red'],
        isActive: true
      });
      
      idCounter++;
    }
  }

  return products;
}

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing existing products from DB...');
    await Product.deleteMany({});
    
    console.log('⚙️ Generating highly curated catalog...');
    // Generate 5000 incredibly detailed and unique products
    // Generate 25000 incredibly detailed and unique products
    const TOTAL_PRODUCTS = 25000;
    const products = generateProducts(TOTAL_PRODUCTS);
    
    console.log(`📦 Generated ${products.length} unique products. Beginning bulk insertion...`);
    
    // Insert in batches of 1000
    const BATCH_SIZE = 1000;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      await Product.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.ceil(i/BATCH_SIZE) + 1} of ${Math.ceil(products.length/BATCH_SIZE)}`);
    }
    
    console.log(`🎉 Successfully seeded ${products.length} hyper-realistic products to DB!`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
