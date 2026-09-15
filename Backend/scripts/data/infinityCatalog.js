import { fullCategoryHierarchy } from '../../data/products/catalogHierarchy.js';

const BRAND_GROUPS = {
  electronics: ['NovaTech', 'Astra', 'Pulse'],
  fashion: ['Urban Loom', 'StyleCraft', 'Everyday Co'],
  beauty: ['GlowLab', 'CarePlus', 'Velora'],
  home: ['HomeNest', 'Livora', 'SmartLiving'],
  fitness: ['FitPro', 'CoreFlex', 'ActivePeak'],
  travel: ['Voyage', 'TrailMate', 'UrbanCarry'],
  automotive: ['RoadPro', 'MotoShield', 'DriveMate'],
  kids: ['PlaySmart', 'TinyTrail', 'WonderWorks'],
  office: ['WorkWise', 'DeskPro', 'FocusLine'],
  tools: ['BuildPro', 'ToolSmith', 'FixRight'],
  default: ['Infinity Select', 'PrimeChoice', 'Daily Essentials']
};

const IMAGE_BY_GROUP = {
  electronics: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&auto=format&fit=crop&q=80',
  fitness: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&auto=format&fit=crop&q=80',
  travel: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80',
  automotive: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=900&auto=format&fit=crop&q=80',
  kids: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=900&auto=format&fit=crop&q=80',
  office: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80',
  tools: 'https://images.unsplash.com/photo-1581147036324-c17ac41e3e4b?w=900&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80'
};

function getGroup(category) {
  const value = `${category.id} ${category.name}`.toLowerCase();
  if (/laptop|smartphone|audio|camera|gaming|tv|smart-home/.test(value)) return 'electronics';
  if (/fashion|fragrance|beauty/.test(value)) return value.includes('beauty') || value.includes('fragrance') ? 'beauty' : 'fashion';
  if (/fitness|sport/.test(value)) return 'fitness';
  if (/travel|luggage/.test(value)) return 'travel';
  if (/automotive|riding/.test(value)) return 'automotive';
  if (/baby|kids|pet/.test(value)) return 'kids';
  if (/office|workspace/.test(value)) return 'office';
  if (/tool|industrial/.test(value)) return 'tools';
  if (/home|furniture|kitchen/.test(value)) return 'home';
  return 'default';
}

function priceFor(subCategory, group) {
  const value = subCategory.toLowerCase();
  if (/laptop|camera|tv|sofa|bed|mattress|console/.test(value)) return 24999;
  if (/smartphone|projector|monitor|chair|desk|refrigerator|vacuum/.test(value)) return 9999;
  if (/jewellery|jewelry|lehengas|premium|leather|helmet/.test(value)) return 2499;
  if (/trimmer|shaver|watch|shoe|sneaker|headphone|speaker|backpack/.test(value)) return 1499;
  if (group === 'fashion' || group === 'beauty') return 699;
  return 499;
}

export const infinityCatalog = fullCategoryHierarchy.flatMap(category => {
  const group = getGroup(category);
  const brands = BRAND_GROUPS[group];
  const image = IMAGE_BY_GROUP[group];

  return category.subCategories.map((subCategory, index) => ({
    name: `${subCategory} Everyday Pro Collection`,
    brand: brands[index % brands.length],
    category: category.name,
    mainCategory: category.id,
    subCategory,
    basePrice: priceFor(subCategory, group),
    image,
    variants: {
      model: ['Essential', 'Pro', 'Premium'],
      finish: ['Classic', 'Midnight Black', 'Cloud White', 'Ocean Blue'],
      pack: ['Single Item', 'Value Pack', 'Complete Kit']
    }
  }));
});

