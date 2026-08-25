import { clothingProducts } from './clothing.js';
import { electronicsProducts } from './electronics.js';
import { homeProducts } from './home.js';
import { beautyProducts } from './beauty.js';
import { jewelleryAndBagsProducts } from './jewelleryAndBags.js';

// Base verified photo pools for realistic visuals across ALL categories
const photoPools = {
  laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80"
  ],
  phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=80"
  ],
  carAccessories: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=700&auto=format&fit=crop&q=80"
  ],
  bikeAccessories: [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=700&auto=format&fit=crop&q=80"
  ],
  gaming: [
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&auto=format&fit=crop&q=80"
  ],
  sarees: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80"
  ],
  kurtis: [
    "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589810635657-232952280f91?w=700&auto=format&fit=crop&q=80"
  ],
  western: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&auto=format&fit=crop&q=80"
  ],
  jeans: [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=700&auto=format&fit=crop&q=80"
  ],
  menShirts: [
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=700&auto=format&fit=crop&q=80"
  ],
  menTshirts: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700&auto=format&fit=crop&q=80"
  ],
  menPants: [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&auto=format&fit=crop&q=80"
  ],
  kids: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80"
  ],
  home: [
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=700&auto=format&fit=crop&q=80"
  ],
  beauty: [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop&q=80"
  ],
  jewellery: [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80"
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=700&auto=format&fit=crop&q=80"
  ],
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80"
  ]
};

const templates = [
  // 1. LAPTOPS & COMPUTERS (10+ ITEMS)
  {
    mainCategory: "Electronics",
    category: "electronics",
    subCategory: "Laptops & Computers",
    gender: "All",
    titles: [
      "Ultra-Slim 15.6 Inch FHD Intel Core i5 Laptop (16GB RAM / 512GB SSD)",
      "High Performance RTX 4060 RGB Gaming Laptop 144Hz IPS Display",
      "Sleek Metal Body 14 Inch Business Ultrabook with Backlit Keyboard",
      "2-in-1 Touchscreen Convertible Student Laptop with Stylus Pen Support",
      "Lightweight Everyday Fast-Boot Quad-Core Laptop for Work & College",
      "Heavy Duty Creator Laptop 4K OLED Display (32GB RAM / 1TB NVMe SSD)",
      "Compact 13.3 Inch Travel Laptop with 12-Hour All-Day Battery Life",
      "Budget Friendly Fast ChromeOS Cloud Laptop for Students & Kids",
      "Dual Fan Cooled Esports Gaming Laptop with Mechanical Keyboard",
      "Professional Developer Workstation Laptop Intel Core i7 16-Core CPU"
    ],
    fabrics: ["Aircraft Magnesium Alloy", "Brushed Aluminum Metal", "Matte Carbon Fiber Shell"],
    priceRange: [18999, 54999],
    images: photoPools.laptops,
    sizes: ["14 Inch FHD", "15.6 Inch 144Hz", "16 Inch 2.5K", "13.3 Inch OLED"],
    colors: ["Space Grey", "Silver Metallic", "Phantom Black", "Midnight Blue"],
    tags: ["laptop", "computer", "pc", "gaming laptop", "ultrabook", "notebook", "intel", "ssd", "ram", "workstation", "electronics"]
  },

  // 2. SMARTPHONES & MOBILE PHONES (10+ ITEMS)
  {
    mainCategory: "Electronics",
    category: "electronics",
    subCategory: "Smartphones & Mobile",
    gender: "All",
    titles: [
      "5G Ultra Flagship 120Hz Curved AMOLED Smartphone (108MP OIS Camera)",
      "Performance Beast Gaming Phone with 6000mAh Battery & 67W Turbo Charge",
      "Sleek Edge-to-Edge 6.7 Inch Android Smartphone 12GB RAM 256GB Storage",
      "Budget 5G King Smartphone with AI Triple Camera & Fast Fingerprint",
      "Compact Lightweight Dual SIM Smartphone with Glass Back Finish",
      "All-Day 7000mAh Power Monster Smartphone with Reverse Fast Charging",
      "Pro Portrait Camera Smartphone with 50MP Sony IMX Sensor",
      "Rugged Waterproof Shockproof Outdoor Smartphone with Night Vision",
      "Slim Bezel 90Hz Smooth Display Budget Smartphone 128GB ROM",
      "Ultra Fast 120W HyperCharge Flagship Smartphone with Snapdragon CPU"
    ],
    fabrics: ["Gorilla Glass Victus", "Vegan Leather Back", "Polycarbonate Glass Finish"],
    priceRange: [7499, 29999],
    images: photoPools.phones,
    sizes: ["6GB + 128GB", "8GB + 128GB", "8GB + 256GB", "12GB + 256GB"],
    colors: ["Cosmic Black", "Aurora Green", "Starlight Blue", "Sunset Gold"],
    tags: ["phone", "smartphone", "mobile", "5g", "android", "camera", "battery", "fast charging", "oled", "amoled", "electronics"]
  },

  // 3. CAR ACCESSORIES & AUTO CARE (10+ ITEMS)
  {
    mainCategory: "Automotive",
    category: "automotive",
    subCategory: "Car Accessories",
    gender: "All",
    titles: [
      "4K Ultra HD Dual Dash Cam with Night Vision & Built-in GPS Wi-Fi",
      "High Power 120W Portable Handheld Wireless Car Vacuum Cleaner",
      "Ambient RGB Interior Car LED Strip Lights with Music Sync App Control",
      "Digital High-Speed Automatic Car Tire Inflator & Air Compressor Pump",
      "Universal 360 Degree Magnetic Dashboard Car Mobile Phone Mount",
      "Solar Powered Auto Car Air Purifier & Fragrance Aroma Diffuser",
      "Heavy Duty High Pressure Car Washer Foam Gun with Brass Nozzle",
      "Ergonomic Memory Foam Car Seat Neck Rest & Lumbar Support Pillow Set",
      "Emergency 1200A Peak Portable Car Jump Starter Power Bank",
      "Hydrophobic Nano Ceramic Coating Spray for Instant Paint Gloss & Shield"
    ],
    fabrics: ["ABS Composite", "Aerospace Aluminum", "Memory Foam + Breathable Mesh"],
    priceRange: [199, 1499],
    images: photoPools.carAccessories,
    sizes: ["Universal Fit", "Set of 2", "Pack of 4", "Compact Portable"],
    colors: ["Carbon Fiber Black", "Metallic Silver", "Matte Grey", "Neon RGB"],
    tags: ["car", "car accessories", "dashcam", "vacuum cleaner", "tire inflator", "car wash", "automotive", "car interior", "car seat", "mobile holder", "jump starter"]
  },

  // 4. BIKE ACCESSORIES & RIDING GEAR (10+ ITEMS)
  {
    mainCategory: "Automotive",
    category: "automotive",
    subCategory: "Bike Accessories & Gear",
    gender: "All",
    titles: [
      "DOT Certified Aerodynamic Full-Face Motorcycle Helmet with Dual Visor",
      "Touchscreen Breathable Hard Knuckle Protective Biker Riding Gloves",
      "110dB Anti-Theft Alarm Disc Brake Lock for Motorbikes & Scooters",
      "Super Bright LED Auxiliary Fog Lights with Strobe Flash Mode (Pair)",
      "Waterproof Heavy Duty Motorcycle Magnetic Tank Bag with Phone Pouch",
      "All-Weather CE Level 2 Armored Biker Riding Jacket with Thermal Liner",
      "Waterproof Motorcycle Handlebar Phone Mount with 18W Fast USB Charger",
      "Complete Bike Chain Cleaning Brush & High-Viscosity Chain Lube Kit",
      "Reflective Neon High-Visibility Waterproof Biker Rain Coat Suit Set",
      "All-Weather UV & Dust Proof Heavy Duty Universal Bike Body Cover"
    ],
    fabrics: ["ABS Polycarbonate Shell", "Cordura Fabric", "Genuine Leather + Kevlar", "Ripstop Waterproof Nylon"],
    priceRange: [199, 2499],
    images: photoPools.bikeAccessories,
    sizes: ["M", "L", "XL", "Universal Fit"],
    colors: ["Stealth Matte Black", "Neon Green", "Racing Red", "Silver Grey"],
    tags: ["bike", "motorcycle", "helmet", "biker gloves", "riding gear", "disc lock", "fog lights", "bike cover", "automotive", "bike jacket", "chain lube"]
  },

  // 5. GAMING & PC GEAR (10+ ITEMS)
  {
    mainCategory: "Electronics",
    category: "electronics",
    subCategory: "Gaming & PC Gear",
    gender: "All",
    titles: [
      "RGB Backlit 7.1 Surround Pro Gaming Headset with Noise-Cancelling Mic",
      "Ergonomic 7200 DPI RGB Optical Gaming Mouse for Laptop & PC",
      "Compact Mechanical Gaming Keyboard with Rainbow LED Backlight & Blue Switches",
      "Aluminum Multi-Angle Ergonomic Laptop Stand with Dual High-Speed Cooling Fans",
      "Low Latency 40ms True Wireless Gaming Earbuds with Deep Bass & Mic",
      "Extended XL Anti-Slip Speed Gaming Mousepad (800x300mm)",
      "Multi-Port 6-in-1 Type-C Hub with 4K HDMI & USB 3.0 for Laptops",
      "Ergonomic High-Back Reclining Esports Gaming Chair with Footrest",
      "Ultra-Clear 1080P 60FPS Streaming USB Webcam with Privacy Shutter",
      "Studio Grade USB Cardioid Condenser Microphone for Gaming & Streaming"
    ],
    fabrics: ["ABS + Braided Cable", "Aircraft Grade Aluminum", "Memory Foam + Protein Leather", "Waterproof Micro-Weave Fabric"],
    priceRange: [249, 1499],
    images: photoPools.gaming,
    sizes: ["Standard Ergonomic", "Adjustable Fit", "XL 800x300mm"],
    colors: ["RGB Cyber Black", "Matte Stealth Grey", "Neon Blue", "Chroma Red"],
    tags: ["gaming", "laptop", "pc", "game", "headset", "mouse", "keyboard", "cooling pad", "earphones", "mic", "rgb", "computer", "gamer", "usb", "stand"]
  },

  // 6. MEN'S T-SHIRTS (10+ ITEMS)
  {
    mainCategory: "Clothing",
    category: "men",
    subCategory: "T-Shirts",
    gender: "Men",
    titles: [
      "Streetwear Oversized Drop-Shoulder Graphic Print Cotton T-Shirt",
      "100% Pure Supima Cotton Classic Crew Neck Premium Solid T-Shirt",
      "Ribbed Collar Cotton Pique Polo T-Shirt with Contrast Tipping",
      "Pack of 2 Dry-Fit Breathable Sports Workout Gym T-Shirts",
      "Vintage Washed Acid Dye Heavyweight Streetwear Boxy T-Shirt",
      "Waffle Knit Textured Henley Neck Short Sleeve Casual T-Shirt",
      "Anime Japanese Aesthetic Graphic Back Print Cotton T-Shirt",
      "Full Sleeve Slim Fit Stretchable Thermal Cotton T-Shirt",
      "Tie-Dye Bohemian Summer Beach Oversized Cotton T-Shirt",
      "Minimalist Pocket Detail Bio-Washed Organic Cotton T-Shirt"
    ],
    fabrics: ["100% Bio-Wash Combed Cotton (220 GSM)", "Pure Supima Cotton", "Dry-Fit Polyester Mesh", "Waffle Knit Cotton"],
    priceRange: [149, 499],
    images: photoPools.menTshirts,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    colors: ["Jet Black", "Crisp White", "Sage Green", "Charcoal Grey", "Burgundy", "Navy Blue", "Lavender"],
    tags: ["tshirt", "t-shirt", "tee", "men", "oversized", "graphic tee", "polo", "gym", "cotton", "casual", "streetwear"]
  },

  // 7. MEN'S SHIRTS (10+ ITEMS)
  {
    mainCategory: "Clothing",
    category: "men",
    subCategory: "Shirts",
    gender: "Men",
    titles: [
      "100% Pure Oxford Cotton Slim Fit Casual Full Sleeve Shirt",
      "Pure Linen Spread Collar Relaxed Fit Summer Casual Shirt",
      "Classic Buffalo Plaid Flannel Check Heavy Cotton Shirt",
      "Formal Crisp White Business Dress Shirt with French Cuffs",
      "Vintage Washed Denim Casual Over-Shirt with Double Chest Pockets",
      "Printed Resort Hawaiian Camp Collar Vacation Beach Shirt",
      "Textured Corduroy Casual Button-Down Winter Over-Shirt",
      "Mandarin Chinese Collar Short Kurta Shirt for Casual & Festive",
      "Glossy Silk Satin Partywear Slim Fit Clubbing Shirt",
      "Vertical Striped Casual Breathable Cotton Linen Blend Shirt"
    ],
    fabrics: ["100% Oxford Cotton", "Pure French Linen", "Brushed Flannel", "Denim Cotton", "Satin Silk Blend"],
    priceRange: [249, 799],
    images: photoPools.menShirts,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Crisp White", "Navy Blue", "Olive Green", "Matte Black", "Wine Red", "Sky Blue", "Camel Brown"],
    tags: ["shirt", "men shirt", "formal shirt", "casual shirt", "oxford shirt", "linen shirt", "flannel", "denim shirt", "cotton", "men"]
  },

  // 8. MEN'S JEANS & BOTTOMWEAR (10+ ITEMS)
  {
    mainCategory: "Clothing",
    category: "men",
    subCategory: "Bottomwear",
    gender: "Men",
    titles: [
      "6-Pocket Tactical Military Cargo Pants with Drawstring Ankle",
      "Relaxed Fit 90s Vintage Wide Leg Baggy Denim Jeans",
      "Comfort Stretch Cotton Chinos Slim Fit Casual Trousers",
      "Heavyweight Tech Fleece Jogger Trackpants with Zip Pockets",
      "Korean Style Pleated Relaxed Fit Casual Straight Trousers",
      "Heavy Distressed Ripped Biker Stretchable Denim Jeans",
      "Athletic Gym Running Track Pants with Reflective Stripe",
      "Breathable Linen Drawstring Trousers for Summer Vacation",
      "Classic Slim Straight Dark Indigo Blue Denim Jeans",
      "Casual Elastic Waist Cotton Twill Chino Shorts with Pockets"
    ],
    fabrics: ["Cotton Stretch Denim", "Heavy Duty Cotton Twill", "Tech Fleece Poly-Cotton", "Pure Linen Blend"],
    priceRange: [299, 899],
    images: photoPools.menPants,
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Washed Black", "Light Indigo", "Dark Blue", "Olive Khaki", "Beige", "Charcoal Grey"],
    tags: ["jeans", "cargo", "cargo pants", "pants", "trousers", "joggers", "trackpants", "chinos", "denim", "bottomwear", "men"]
  },

  // 9. WOMEN'S SAREES (10+ ITEMS)
  {
    mainCategory: "Clothing",
    category: "women-ethnic",
    subCategory: "Sarees",
    gender: "Women",
    titles: [
      "Banarasi Silk Jacquard Woven Rich Zari Saree with Unstitched Blouse Piece",
      "Kanjivaram Traditional Royal Zari Border Silk Saree for Weddings",
      "Bollywood Style Heavy Sequin Georgette Partywear Saree with Border",
      "Floral Printed Organza Lightweight Designer Festive Saree",
      "Pure Paithani Silk Saree with Peacock Motif Contrast Pallu",
      "Chanderi Cotton Handloom Lightweight Daily Wear Printed Saree",
      "Bandhani Jaipuri Pure Georgette Gota Patti Festive Saree",
      "Tussar Art Silk Traditional Temple Border Festive Saree",
      "Embroidered Net Partywear Designer Saree with Stone Work",
      "Pure Mysore Silk Contrast Pallu Traditional Puja Saree"
    ],
    fabrics: ["Banarasi Art Silk", "Pure Kanjivaram Silk", "Georgette", "Organza", "Chanderi Cotton", "Paithani Silk"],
    priceRange: [249, 999],
    images: photoPools.sarees,
    sizes: ["Free Size (5.5m + 0.8m Blouse)"],
    colors: ["Royal Maroon", "Peacock Green", "Deep Rani Pink", "Mustard Gold", "Navy Blue", "Bottle Green"],
    tags: ["saree", "silk saree", "banarasi", "kanjivaram", "wedding", "shaadi", "ethnic", "festive", "traditional", "partywear"]
  },

  // 10. WOMEN'S KURTIS & SETS (10+ ITEMS)
  {
    mainCategory: "Clothing",
    category: "women-ethnic",
    subCategory: "Kurta Sets",
    gender: "Women",
    titles: [
      "Pure Rayon Heavy Flared Anarkali Kurti with Pant & Organza Dupatta Set",
      "Lucknowi Hand Chikankari Georgette Kurta with Inner & Cotton Pant",
      "Alia Cut Embroidered V-Neck Pure Cotton Floral Printed Kurta Set",
      "Nayra Cut Heavy Zari Work Festive Partywear Kurta Pant Set",
      "Jaipuri Hand Block Print 100% Mulmul Cotton Straight Kurta Set",
      "Festive Sharara Suit Set with Gota Patti Lace Work & Dupatta",
      "Velvet Heavy Embroidered Winter Wedding Kurti Pant Set",
      "Short Cotton Kurti Tunic with Mandarin Collar for Jeans",
      "A-Line Flared Floral Printed Casual Daily College Kurti",
      "Printed Kaftan Kurta Set with Drawstring Belt & Cigarette Pants"
    ],
    fabrics: ["100% Heavy Rayon", "Pure Mulmul Cotton", "Georgette", "Chanderi Silk", "Velvet"],
    priceRange: [249, 899],
    images: photoPools.kurtis,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    colors: ["Sky Blue", "Mustard Yellow", "Sage Green", "Peach Pink", "Lavender", "Wine", "Bottle Green"],
    tags: ["kurti", "kurta set", "anarkali", "chikankari", "suit", "dupatta", "ethnic", "women", "festive", "office wear"]
  },

  // 11. BEAUTY & SKINCARE (10+ ITEMS)
  {
    mainCategory: "Beauty & Health",
    category: "beauty-health",
    subCategory: "Skincare & Makeup",
    gender: "Women",
    titles: [
      "10% Vitamin C + Hyaluronic Acid Radiance Glowing Face Serum (30ml)",
      "Pack of 12 Velvet Matte 16H Long-Stay Waterproof Liquid Lipsticks",
      "2% Salicylic Acid Anti-Acne Oil-Control Gentle Face Cleanser (100ml)",
      "Ultra-Lightweight Invisible SPF 50+ PA++++ Sunscreen Gel (50g)",
      "18-Shade Ultra Pigmented Nude & Glitter Eyeshadow Palette",
      "Hydro-Boost Hyaluronic Acid 72H Deep Hydrating Water Gel Cream",
      "Waterproof 24H Smudge-Proof Precision Jet Black Liquid Eyeliner",
      "Glow Boosting Rose Gold Facial Beauty Elixir Oil with 24K Flakes",
      "Micro-Fine HD Translucent Setting Powder with Oil Absorption",
      "Green Tea Purifying Pore Clarifying Clay Face Mask (100g)"
    ],
    fabrics: ["Dermatologically Tested", "Cruelty-Free Vegan", "Non-Comedogenic"],
    priceRange: [149, 499],
    images: photoPools.beauty,
    sizes: ["30ml Serum", "Set of 12", "50g Gel", "Standard Size"],
    colors: ["Nude & Bold Reds", "Clear Gel", "Jet Black", "Natural Glow"],
    tags: ["serum", "lipstick", "makeup", "skincare", "glow", "face wash", "sunscreen", "eyeliner", "beauty", "cosmetics"]
  },

  // 12. HOME & KITCHEN (10+ ITEMS)
  {
    mainCategory: "Home & Kitchen",
    category: "home-kitchen",
    subCategory: "Home Furnishing & Kitchen",
    gender: "All",
    titles: [
      "100% Glace Cotton King Size 3D Floral Printed Bedsheet with 2 Pillow Covers",
      "Airtight Modular Kitchen Storage Glass Jars with Bamboo Lids (Set of 6)",
      "Non-Stick Granite Cookware Set of 3 (Fry Pan, Kadhai, Dosa Tawa)",
      "Luxury Velvet Blackout Thermal Insulated Eyelet Curtains (Pack of 2)",
      "Super Soft Microfiber All-Season Reversible AC Comforter Blanket",
      "Digital High-Precision Smart Body Fat Weighing Scale with App Sync",
      "Stainless Steel 304 Leak-Proof Oil Pourer Dispenser Bottle 1000ml",
      "Anti-Skid Ultra Soft Shaggy Area Floor Rug Carpet for Living Room",
      "Bohemian Jacquard Geometric Decorative Cushion Covers (Set of 5)",
      "Heavy Duty Stainless Steel Multi-Layer Spice Rack Organizer Stand"
    ],
    fabrics: ["100% Glace Cotton (250 TC)", "Borosilicate Glass", "Die-Cast Granite Aluminum", "Microfiber Poly-Velvet"],
    priceRange: [199, 899],
    images: photoPools.home,
    sizes: ["King Size (90x100 Inch)", "Set of 6 Jars", "7 Feet Door Curtains", "Set of 5 Cushions"],
    colors: ["Floral Navy", "Royal Maroon", "Grey Geometric", "Clear Glass", "Granite Black"],
    tags: ["bedsheet", "kitchen", "curtains", "comforter", "jars", "cookware", "home decor", "home", "pillow", "cushion"]
  },

  // 13. JEWELLERY & ACCESSORIES (10+ ITEMS)
  {
    mainCategory: "Jewellery & Accessories",
    category: "jewellery-accessories",
    subCategory: "Jewellery",
    gender: "Women",
    titles: [
      "Traditional 24K Gold Plated Temple Choker Necklace Set with Jhumkas",
      "Sparkling American Diamond Solitaire Adjustable Ring with Gift Box",
      "Oxidized Silver Bohemian Tribal Peacock Jhumka Earrings",
      "Kundan Bridal Heavy Pearl Drop Choker Necklace Set with Maangtikka",
      "Minimalist 18K Rose Gold Plated Anti-Tarnish Heart Pendant Chain",
      "Cubic Zirconia Luxury Crystal Tennis Bracelet for Women",
      "Meenakari Enamel Handcrafted Floral Statement Chandelier Earrings",
      "Evil Eye Protection 18K Gold Plated Adjustable Charm Bracelet",
      "Layered Dainty Coin Pendant Necklace in 18K Gold Polish",
      "Traditional Rajasthani Kundan Jadau Borla Mathapatti Hair Jewellery"
    ],
    fabrics: ["24K Gold Plated Brass", "925 Sterling Silver Polish", "AAA Austrian Crystal"],
    priceRange: [149, 599],
    images: photoPools.jewellery,
    sizes: ["Free Size Adjustable", "Choker + Earrings Set"],
    colors: ["Antique Temple Gold", "Rose Gold", "Oxidized Silver", "Kundan Pearl"],
    tags: ["jewellery", "necklace", "choker", "earrings", "jhumka", "gold", "silver", "ring", "bracelet", "bridal"]
  },

  // 14. FOOTWEAR (10+ ITEMS)
  {
    mainCategory: "Jewellery & Accessories",
    category: "jewellery-accessories",
    subCategory: "Footwear",
    gender: "All",
    titles: [
      "Air Cushion Shock-Absorbing Breathable Lightweight Running Shoes",
      "Classic Low-Top Crisp White Streetwear Casual Sneakers for Men",
      "Handcrafted Pure Leather Slip-On Formal Driving Loafers",
      "Women's Memory Foam Ultra Comfort Daily Walking Sneaker Shoes",
      "High-Ankle Suede Leather Chelsea Boots with Elastic Gore",
      "Orthopedic Comfort Soft Sole Dailywear Flip Flops Slides",
      "Traditional Handcrafted Embroidered Punjabi Jutti Mojari",
      "Waterproof Rugged Anti-Skid Outdoor Hiking & Trekking Boots",
      "Women's Block Heel Ankle Strap Stylish Partywear Sandals",
      "Lightweight EVA Cloud Slides for Home, Gym & Pool Casual"
    ],
    fabrics: ["Breathable Flyknit Mesh", "Synthetic Vegan Leather", "High-Grade EVA Foam Sole"],
    priceRange: [249, 899],
    images: photoPools.shoes,
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    colors: ["Triple White", "Stealth Black", "Navy Blue", "Tan Brown", "Blush Pink"],
    tags: ["shoes", "sneakers", "running shoes", "footwear", "loafers", "boots", "sandals", "jutti", "slides", "men footwear", "women footwear"]
  }
];