export const featuredCatalog = [
  { name: 'NovaTrim Pro Beard Trimmer', brand: 'NovaTrim', category: 'Beauty & Personal Care', mainCategory: 'beauty-care', subCategory: 'Beard Trimmers & Shavers', basePrice: 899, image: IMAGE_BY_GROUP.beauty, variants: { blade: ['Stainless Steel', 'Titanium'] , battery: ['90 min', '120 min'], color: ['Black', 'Silver', 'Blue'] } },
  { name: 'Urban Loom Oversized Hoodie', brand: 'Urban Loom', category: "Men's Fashion", mainCategory: 'men-fashion', subCategory: 'Oversized Streetwear Hoodies', basePrice: 1299, image: IMAGE_BY_GROUP.fashion, variants: { size: ['S', 'M', 'L', 'XL', 'XXL'], color: ['Black', 'Charcoal', 'Olive', 'Cream'] } },
  { name: 'Everyday Co Premium Cotton T-Shirt', brand: 'Everyday Co', category: "Men's Fashion", mainCategory: 'men-fashion', subCategory: 'T-Shirts & Polos', basePrice: 499, image: IMAGE_BY_GROUP.fashion, variants: { size: ['S', 'M', 'L', 'XL', 'XXL'], color: ['Black', 'White', 'Navy', 'Maroon'] } },
  { name: 'StyleCraft Slim Fit Casual Shirt', brand: 'StyleCraft', category: "Men's Fashion", mainCategory: 'men-fashion', subCategory: 'Casual & Formal Shirts', basePrice: 899, image: IMAGE_BY_GROUP.fashion, variants: { size: ['S', 'M', 'L', 'XL', 'XXL'], color: ['White', 'Blue', 'Black', 'Checks'] } },
  { name: 'Urban Loom Stretch Fit Jeans', brand: 'Urban Loom', category: "Men's Fashion", mainCategory: 'men-fashion', subCategory: 'Denim Jeans & Trousers', basePrice: 1199, image: IMAGE_BY_GROUP.fashion, variants: { waist: ['28', '30', '32', '34', '36', '38'], wash: ['Dark Blue', 'Light Blue', 'Black'] } },
  { name: 'Everyday Co Cargo Jogger Pants', brand: 'Everyday Co', category: "Men's Fashion", mainCategory: 'men-fashion', subCategory: 'Tactical Cargo Pants & Joggers', basePrice: 999, image: IMAGE_BY_GROUP.fashion, variants: { waist: ['28', '30', '32', '34', '36'], color: ['Black', 'Olive', 'Beige', 'Grey'] } },
  { name: 'AstraFlow 5G Smartphone', brand: 'Astra', category: 'Smartphones & Mobile', mainCategory: 'smartphones-mobile', subCategory: 'Budget 5G Smartphones', basePrice: 12999, image: IMAGE_BY_GROUP.electronics, variants: { storage: ['128GB', '256GB'], memory: ['6GB RAM', '8GB RAM'], color: ['Black', 'Blue', 'Silver'] } },
  { name: 'NovaBook Creator Laptop', brand: 'NovaTech', category: 'Laptops & Computers', mainCategory: 'laptops-computers', subCategory: 'Creator & Video Editing Laptops', basePrice: 59999, image: IMAGE_BY_GROUP.electronics, variants: { memory: ['16GB', '32GB'], storage: ['512GB SSD', '1TB SSD'], graphics: ['RTX 4050', 'RTX 4060'] } },
  { name: 'PulseBeat ANC Wireless Headphones', brand: 'Pulse', category: 'Audio & Headphones', mainCategory: 'audio', subCategory: 'Over-Ear ANC Headphones', basePrice: 2499, image: IMAGE_BY_GROUP.electronics, variants: { battery: ['30 Hours', '50 Hours'], color: ['Black', 'White', 'Blue'], connection: ['Bluetooth 5.3', 'Bluetooth 5.4'] } },
  { name: 'FitPro Adjustable Dumbbell Set', brand: 'FitPro', category: 'Fitness & Sports', mainCategory: 'fitness-sports', subCategory: 'Cast Iron & Hex Dumbbells', basePrice: 1999, image: IMAGE_BY_GROUP.fitness, variants: { weight: ['5kg', '10kg', '15kg', '20kg'], finish: ['Black', 'Chrome'] } },
  { name: 'SmartLiving Digital Air Fryer', brand: 'SmartLiving', category: 'Home & Kitchen Appliances', mainCategory: 'home-kitchen', subCategory: 'Digital Air Fryers', basePrice: 3499, image: IMAGE_BY_GROUP.home, variants: { capacity: ['4L', '5.5L', '7L'], color: ['Black', 'Silver'] } },
  { name: 'UrbanCarry Anti-Theft Laptop Backpack', brand: 'UrbanCarry', category: 'Travel & Luggage', mainCategory: 'travel-luggage', subCategory: 'Anti-Theft Laptop Backpacks', basePrice: 1199, image: IMAGE_BY_GROUP.travel, variants: { capacity: ['20L', '28L', '35L'], color: ['Black', 'Navy', 'Grey'] } }
];