const sellers = [
  { name: "Royal Trendz Hub", rating: 4.8, followers: "45.2k", productsCount: 420 },
  { name: "Shree Ganesh Fashion", rating: 4.6, followers: "32.1k", productsCount: 380 },
  { name: "Apex Tech Labs", rating: 4.9, followers: "68.5k", productsCount: 510 },
  { name: "Vogue Elegance India", rating: 4.7, followers: "28.4k", productsCount: 290 },
  { name: "Urban Street Wear", rating: 4.8, followers: "51.0k", productsCount: 340 },
  { name: "Glamour Glow Beauty", rating: 4.9, followers: "82.3k", productsCount: 210 },
  { name: "Home Comforts Co.", rating: 4.7, followers: "19.8k", productsCount: 190 },
  { name: "Heritage Jewellers", rating: 4.9, followers: "74.1k", productsCount: 310 },
  { name: "AutoTech Pro Gear", rating: 4.8, followers: "39.6k", productsCount: 260 }
];

export function generate100KProducts() {
  const generated = [];
  const TOTAL_TARGET = 100250;
  
  // First include all handcrafted starter products
  const starter = [
    ...clothingProducts,
    ...electronicsProducts,
    ...homeProducts,
    ...beautyProducts,
    ...jewelleryAndBagsProducts
  ];
  
  starter.forEach(p => generated.push(p));

  // Round-robin generator across all templates
  let counter = starter.length + 1;

  while (generated.length < TOTAL_TARGET) {
    const tIndex = (counter - starter.length) % templates.length;
    const t = templates[tIndex];
    
    const titleBase = t.titles[counter % t.titles.length];
    const image = t.images[counter % t.images.length];
    const fabric = t.fabrics[counter % t.fabrics.length];
    const seller = sellers[counter % sellers.length];
    
    // Realistic price variation
    const minP = t.priceRange[0];
    const maxP = t.priceRange[1];
    const priceStep = 10;
    const price = minP + (Math.floor(Math.sin(counter) * (maxP - minP) / priceStep) * priceStep) + (counter % 30);
    const safePrice = Math.max(minP, Math.min(maxP, Math.abs(price)));
    const discount = 50 + (counter % 35); // 50% to 85% off
    const originalPrice = Math.round(safePrice / (1 - (discount / 100)));
    const rating = +(4.0 + ((counter % 10) * 0.1)).toFixed(1);
    const reviewsCount = 150 + ((counter * 73) % 45000);

    const product = {
      id: `prod-${counter}`,
      title: `${titleBase} #${(counter % 900) + 100}`,
      category: t.category,
      mainCategory: t.mainCategory,
      subCategory: t.subCategory,
      gender: t.gender,
      price: safePrice,
      originalPrice,
      discount,
      rating: rating > 5.0 ? 4.8 : rating,
      reviewsCount,
      images: [
        image,
        t.images[(counter + 1) % t.images.length],
        t.images[(counter + 2) % t.images.length]
      ].filter(Boolean),
      sizes: t.sizes,
      colors: t.colors,
      freeDelivery: true,
      firstOrderDiscount: counter % 2 === 0 ? 50 : 30,
      infinityMall: counter % 3 === 0,
      description: `Premium quality ${titleBase}. Handcrafted with highest grade materials (${fabric}). 100% verified authentic product by ${seller.name} with Free PAN-India Delivery and 7-day hassle-free doorstep returns.`,
      fabric,
      specs: {
        "Brand / Manufacturer": seller.name,
        "Material / Grade": fabric,
        "Country of Origin": "India",
        "Quality Standard": "100% Quality Checked",
        "Delivery": "Free Express PAN India"
      },
      seller,
      tags: [...t.tags, `style-${counter % 50}`, t.subCategory.toLowerCase(), t.category]
    };

    generated.push(product);
    counter++;
  }

  return generated;
}
