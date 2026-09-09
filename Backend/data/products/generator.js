import { clothingProducts } from './clothing.js';
import { electronicsProducts } from './electronics.js';
import { homeProducts } from './home.js';
import { beautyProducts } from './beauty.js';
import { jewelleryAndBagsProducts } from './jewelleryAndBags.js';
import { fullCategoryHierarchy } from './catalogHierarchy.js';

// Comprehensive verified photo pools for realistic visuals across ALL 22 categories
const photoPools = {
  laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700&auto=format&fit=crop&q=80"
  ],
  phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=700&auto=format&fit=crop&q=80"
  ],
  tablets: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585770536735-27993a0e0471?w=700&auto=format&fit=crop&q=80"
  ],
  audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=700&auto=format&fit=crop&q=80"
  ],
  tv: [
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=700&auto=format&fit=crop&q=80"
  ],
  cameras: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&auto=format&fit=crop&q=80"
  ],
  gaming: [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612287232230-e8e04a9d7bdf?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80"
  ],
  menClothing: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=700&auto=format&fit=crop&q=80"
  ],
  womenClothing: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80"
  ],
  beauty: [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621607512214-68297480165e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=80"
  ],
  fragrances: [
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=700&auto=format&fit=crop&q=80"
  ],
  fitness: [
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=700&auto=format&fit=crop&q=80"
  ],
  kitchen: [
    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=700&auto=format&fit=crop&q=80"
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&auto=format&fit=crop&q=80"
  ],
  decor: [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700&auto=format&fit=crop&q=80"
  ],
  books: [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=700&auto=format&fit=crop&q=80"
  ],
  automotive: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&auto=format&fit=crop&q=80"
  ],
  luggage: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=700&auto=format&fit=crop&q=80"
  ],
  pets: [
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=700&auto=format&fit=crop&q=80"
  ],
  kids: [
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=700&auto=format&fit=crop&q=80"
  ],
  office: [
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=700&auto=format&fit=crop&q=80"
  ],
  smartHome: [
    "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558002038-1055907df827?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700&auto=format&fit=crop&q=80"
  ],
  tools: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=700&auto=format&fit=crop&q=80"
  ],
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=700&auto=format&fit=crop&q=80"
  ],
  jewellery: [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80"
  ]
};

// 22 Category Templates with granular subcategories, realistic titles, specs generators & tags
const categoryTemplates = [
  // 1. LAPTOPS & COMPUTERS
  {
    category: "laptops-computers",
    mainCategory: "Laptops & Computers",
    subCategory: "Gaming Laptops",
    productType: "RTX 4060 Gaming Laptop",
    brands: ["ASUS ROG", "Lenovo Legion", "HP OMEN", "MSI Cyborg", "Acer Predator", "Dell Alienware"],
    titles: [
      "15.6 Inch 144Hz FHD Intel Core i7 Gaming Laptop (RTX 4060 8GB, 16GB DDR5, 1TB NVMe SSD)",
      "High Performance AMD Ryzen 7 7840HS Esports Gaming Laptop (RTX 4050 6GB, 16GB RAM)",
      "Ultra-Slim 14 Inch OLED 120Hz Creator & Gaming Laptop (Intel Core Ultra 7, 32GB RAM)",
      "Dual Fan Liquid Cooled RTX 4070 RGB Backlit Mechanical Esports Laptop (1TB SSD)"
    ],
    priceRange: [54999, 134999],
    images: photoPools.laptops,
    sizes: ["15.6 Inch 144Hz", "16 Inch 240Hz WQXGA", "14 Inch 120Hz OLED"],
    colors: ["Eclipse Gray", "Phantom Black", "Mecha Shadow"],
    tags: ["laptop", "gaming laptop", "computer", "pc", "rtx 4060", "rtx 4050", "intel i7", "ryzen 7", "ddr5", "144hz", "esports", "high fps", "electronics"],
    specsGen: (b, t) => ({
      "Processor": "Intel Core i7-13700H / AMD Ryzen 7 7840HS",
      "Graphics": "NVIDIA GeForce RTX 4060 (8GB GDDR6)",
      "RAM & Storage": "16GB DDR5 5200MHz | 1TB PCIe Gen4 NVMe SSD",
      "Display": "15.6 Inch 144Hz IPS FHD (100% sRGB, G-Sync)",
      "Operating System": "Windows 11 Home + MS Office 2024",
      "Weight & Battery": "2.2kg | 80Wh (Up to 7 Hours Run)"
    })
  },
  {
    category: "laptops-computers",
    mainCategory: "Laptops & Computers",
    subCategory: "Coding & Developer Laptops",
    productType: "Developer Ultrabook",
    brands: ["Lenovo ThinkPad", "Apple MacBook", "Dell Inspiron", "HP Pavilion Plus", "ASUS ZenBook"],
    titles: [
      "14 Inch 2.8K OLED Business Ultrabook (Intel Core i5 13th Gen, 16GB RAM, 512GB SSD)",
      "Lightweight Magnesium Alloy Developer Laptop (AMD Ryzen 5 Quad-Core, 16GB DDR5)",
      "M3 Chip 13.6 Inch Liquid Retina Developer Workstation (8-Core CPU, 10-Core GPU)",
      "2-in-1 Touchscreen Convertible Student & Coding Laptop with Active Stylus Support"
    ],
    priceRange: [38999, 89999],
    images: photoPools.laptops,
    sizes: ["14 Inch FHD IPS", "13.3 Inch OLED", "15.6 Inch EyeCare"],
    colors: ["Space Gray", "Silver Metallic", "Midnight Blue"],
    tags: ["laptop", "coding laptop", "developer", "ultrabook", "student laptop", "programming", "thinkpad", "macbook", "workstation", "intel i5", "ssd", "electronics"],
    specsGen: (b, t) => ({
      "Processor": "Intel Core i5-13500H / Apple M3 / Ryzen 5 7530U",
      "RAM & Storage": "16GB LPDDR5 | 512GB NVMe M.2 SSD",
      "Display": "14 Inch 2.8K Anti-Glare TÜV Certified Display",
      "Battery Life": "Up to 14 Hours All-Day Battery (65W Fast PD)",
      "Keyboard": "Backlit Spill-Resistant Precision Keyboard",
      "Weight": "1.38kg Ultra-Portable"
    })
  },

  // 2. SMARTPHONES & MOBILE
  {
    category: "smartphones-mobile",
    mainCategory: "Smartphones & Mobile",
    subCategory: "5G Flagship Smartphones",
    productType: "Flagship 5G Phone",
    brands: ["Samsung Galaxy", "OnePlus", "Apple iPhone", "Xiaomi Pro", "iQOO", "Realme GT", "Google Pixel"],
    titles: [
      "5G 120Hz Curved AMOLED Smartphone (108MP OIS Sony Sensor, 67W Turbo Charge)",
      "Snapdragon 8 Gen 3 Performance Beast Gaming Smartphone (6000mAh Battery, 120W Charge)",
      "Ultra-Slim 6.7 Inch 1.5K AMOLED 5G Smartphone (12GB RAM, 256GB Storage, 50MP AI Triple Camera)",
      "Compact Lightweight Dual SIM 5G Smartphone with Vegan Leather Back Finish"
    ],
    priceRange: [14999, 58999],
    images: photoPools.phones,
    sizes: ["8GB + 128GB", "8GB + 256GB", "12GB + 256GB", "16GB + 512GB"],
    colors: ["Cosmic Black", "Emerald Green", "Starlight Blue", "Sunset Gold"],
    tags: ["phone", "smartphone", "mobile", "5g", "flagship", "camera phone", "amoled", "120hz", "snapdragon", "fast charging", "android", "iphone", "electronics"],
    specsGen: (b, t) => ({
      "Processor": "Snapdragon 8 Gen 3 / MediaTek Dimensity 9300",
      "Display": "6.74 Inch 120Hz Curved AMOLED (2600 Nits Peak)",
      "Rear Camera": "108MP OIS Main + 8MP Ultra-Wide + 2MP Macro",
      "Front Camera": "32MP High-Res Selfie Camera",
      "Battery & Charging": "5500mAh + 100W HyperCharge (0-100% in 22 mins)",
      "5G Connectivity": "14 Global 5G Bands Supported"
    })
  },
  {
    category: "smartphones-mobile",
    mainCategory: "Smartphones & Mobile",
    subCategory: "Smartwatches & Wearables",
    productType: "Bluetooth Calling Smartwatch",
    brands: ["Apple Watch", "Samsung Galaxy Watch", "Noise", "Boat", "Fire-Boltt", "Amazfit", "Garmin"],
    titles: [
      "1.96 Inch AMOLED Display Bluetooth Calling Smartwatch with AI Voice & 100+ Sports Modes",
      "Ultra-Lightweight GPS Fitness Tracker Band with Continuous SpO2 & Heart Rate Monitor",
      "Rugged Outdoor Military Grade 50M Waterproof Smartwatch with Compass & 15-Day Battery",
      "Stainless Steel Luxury Mesh Strap Bluetooth Calling Smartwatch with Always-On Display"
    ],
    priceRange: [1299, 14999],
    images: photoPools.phones,
    sizes: ["44mm Dial", "46mm Rugged Dial", "1.96 Inch AMOLED", "Slim Band"],
    colors: ["Jet Black", "Silver Chrome", "Rose Gold", "Military Green"],
    tags: ["smartwatch", "fitness band", "calling watch", "wearables", "smart watch", "fitness tracker", "watch", "amoled watch"],
    specsGen: (b, t) => ({
      "Display": "1.96 Inch AMOLED (410x502 Pixels, 1000 Nits AOD)",
      "Calling": "Single-Chip Bluetooth 5.3 Calling with Noise Cancelling Mic",
      "Health Tracking": "24/7 Heart Rate, SpO2, Sleep Monitor & Stress Tracker",
      "Battery Life": "Up to 10 Days Typical Usage (Fast Magnetic Charge)",
      "Water Resistance": "IP68 / 5ATM Water Resistant"
    })
  },

  // 3. AUDIO & HEADPHONES
  {
    category: "audio",
    mainCategory: "Audio & Headphones",
    subCategory: "TWS Earbuds & ANC",
    productType: "Wireless ANC Earbuds",
    brands: ["Sony", "Bose", "Boat", "OnePlus Nord", "Noise", "Sennheiser", "JBL", "Realme Buds"],
    titles: [
      "Hybrid Active Noise Cancelling (45dB ANC) True Wireless Earbuds with Quad-Mic ENC",
      "Low Latency 40ms Gaming Earbuds with 50H Battery Life & Deep Punchy Bass",
      "Hi-Res LDAC Audio Certified Wireless Bluetooth Neckband with Fast Charging (60H Playtime)",
      "Premium Studio Grade High-Resolution In-Ear Monitors (IEM) with Detachable Silver Cable"
    ],
    priceRange: [899, 7999],
    images: photoPools.audio,
    sizes: ["Universal In-Ear with 3 Ear-Tip Sizes", "Ergonomic Neckband"],
    colors: ["Midnight Black", "Glacier White", "Cyber Neon Yellow", "Navy Blue"],
    tags: ["headphones", "earbuds", "tws", "anc", "noise cancellation", "audio", "wireless earphones", "bass", "earphone", "bluetooth", "music", "mic"],
    specsGen: (b, t) => ({
      "Noise Cancellation": "45dB Hybrid Active Noise Cancellation (ANC)",
      "Driver Size": "12.4mm Titanized Bass Diaphragm Drivers",
      "Playtime & Battery": "Up to 50 Hours Total (10 Min Charge = 8 Hours)",
      "Bluetooth & Codec": "Bluetooth 5.3 + AAC / LDAC Lossless Audio",
      "Water Resistance": "IP55 Dust & Sweat Resistant",
      "Microphones": "Quad-Mic AI Clear Voice ENC"
    })
  },
  {
    category: "audio",
    mainCategory: "Audio & Headphones",
    subCategory: "Soundbars & Home Audio",
    productType: "120W Dolby Atmos Soundbar",
    brands: ["Sony", "JBL", "Boat Aavante", "Samsung Soundbar", "Zebronics", "Philips Audio"],
    titles: [
      "120W Dolby Atmos 2.1 Channel Wireless Bluetooth Soundbar with Wired Subwoofer",
      "Portable Waterproof IPX7 Outdoor RGB Bluetooth Speaker with 24H Battery Life",
      "Studio USB Cardioid Condenser Microphone for Podcasting, Streaming & Gaming"
    ],
    priceRange: [1499, 14999],
    images: photoPools.audio,
    sizes: ["32-Inch Soundbar", "Portable Cylinder Speaker", "Studio Desk Mic"],
    colors: ["Matte Black", "Gunmetal Grey", "Army Camo"],
    tags: ["soundbar", "speaker", "bluetooth speaker", "home theatre", "dolby atmos", "subwoofer", "microphone", "mic", "audio", "sound"],
    specsGen: (b, t) => ({
      "Output Power": "120W RMS Peak Output",
      "Audio Tech": "Dolby Atmos 3D Surround Sound & EQ Modes",
      "Connectivity": "HDMI ARC, Optical, Bluetooth 5.3, AUX, USB",
      "Subwoofer": "6.5-inch Deep Bass Down-Firing Subwoofer"
    })
  },

  // 4. TV & ENTERTAINMENT
  {
    category: "tv-entertainment",
    mainCategory: "TV & Entertainment",
    subCategory: "4K Ultra HD Smart TVs",
    productType: "4K Smart TV",
    brands: ["Samsung", "LG", "Sony Bravia", "Xiaomi", "TCL", "OnePlus TV", "Hisense"],
    titles: [
      "55 Inch 4K Ultra HD Smart Google TV (Dolby Vision, Dolby Atmos, HDR10+, Bezel-Less)",
      "43 Inch Full HD Bezel-Less Android Smart LED TV with Dual Band WiFi & Voice Remote",
      "65 Inch QLED 120Hz VRR Gaming 4K Smart TV with Hands-Free Far-Field Mic",
      "1080P Full HD Native Smart Android Home Cinema Projector with Auto Keystone"
    ],
    priceRange: [13999, 64999],
    images: photoPools.tv,
    sizes: ["43 Inch 4K", "55 Inch 4K UHD", "65 Inch QLED 120Hz", "Portable Projector"],
    colors: ["Titanium Silver Bezel", "Matte Black Frame"],
    tags: ["tv", "smart tv", "4k tv", "television", "google tv", "android tv", "oled", "qled", "projector", "55 inch", "43 inch", "home theatre"],
    specsGen: (b, t) => ({
      "Screen Resolution": "4K Ultra HD (3840 x 2160 Pixels) 60Hz/120Hz",
      "HDR Support": "Dolby Vision Atmos, HDR10+, HLG",
      "Smart Platform": "Google TV OS with Built-in Chromecast & Play Store",
      "Audio System": "30W Stereo Box Speakers with Dolby Audio",
      "Ports": "3 x HDMI 2.1 (eARC), 2 x USB, Optical, Ethernet, Dual-Band WiFi"
    })
  },

  // 5. CAMERAS & PHOTOGRAPHY
  {
    category: "cameras",
    mainCategory: "Cameras & Photography",
    subCategory: "Mirrorless & DSLR Cameras",
    productType: "4K Mirrorless Camera",
    brands: ["Sony Alpha", "Canon EOS", "Nikon Z", "Fujifilm X", "GoPro", "DJI"],
    titles: [
      "24.2MP 4K HDR Mirrorless Vlogging Camera with 16-50mm Power Zoom Lens (Real-Time Eye AF)",
      "4K60FPS Waterproof Action Camera with Front & Rear Dual Touchscreens & Hypersmooth 6.0",
      "3-Axis Handheld Smartphone & Camera Gimbal Stabilizer with AI Object Tracking",
      "Professional 50mm f/1.8 Large Aperture Prime Portrait Lens for DSLR & Mirrorless"
    ],
    priceRange: [4499, 84999],
    images: photoPools.cameras,
    sizes: ["Body with 16-50mm Lens Kit", "Handheld Portable Gimbal", "50mm Prime Lens"],
    colors: ["Classic Black", "Matte Silver Retro"],
    tags: ["camera", "dslr", "mirrorless", "vlogging camera", "action camera", "gopro", "canon", "sony camera", "lens", "gimbal", "photography", "video"],
    specsGen: (b, t) => ({
      "Sensor Resolution": "24.2 MP APS-C Exmor CMOS Sensor",
      "Video Recording": "4K at 30fps / FHD at 120fps (Unlimited Record)",
      "Autofocus": "425 Phase Detection AF Points with AI Real-Time Eye AF",
      "ISO Range": "ISO 100 - 32,000 (Expandable to 51,200)",
      "Display": "180° Fully Articulating Touchscreen LCD"
    })
  },

  // 6. GAMING GEAR
  {
    category: "gaming",
    mainCategory: "Gaming Gear",
    subCategory: "Gaming Consoles & Peripherals",
    productType: "Esports Gaming Gear",
    brands: ["Sony PlayStation", "Xbox", "Razer", "Logitech G", "Cosmic Byte", "Redragon", "Corsair"],
    titles: [
      "RGB Hot-Swappable Mechanical Gaming Keyboard with Blue Switches & Detachable Cable",
      "Lightweight 65g Honeycomb Ergonomic 16000 DPI Optical Gaming Mouse (Ultra-Weave Cord)",
      "Ergonomic High-Back Reclining Esports Gaming Chair with Lumbar Pillow & Retractable Footrest",
      "Wireless 2.4GHz + Bluetooth Multi-Platform Vibration Gaming Controller for PC & Android"
    ],
    priceRange: [999, 18999],
    images: photoPools.gaming,
    sizes: ["Tenkeyless (TKL)", "Full 104-Key RGB", "Adjustable Gaming Chair", "Ergonomic Handheld"],
    colors: ["Chroma RGB Black", "Cyber White", "Neon Blue-Pink"],
    tags: ["gaming", "game", "mechanical keyboard", "gaming mouse", "controller", "gamepad", "gaming chair", "rgb", "esports", "pc gaming"],
    specsGen: (b, t) => ({
      "Switches / Sensor": "Outemu Blue Mechanical Switches / PMW3389 16K DPI Sensor",
      "Polling Rate & Response": "1000Hz Ultra-Fast 1ms Response Time",
      "RGB Backlight": "16.8 Million Colors Per-Key RGB Customization",
      "Compatibility": "PC, Mac, PlayStation 5, Xbox Series X/S, Android"
    })
  },

  // 7. MEN'S FASHION
  {
    category: "men-fashion",
    mainCategory: "Men's Fashion",
    subCategory: "T-Shirts & Polos",
    productType: "Cotton T-Shirt & Hoodie",
    brands: ["Zara", "H&M", "Levi's", "Puma", "Roadster", "WROGN", "FabIndia"],
    titles: [
      "Streetwear Oversized Drop-Shoulder Graphic Print Pure Cotton T-Shirt",
      "100% Pure Supima Cotton Classic Crew Neck Premium Solid Casual T-Shirt",
      "Heavyweight 350 GSM Fleece Oversized Winter Warm Streetwear Hoodie",
      "Ribbed Collar Cotton Pique Polo T-Shirt with Contrast Tipping"
    ],
    priceRange: [299, 1499],
    images: photoPools.menClothing,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    colors: ["Jet Black", "Crisp White", "Sage Green", "Charcoal Grey", "Burgundy", "Lavender"],
    tags: ["tshirt", "t-shirt", "tee", "hoodie", "men", "clothing", "fashion", "oversized", "cotton", "streetwear", "polo", "casual wear"],
    specsGen: (b, t) => ({
      "Fabric Composition": "100% Combed Bio-Washed Cotton (240 GSM)",
      "Fit Type": "Oversized Relaxed Drop-Shoulder Fit",
      "Neck & Sleeve": "Round Crew Neck | Half Sleeves",
      "Wash Care": "Machine Wash Cold, Do Not Bleach"
    })
  },
  {
    category: "men-fashion",
    mainCategory: "Men's Fashion",
    subCategory: "Casual & Formal Shirts",
    productType: "Formal & Casual Shirt",
    brands: ["Van Heusen", "Peter England", "Arrow", "Louis Philippe", "Allen Solly", "US Polo"],
    titles: [
      "100% Pure Oxford Cotton Slim Fit Casual Full Sleeve Button-Down Shirt",
      "Pure French Linen Spread Collar Relaxed Fit Summer Casual Shirt",
      "Classic Buffalo Plaid Flannel Check Heavy Cotton Shirt",
      "Formal Crisp White Business Dress Shirt with French Cuffs"
    ],
    priceRange: [499, 2199],
    images: photoPools.menClothing,
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"],
    colors: ["Crisp White", "Sky Blue", "Navy Blue", "Olive Khaki", "Wine Red"],
    tags: ["shirt", "men shirt", "formal shirt", "casual shirt", "oxford shirt", "linen shirt", "cotton shirt", "men clothing", "office wear"],
    specsGen: (b, t) => ({
      "Material": "100% Premium Oxford Cotton / Pure Linen",
      "Collar & Cuffs": "Spread Collar with Stiff Fused Cuffs",
      "Pattern & Weave": "Fine Oxford Solid Weave",
      "Occasion": "Business Formal / Smart Casual"
    })
  },
  {
    category: "men-fashion",
    mainCategory: "Men's Fashion",
    subCategory: "Jeans, Cargo & Trousers",
    productType: "Denim Jeans & Cargo Pants",
    brands: ["Levi's", "Wrangler", "Spykar", "Flying Machine", "Jack & Jones"],
    titles: [
      "6-Pocket Tactical Military Cargo Pants with Drawstring Ankle",
      "Relaxed Fit 90s Vintage Wide Leg Baggy Denim Jeans",
      "Comfort Stretch Cotton Chinos Slim Fit Casual Trousers",
      "Heavyweight Tech Fleece Jogger Trackpants with Zip Pockets"
    ],
    priceRange: [599, 2499],
    images: photoPools.menClothing,
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Washed Black", "Light Indigo", "Dark Blue", "Olive Green", "Beige Khaki"],
    tags: ["jeans", "cargo", "cargo pants", "pants", "trousers", "joggers", "trackpants", "bottomwear", "men"],
    specsGen: (b, t) => ({
      "Fabric": "98% Cotton + 2% Elastane Stretch Denim",
      "Waist Rise": "Mid Rise with Durable Belt Loops",
      "Closure": "Heavy Duty Brass Zip Fly & Button",
      "Pockets": "6 Deep Functional Utility Pockets"
    })
  },
  {
    category: "men-fashion",
    mainCategory: "Men's Fashion",
    subCategory: "Ethnic Kurtas & Sherwanis",
    productType: "Men's Ethnic Kurta Set",
    brands: ["Manyavar", "FabIndia", "Sojanya", "Kisah", "Sanwara"],
    titles: [
      "Pure Cotton Lucknowi Chikankari Embroidered Long Kurta with Pyjama Set",
      "Jacquard Silk Wedding Festive Nehru Jacket with Pocket Square",
      "Royal Pathani Suit Set with Mandarin Collar for Weddings & Festivals",
      "Banarasi Brocade Silk Designer Sherwani Indo-Western Groom Set"
    ],
    priceRange: [799, 4999],
    images: photoPools.menClothing,
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "46 (XXL)"],
    colors: ["Royal Cream", "Mustard Yellow", "Maroon Wine", "Pista Green", "Navy Blue"],
    tags: ["kurta", "men kurta", "sherwani", "nehru jacket", "pathani", "ethnic wear", "wedding", "festive", "diwali", "men ethnic"],
    specsGen: (b, t) => ({
      "Fabric": "Pure Mulmul Cotton with Resham Embroidery",
      "Style": "Straight Knee-Length Mandarin Collar Kurta",
      "Bottom Type": "Churidar Pyjama with Drawstring",
      "Occasion": "Festivals, Weddings & Traditional Ceremonies"
    })
  },
  {
    category: "men-fashion",
    mainCategory: "Men's Fashion",
    subCategory: "Footwear & Running Shoes",
    productType: "Sports Running Shoes & Sneakers",
    brands: ["Nike", "Puma", "Adidas", "Red Tape", "Bata", "Sparx", "Woodland"],
    titles: [
      "Ultra-Lightweight Breathable Mesh Sports Running & Walking Shoes with Memory Foam",
      "Classic High-Top Casual Streetwear Chunky Sneakers with Anti-Skid Rubber Sole",
      "Handcrafted Pure Leather Slip-On Formal Loafers for Office & Parties",
      "Cushioned Waterproof Outdoor Hiking & Trail Walking Boots"
    ],
    priceRange: [699, 4999],
    images: photoPools.menClothing,
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: ["Triple White", "Stealth Black", "Navy White", "Olive Brown", "Tan Leather"],
    tags: ["shoes", "running shoes", "sneakers", "footwear", "loafers", "formal shoes", "sports shoes", "boots", "men shoes"],
    specsGen: (b, t) => ({
      "Outer Material": "Engineered Breathable Mesh / High-Grade Vegan Leather",
      "Sole Material": "High-Traction EVA + Anti-Skid Rubber Pods",
      "Insole Cushioning": "Ergonomic Memory Foam Heel Support Insole",
      "Closure": "Adjustable Lace-Up / Easy Slip-On",
      "Weight": "Ultra-Lightweight (280g per shoe)"
    })
  },

  // 8. WOMEN'S FASHION
  {
    category: "women-fashion",
    mainCategory: "Women's Fashion",
    subCategory: "Banarasi & Kanjivaram Sarees",
    productType: "Traditional Silk Saree",
    brands: ["Kalyan Silks", "Sabyasachi Heritage", "Nalli Silks", "Mimosa", "Varkha"],
    titles: [
      "Banarasi Silk Jacquard Woven Rich Zari Saree with Unstitched Blouse Piece",
      "Kanjivaram Traditional Royal Zari Border Silk Saree for Weddings",
      "Bollywood Style Heavy Sequin Georgette Partywear Saree with Border",
      "Floral Printed Organza Lightweight Designer Festive Saree",
      "Pure Paithani Silk Saree with Peacock Motif Contrast Zari Pallu",
      "Chanderi Cotton Handloom Lightweight Daily Wear Printed Saree"
    ],
    priceRange: [499, 4999],
    images: photoPools.womenClothing,
    sizes: ["Free Size (5.5m Saree + 0.8m Blouse)"],
    colors: ["Royal Maroon", "Peacock Green", "Deep Rani Pink", "Mustard Gold", "Navy Blue", "Bottle Green"],
    tags: ["saree", "silk saree", "banarasi", "kanjivaram", "wedding saree", "ethnic", "sari", "festive", "partywear", "women clothing"],
    specsGen: (b, t) => ({
      "Saree Fabric": "Pure Banarasi Art Silk with Gold Zari Weave",
      "Length": "5.5 Meters Saree + 0.8 Meter Blouse Piece",
      "Border & Pallu": "Heavy Floral Brocade Contrast Zari Pallu",
      "Occasion": "Bridal, Wedding Guest, Festivals & Pooja"
    })
  },
  {
    category: "women-fashion",
    mainCategory: "Women's Fashion",
    subCategory: "Anarkali, Kurtis & Suits",
    productType: "Women's Kurta Set",
    brands: ["Biba", "W for Woman", "Aurelia", "Libas", "Jaipur Kurti"],
    titles: [
      "Pure Rayon Heavy Flared Anarkali Kurti with Pant & Organza Dupatta Set",
      "Lucknowi Hand Chikankari Georgette Kurta with Inner & Cotton Pant",
      "Alia Cut Embroidered V-Neck Pure Cotton Floral Printed Kurta Set",
      "Nayra Cut Heavy Zari Work Festive Partywear Kurta Pant Set",
      "Jaipuri Hand Block Print 100% Mulmul Cotton Straight Kurta Set"
    ],
    priceRange: [499, 2999],
    images: photoPools.womenClothing,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    colors: ["Sky Blue", "Mustard Yellow", "Sage Green", "Peach Pink", "Lavender", "Wine"],
    tags: ["kurti", "kurta set", "anarkali", "chikankari", "suit", "dupatta", "women ethnic", "festive", "office wear"],
    specsGen: (b, t) => ({
      "Fabric Details": "100% Pure Heavy Viscose Rayon / Mulmul Cotton",
      "Set Includes": "1 Kurti + 1 Trousers + 1 Chiffon/Organza Dupatta",
      "Work & Ornamentation": "Gota Patti Lace & Resham Thread Work",
      "Sleeve & Length": "3/4th Sleeves | Calf Length Flared Hem"
    })
  },

  // 9. BEAUTY & PERSONAL CARE
  {
    category: "beauty-care",
    mainCategory: "Beauty & Personal Care",
    subCategory: "Skincare Serums & Sunscreens",
    productType: "Face Serum & Sunscreen",
    brands: ["Minimalist", "The Derma Co", "Plum", "Mamaearth", "Dot & Key", "Neutrogena"],
    titles: [
      "10% Vitamin C + Hyaluronic Acid Radiance Glowing Face Serum (30ml)",
      "2% Salicylic Acid Anti-Acne Oil-Control Gentle Face Cleanser (100ml)",
      "Ultra-Lightweight Invisible SPF 50+ PA++++ Sunscreen Gel (50g)",
      "Hydro-Boost Hyaluronic Acid 72H Deep Hydrating Water Gel Moisturizer"
    ],
    priceRange: [249, 999],
    images: photoPools.beauty,
    sizes: ["30ml Dropper", "50g Tube", "100ml Pump", "150ml Cleanser"],
    colors: ["Clear Gel", "Natural Glow"],
    tags: ["serum", "vitamin c", "sunscreen", "skincare", "face wash", "moisturizer", "acne", "glow", "beauty", "cosmetics"],
    specsGen: (b, t) => ({
      "Key Active Ingredients": "10% Ethyl Ascorbic Acid + 1% Hyaluronic Acid",
      "Skin Type": "Suitable for All Skin Types (Dermatologically Tested)",
      "Benefits": "Brightens Dark Spots, Evens Skin Tone & Boosts Glow",
      "Formulation": "Fragrance-Free, Non-Comedogenic, Vegan & Cruelty-Free"
    })
  },
  {
    category: "beauty-care",
    mainCategory: "Beauty & Personal Care",
    subCategory: "Grooming & Trimmers",
    productType: "Beard Trimmer & Shaver",
    brands: ["Philips", "Braun", "Havells", "Nova", "Beardo", "Bombay Shaving Co"],
    titles: [
      "All-in-One Professional Cordless Beard Trimmer & Hair Clipper (Titanium Blades, 120M Run)",
      "2-in-1 Tourmaline Ceramic Hair Straightener & Curler with Fast 15s PTC Heat",
      "Multi-Grooming 7-in-1 Waterproof Electric Shaver & Nose Hair Trimmer Kit",
      "Salon Grade 2000W Ionic Fast-Drying Blow Hair Dryer with Diffuser Nozzle"
    ],
    priceRange: [499, 2999],
    images: photoPools.beauty,
    sizes: ["Type-C Rechargeable", "Corded / Cordless Multi-Length"],
    colors: ["Vintage Carved Bronze", "Rose Gold & Matte Black", "Midnight Blue"],
    tags: ["trimmer", "beard trimmer", "shaver", "hair dryer", "hair straightener", "grooming", "curler", "beauty", "clipper"],
    specsGen: (b, t) => ({
      "Blade Material": "Self-Sharpening Titanium Coated T-Blades",
      "Battery & Runtime": "Li-Ion Battery with 120 Minutes Continuous Run",
      "Length Settings": "20 Precision Length Settings (0.5mm to 10mm)",
      "Charging": "Fast Type-C USB Charging (Full Charge in 90 Mins)"
    })
  },

  // 10. FRAGRANCES & PERFUMES
  {
    category: "fragrances",
    mainCategory: "Fragrances & Perfumes",
    subCategory: "Luxury EDP Perfumes & Attars",
    productType: "Long-Lasting EDP Perfume",
    brands: ["Bella Vita", "Ajmal", "Rasasi", "Armaf", "The Man Company", "Davidoff", "Ustraa"],
    titles: [
      "Luxury Royal Oud & Amber Wood 100ml Eau De Parfum (EDP) 24H Long-Lasting Scent",
      "French Vanilla & Madagascan Orchid 100ml Eau De Parfum (EDP) for Women",
      "Fresh Oceanic Citrus & Sea Salt 100ml Eau De Parfum Long-Stay Perfume for Men",
      "Traditional Pure Roll-On Attar Concentrated Perfume Oil 12ml (Alcohol-Free)",
      "Velvet Rose & Smoky Patchouli Luxury Unisex Extrait De Parfum (100ml)"
    ],
    priceRange: [299, 2499],
    images: photoPools.fragrances,
    sizes: ["100ml Spray EDP", "50ml Pocket EDP", "12ml Roll-On Attar"],
    colors: ["Crystal Amber Glass", "Ocean Azure Blue", "Blush Pink", "Royal Golden"],
    tags: ["perfume", "fragrance", "oud", "attar", "cologne", "edp", "scent", "men perfume", "women perfume", "luxury scent", "perfumes"],
    specsGen: (b, t) => ({
      "Fragrance Concentration": "Eau De Parfum (25% High Oil Concentration)",
      "Top Notes": "Cardamom, Bergamot, Pink Pepper",
      "Middle / Heart Notes": "Smoky Oud, Damask Rose, Amberwood",
      "Base Notes": "Vanilla, Sandalwood, Tonka Bean, Leather",
      "Longevity & Sillage": "18-24 Hours Lasting with Strong Sillage Projection"
    })
  },

  // 11. FITNESS & SPORTS
  {
    category: "fitness-sports",
    mainCategory: "Fitness & Sports",
    subCategory: "Gym Equipment & Dumbbells",
    productType: "Solid Iron Dumbbells & Gym Gear",
    brands: ["Decathlon", "Cultsport", "Boldfit", "Cosco", "Yonex", "Nivia", "Kobo"],
    titles: [
      "Adjustable PVC Coated Solid Iron Dumbbells Set with Connecting Extension Rod",
      "FIFA Pro Stitched All-Weather Size 5 High-Bounce Match Football with Pump",
      "Deep Tissue Percussion Muscle Massage Gun with 6 Speed Heads & LCD Display",
      "High-Density 6mm Anti-Tear Dual-Color TPE Yoga Mat with Body Alignment Lines",
      "High-Speed Ball Bearing Adjustable Steel Wire Skipping Jump Rope for Cardio",
      "Full Carbon Fiber Lightweight Badminton Racket Set with 3 Feather Shuttlecocks",
      "Premium English Willow Cricket Bat Full Size Short Handle with Cover",
      "700ml Leakproof Gym Protein Shaker Bottle with Wire Whisk Ball & Storage Jar",
      "Heavy Duty Fabric Resistance Loop Bands for Legs & Glutes (Set of 3)"
    ],
    priceRange: [199, 3999],
    images: photoPools.fitness,
    sizes: ["Size 5 (Standard)", "10kg / 20kg Set", "6mm Thick (72x24 Inch)", "700ml Bottle", "Set of 3"],
    colors: ["Stealth Black", "Neon Green", "Royal Blue", "Crimson Red", "White & Black Football"],
    tags: ["gym", "fitness", "workout", "dumbbells", "dumble", "football", "soccer", "cricket", "yoga mat", "massage gun", "skipping rope", "badminton", "exercise", "protein shaker", "sports"],
    specsGen: (b, t) => ({
      "Material": "Heavy-Duty Cast Iron with Anti-Roll PVC Coating",
      "Grip & Ergonomics": "Diamond Textured Non-Slip Chrome Handle",
      "Connecting Rod": "Cushioned 40cm Extension Rod (Converts into Barbell)",
      "Included Plates": "Configurable Weight Plates with Double Star Locks"
    })
  },

  // 12. HOME & KITCHEN APPLIANCES
  {
    category: "home-kitchen",
    mainCategory: "Home & Kitchen Appliances",
    subCategory: "Kitchen & Home Appliances",
    productType: "Air Fryer & Kitchen Appliance",
    brands: ["Philips", "Prestige", "Havells", "Morphy Richards", "Nutribullet", "Pigeon", "Bajaj"],
    titles: [
      "5.5L Digital Touchscreen Air Fryer (1500W, Rapid 360° Air Circulation, 8 Presets)",
      "1000W High-Speed Nutri-Blender & Smoothie Maker with 3 Tritan Unbreakable Jars",
      "Smart 2-in-1 Robotic Vacuum Cleaner with Laser LiDAR Navigation & Wet Mopping",
      "1.8L Double-Wall Cool-Touch Stainless Steel Fast Boil Electric Glass Kettle",
      "Automatic High-Pressure Espresso & Cappuccino Coffee Machine with Milk Frother",
      "2000W Smart Push-Button Induction Cooktop with Indian Preset Cooking Menus",
      "Non-Stick Granite Cookware Set of 3 (Fry Pan, Kadhai, Dosa Tawa)"
    ],
    priceRange: [499, 14999],
    images: photoPools.kitchen,
    sizes: ["5.5L Capacity", "1.8L Fast Boil", "1000W Heavy Duty", "Set of 3 Cookware"],
    colors: ["Piano Gloss Black", "Metallic Silver", "Matte Red", "Stainless Steel"],
    tags: ["air fryer", "blender", "kitchen appliance", "coffee machine", "kettle", "induction", "mixer", "juicer", "vacuum cleaner", "cookware", "kitchen"],
    specsGen: (b, t) => ({
      "Capacity & Power": "5.5 Liters Basket | 1500W High Efficiency Coil",
      "Technology": "Rapid 360° Hot Air Circulation (90% Less Oil Cooking)",
      "Preset Modes": "8 One-Touch Presets (Fries, Chicken, Bake, Roast, Fish)",
      "Safety & Cleaning": "Auto Shut-Off, Cool-Touch Handle, Dishwasher Safe Basket"
    })
  },

  // 13. FURNITURE
  {
    category: "furniture",
    mainCategory: "Furniture",
    subCategory: "Ergonomic Chairs & Study Desks",
    productType: "Office & Study Furniture",
    brands: ["Wakefit", "Green Soul", "Sleepyhead", "Godrej Interio", "Nilkamal", "Ikea"],
    titles: [
      "High-Back Ergonomic Breathable Mesh Office Chair with 2D Adjustable Lumbar Support",
      "Solid Sheesham Wood Study & Computer Desk with Storage Drawers & Cable Grommet",
      "Orthopedic Memory Foam 6-Inch King Size Dual Comfort Mattress (78x72 Inch)",
      "Modern 3-Seater Fabric Sofa with High-Density Foam Cushions & Wooden Legs"
    ],
    priceRange: [3499, 28999],
    images: photoPools.furniture,
    sizes: ["King Size (78x72 Inch)", "Study Table (120x60cm)", "High-Back Chair", "3-Seater Sofa"],
    colors: ["Charcoal Grey", "Walnut Brown", "Navy Blue", "Oak Wood Finish"],
    tags: ["furniture", "chair", "office chair", "study table", "desk", "mattress", "sofa", "bed", "ergonomic chair", "home furniture"],
    specsGen: (b, t) => ({
      "Material": "Engineered Wood / Breathable Korean Mesh / Sheesham",
      "Mechanism": "Class-4 Gas Lift Tilt Mechanism with Synchro Multi-Lock",
      "Weight Capacity": "Tested up to 135 kg Heavy Load Support",
      "Warranty": "3 Years Comprehensive On-Site Brand Warranty"
    })
  },

  // 14. HOME DECOR & FURNISHING
  {
    category: "home-decor",
    mainCategory: "Home Decor & Furnishing",
    subCategory: "Bedsheets, Curtains & Lamps",
    productType: "Home Decor & Furnishing",
    brands: ["D'Decor", "Bombay Dyeing", "Home Centre", "Chumbak", "Spaces", "Story@Home"],
    titles: [
      "100% Glace Cotton King Size 3D Floral Printed Bedsheet with 2 Pillow Covers",
      "Luxury Velvet Blackout Thermal Insulated Eyelet Curtains (Pack of 2 - 7 Feet)",
      "500ml Ultrasonic Essential Oil Aroma Diffuser & Cool Mist Humidifier with 7 LED Colors",
      "Modern Abstract Canvas Wall Art Painting with Wooden Frame (Set of 3)",
      "Super Soft Microfiber All-Season Reversible AC Comforter Blanket"
    ],
    priceRange: [299, 2499],
    images: photoPools.decor,
    sizes: ["King Size (90x100 Inch)", "7 Feet Door (Pack of 2)", "Set of 3 Panels", "500ml Diffuser"],
    colors: ["Floral Navy", "Royal Maroon", "Grey Geometric", "Warm Amber", "Gold Texture"],
    tags: ["bedsheet", "curtains", "diffuser", "wall art", "comforter", "home decor", "cushions", "home furnishing", "blanket", "lamps"],
    specsGen: (b, t) => ({
      "Fabric / Material": "100% Pure Glace Cotton (300 Thread Count)",
      "Package Contents": "1 King Fitted Bedsheet + 2 Matching Flap Pillow Covers",
      "Features": "Anti-Fading Color Lock Technology, Shrink Resistant",
      "Wash Care": "Machine Wash Warm, Tumble Dry Gentle"
    })
  },

  // 15. BOOKS & EDUCATION
  {
    category: "books-education",
    mainCategory: "Books & Education",
    subCategory: "DSA & Programming Books",
    productType: "Computer Science & Self-Help Book",
    brands: ["O'Reilly Media", "Pearson", "McGraw Hill", "Penguin Books", "MIT Press", "Arihant"],
    titles: [
      "Cracking the Coding Interview: 189 Programming Questions & Solutions",
      "Introduction to Algorithms (CLRS 4th Edition) Comprehensive DSA Reference Guide",
      "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      "System Design Interview: An Insider's Guide for Software Engineers & Developers"
    ],
    priceRange: [199, 1499],
    images: photoPools.books,
    sizes: ["Paperback Edition", "Hardcover Deluxe", "Kindle Compatible"],
    colors: ["Classic Edition", "Deluxe Cover"],
    tags: ["books", "dsa", "coding book", "algorithms", "programming", "system design", "atomic habits", "education", "competitive exams", "stationery"],
    specsGen: (b, t) => ({
      "Language & Format": "English | Paperback High-Quality Print",
      "Publisher & Edition": "O'Reilly / Pearson Latest Revised Edition",
      "Target Audience": "Software Engineers, Students & Competitive Programmers",
      "Pages Count": "650+ Comprehensive Detailed Pages"
    })
  },

  // 16. AUTOMOTIVE & RIDING GEAR
  {
    category: "automotive",
    mainCategory: "Automotive & Riding Gear",
    subCategory: "Car Accessories & Helmets",
    productType: "Dashcam & Riding Helmet",
    brands: ["Steelbird", "Vega", "Studds", "70mai", "Bosch", "Rynox", "Portronics"],
    titles: [
      "4K Ultra HD Dual Dash Cam with Night Vision & Built-in GPS Wi-Fi App Control",
      "DOT & ISI Certified Aerodynamic Full-Face Motorcycle Helmet with Dual Anti-Scratch Visor",
      "Digital High-Speed Automatic 150 PSI Car Tire Inflator & Air Compressor Pump",
      "Touchscreen Breathable Hard Knuckle Protective Biker Riding Gloves",
      "High Power 120W Portable Handheld Wireless Car Vacuum Cleaner with HEPA Filter",
      "110dB Anti-Theft Alarm Disc Brake Lock for Motorbikes & Scooters"
    ],
    priceRange: [349, 8999],
    images: photoPools.automotive,
    sizes: ["M (58cm)", "L (60cm)", "XL (62cm)", "Universal Portable Fit"],
    colors: ["Stealth Matte Black", "Neon Racing Red", "Carbon Fiber Finish"],
    tags: ["car", "bike", "helmet", "dashcam", "tire inflator", "car vacuum", "biker gloves", "disc lock", "automotive", "riding gear"],
    specsGen: (b, t) => ({
      "Resolution / Rating": "4K UHD Front + 1080P Rear / DOT & ISI Approved",
      "Power Input": "12V Car Cigarette Socket / 6000mAh Battery",
      "Special Features": "G-Sensor Emergency Lock, Loop Recording, Night Vision",
      "Material": "High-Impact ABS Composite Shell & Kevlar Knuckles"
    })
  },

  // 17. TRAVEL & LUGGAGE
  {
    category: "travel-luggage",
    mainCategory: "Travel & Luggage",
    subCategory: "Hardshell Trolleys & Backpacks",
    productType: "Cabin Trolley & Laptop Bag",
    brands: ["American Tourister", "Skybags", "Safari", "Wildcraft", "Mokobara", "Samsonite"],
    titles: [
      "Lightweight Polycarbonate Hard-Shell Cabin Luggage Trolley Bag (TSA Lock, 360° Wheels)",
      "Anti-Theft Water-Resistant 15.6 Inch Laptop Backpack with External USB Charging Port",
      "100% Genuine Vintage Top-Grain Leather Weekend Duffel Gym & Travel Bag",
      "Foldable Ultra-Lightweight Packable Waterproof Travel Backpack 25L"
    ],
    priceRange: [599, 5999],
    images: photoPools.luggage,
    sizes: ["20-Inch Cabin (55cm)", "24-Inch Medium", "28-Inch Large", "35L Laptop Bag"],
    colors: ["Obsidian Black", "Space Grey", "Champagne Gold", "Navy Blue", "Tan Brown"],
    tags: ["trolley", "luggage", "backpack", "laptop bag", "travel bag", "duffel bag", "cabin bag", "suitcases", "travel"],
    specsGen: (b, t) => ({
      "Shell Material": "100% Unbreakable Virgin Polycarbonate Shell",
      "Wheels & Maneuver": "8 Silent 360° Spinner Double Wheels",
      "Security Lock": "Flush-Mounted TSA Combination Number Lock",
      "Compartments": "2 Large Mesh Dividers + Compression Tie-Down Straps"
    })
  },

  // 18. PET SUPPLIES
  {
    category: "pet-supplies",
    mainCategory: "Pet Supplies",
    subCategory: "Dog & Cat Nutrition & Beds",
    productType: "Pet Food & Accessories",
    brands: ["Royal Canin", "Pedigree", "Whiskas", "Drools", "Wahl Pets", "HUFT"],
    titles: [
      "Complete Adult Dog Dry Food (Real Chicken & Vegetables - 3kg Pack)",
      "Ultra-Soft Orthopedic Memory Foam Washable Pet Dog & Cat Bed (Large)",
      "Heavy Duty Retractable Dog Leash with Anti-Tangle 360° Swivel Hook (5M)",
      "Natural Salmon Flavor Crunchy Hairball Control Cat Food (1.2kg)"
    ],
    priceRange: [299, 2499],
    images: photoPools.pets,
    sizes: ["1.2kg Pack", "3kg Pack", "Large Bed (80x60cm)", "5 Meter Leash"],
    colors: ["Brown Plaid", "Grey Velvet", "Vibrant Red"],
    tags: ["pet", "dog food", "cat food", "pet bed", "leash", "pet supplies", "pedigree", "whiskas", "puppy food"],
    specsGen: (b, t) => ({
      "Pet Type & Age": "Adult Dogs (All Breeds 1+ Years)",
      "Nutritional Highlights": "24% Crude Protein, Omega 3 & 6 Fatty Acids",
      "Key Ingredients": "Real Chicken, Whole Grain Cereals, Carrots & Spinach",
      "Special Benefit": "Supports Strong Immunity, Shiny Coat & Healthy Joints"
    })
  },

  // 19. BABY & KIDS
  {
    category: "baby-kids",
    mainCategory: "Baby & Kids",
    subCategory: "Toys, Drones & Baby Gear",
    productType: "RC Toys & Baby Stroller",
    brands: ["FirstCry", "Lego", "Hot Wheels", "Chicco", "Fisher-Price", "Barbie"],
    titles: [
      "High-Speed 4WD 2.4GHz Off-Road Stunt RC Monster Truck with Rechargeable Battery",
      "Foldable HD Dual-Camera Obstacle Avoidance Mini Drone with Optical Flow Positioning",
      "Magnetic 3D Building Blocks & Tiles Educational Brain Construction Toy Set (64 Pcs)",
      "Lightweight One-Hand Compact Fold Baby Stroller & Pram with Multi-Recline"
    ],
    priceRange: [399, 4999],
    images: photoPools.kids,
    sizes: ["Standard Toy Set", "64 Pcs Construction", "Compact Foldable Pram"],
    colors: ["Cyber Neon Orange", "Sky Blue", "Pastel Pink", "Multi-Color"],
    tags: ["toys", "rc car", "drone", "games", "remote control", "kids", "educational toy", "baby stroller", "baby", "children"],
    specsGen: (b, t) => ({
      "Age Recommendation": "Suitable for Children 3 Years and Above",
      "Safety Certification": "100% Non-Toxic BPA-Free EN-71 Safety Certified",
      "Power Source": "Type-C Fast Rechargeable 7.4V Li-Po Battery",
      "Educational Value": "Enhances Spatial Thinking, Problem Solving & Motor Skills"
    })
  },

  // 20. OFFICE & WORKSPACE
  {
    category: "office-workspace",
    mainCategory: "Office & Workspace",
    subCategory: "Printers, Desks & Office Gear",
    brands: ["Epson", "HP", "Logitech", "Featherlite", "Green Soul", "Kangaro"],
    titles: [
      "All-in-One EcoTank Wireless Color Inkjet Printer with WiFi & Auto Duplex",
      "Multi-Angle Heavy-Duty Aluminum Dual Monitor Arm with Gas Spring Mount",
      "Eye-Care LED Architect Desk Lamp with 5 Brightness Levels & USB Charging Port",
      "Cross-Cut High-Security Document & Credit Card Paper Shredder (8-Sheet)"
    ],
    priceRange: [699, 18999],
    images: photoPools.office,
    sizes: ["Dual Monitor Mount", "Compact Desk Printer", "Adjustable Desk Lamp"],
    colors: ["Matte Office Black", "Clean White", "Anodized Silver"],
    tags: ["printer", "office chair", "desk lamp", "monitor arm", "shredder", "office", "workspace", "scanner", "stationery"],
    specsGen: (b, t) => ({
      "Functions": "Print, Scan, Copy with WiFi Direct & Smart App",
      "Print Speed": "33 ppm Black / 15 ppm Color with Low Cost Per Page",
      "Connectivity": "WiFi, USB 2.0, Mobile Cloud Print Compatible"
    })
  },

  // 21. SMART HOME & AUTOMATION
  {
    category: "smart-home",
    mainCategory: "Smart Home & Automation",
    subCategory: "Security Cameras & Smart Plugs",
    productType: "Smart Camera & Home Automation",
    brands: ["TP-Link Tapo", "Qubo", "Wipro", "Philips Hue", "Amazon Echo", "Google Nest"],
    titles: [
      "360° Smart AI Home Security WiFi Camera with 2K Color Night Vision & 2-Way Talk",
      "Smart WiFi 16A Universal Socket Plug with Energy Monitoring & Timer (Alexa/Google)",
      "Smart RGB Ambient WiFi Smart LED Light Strip 5M with Music Sync App Control",
      "Smart Wireless Video Doorbell with 1080P HD Camera & Motion Chime Alert"
    ],
    priceRange: [399, 4999],
    images: photoPools.smartHome,
    sizes: ["Universal Fit Plug", "5 Meter Strip", "360 Dome Camera"],
    colors: ["Clean White", "Matte Space Grey", "Black"],
    tags: ["cctv", "security camera", "wifi camera", "smart home", "smart plug", "smart bulb", "video doorbell", "alexa", "google home", "iot"],
    specsGen: (b, t) => ({
      "Camera Resolution": "2K QHD (2304 x 1296 Pixels) with 360° Pan & 114° Tilt",
      "Night Vision": "Full Color Night Vision up to 30 Feet",
      "Smart Ecosystem": "Works with Amazon Alexa, Google Assistant & Siri",
      "Storage": "Supports up to 512GB MicroSD Card & Secure Cloud"
    })
  },

  // 22. INDUSTRIAL & TOOLS
  {
    category: "industrial-tools",
    mainCategory: "Industrial & Tools",
    subCategory: "Power Drills & Hand Toolkits",
    productType: "Cordless Drill & Toolkit",
    brands: ["Bosch Professional", "Stanley", "Black+Decker", "Taparia", "DeWalt"],
    titles: [
      "Cordless 20V Lithium-Ion Impact Power Drill Machine with 2 Batteries & Charger",
      "108-Piece Heavy Duty Household Hand Tool Kit with Screwdrivers & Hammer",
      "Digital Laser Distance Measure Meter 50M with Real-Time Angle Sensor",
      "Heavy-Duty 850W Angle Grinder with Spindle Lock & Auxiliary Handle"
    ],
    priceRange: [499, 8999],
    images: photoPools.tools,
    sizes: ["20V Drill Kit", "108-Piece Toolbox", "50M Laser Meter"],
    colors: ["Industrial Blue", "Safety Yellow & Black", "Matte Orange"],
    tags: ["tools", "drill machine", "power tools", "screwdriver kit", "toolkit", "measuring tape", "angle grinder", "hardware", "industrial"],
    specsGen: (b, t) => ({
      "Voltage & Power": "20V Max Lithium-Ion Battery (2.0Ah)",
      "Chuck Size & Speed": "10mm Keyless Chuck | 0-1450 RPM Dual Variable Speed",
      "Torque Settings": "18+1 Torque Adjustments with Reverse / Forward Switch",
      "Package Includes": "1 Drill + 2 Batteries + Fast Charger + 24 Bits & Case"
    })
  }
];

const sellers = [
  { name: "Royal Trendz Hub", rating: 4.8, followers: "45.2k", productsCount: 420 },
  { name: "Apex Tech Labs India", rating: 4.9, followers: "68.5k", productsCount: 510 },
  { name: "Shree Ganesh Fashion", rating: 4.6, followers: "32.1k", productsCount: 380 },
  { name: "AeroTech Electronics", rating: 4.9, followers: "92.1k", productsCount: 650 },
  { name: "Vogue Elegance Mumbai", rating: 4.7, followers: "28.4k", productsCount: 290 },
  { name: "Urban Street Wear Delhi", rating: 4.8, followers: "51.0k", productsCount: 340 },
  { name: "Glamour Glow Beauty Co", rating: 4.9, followers: "82.3k", productsCount: 210 },
  { name: "Home Comforts India", rating: 4.7, followers: "19.8k", productsCount: 190 },
  { name: "Heritage Jewellers Jaipur", rating: 4.9, followers: "74.1k", productsCount: 310 },
  { name: "AutoTech Pro Gear", rating: 4.8, followers: "39.6k", productsCount: 260 },
  { name: "FitPro Sports India", rating: 4.9, followers: "56.8k", productsCount: 310 },
  { name: "Maison De Parfum", rating: 4.9, followers: "88.4k", productsCount: 180 },
  { name: "ChefPro Appliances", rating: 4.8, followers: "42.0k", productsCount: 220 },
  { name: "Bosch Industrial Tools Hub", rating: 4.9, followers: "64.2k", productsCount: 340 }
];

export function generate100KProducts() {
  const generated = [];
  const TOTAL_TARGET = 125000; // 1 Lakh 25 Thousand+ complete verified catalog products
  
  // First include handcrafted starter products
  const starter = [
    ...clothingProducts,
    ...electronicsProducts,
    ...homeProducts,
    ...beautyProducts,
    ...jewelleryAndBagsProducts
  ];
  
  starter.forEach(p => generated.push(p));

  // Multi-category generator across all 22 distinct categories
  let counter = starter.length + 1;

  while (generated.length < TOTAL_TARGET) {
    const cycle = Math.floor((counter - starter.length) / categoryTemplates.length);
    const tIndex = (counter - starter.length) % categoryTemplates.length;
    const t = categoryTemplates[tIndex];
    
    const titleBase = t.titles[cycle % t.titles.length];
    const image = t.images[cycle % t.images.length];
    const brand = t.brands[cycle % t.brands.length];
    const seller = sellers[counter % sellers.length];
    
    // Natural price variations within realistic category range
    const minP = t.priceRange[0];
    const maxP = t.priceRange[1];
    const priceStep = 10;
    const priceOffset = ((counter * 73) % (maxP - minP));
    const safePrice = minP + (Math.floor(priceOffset / priceStep) * priceStep);
    const discount = 20 + (counter % 55); // 20% to 75% realistic discount
    const originalPrice = Math.round(safePrice / (1 - (discount / 100)));
    const rating = +(3.8 + ((counter % 12) * 0.1)).toFixed(1);
    const reviewsCount = 120 + ((counter * 47) % 38000);

    const specs = t.specsGen(brand, titleBase);
    const fullTitle = `${brand} ${titleBase} #${(counter % 900) + 100}`;

    const product = {
      id: `prod-${counter}`,
      title: fullTitle,
      brand,
      category: t.category,
      mainCategory: t.mainCategory || t.category,
      subCategory: t.subCategory || "",
      productType: t.productType || "",
      gender: t.gender || "All",
      price: safePrice,
      originalPrice,
      discount,
      rating: rating > 5.0 ? 4.8 : rating,
      reviewsCount,
      images: [
        image,
        t.images[(cycle + 1) % t.images.length],
        t.images[(cycle + 2) % t.images.length]
      ].filter(Boolean),
      sizes: t.sizes || [],
      colors: t.colors || [],
      freeDelivery: true,
      firstOrderDiscount: counter % 2 === 0 ? 50 : 30,
      infinityMall: counter % 3 === 0,
      description: `Authentic ${fullTitle}. Engineered with top-grade materials and verified authentic by ${seller.name}. Features full manufacturer warranty with Free PAN-India Express Delivery and 7-day hassle-free doorstep returns.`,
      fabric: specs["Material"] || specs["Fabric"] || specs["Fabric Composition"] || specs["Shell Material"] || "High-Grade Durable Material",
      specs: {
        "Brand": brand,
        "Manufacturer / Seller": seller.name,
        "Warranty": "1 Year Official Brand Warranty",
        "Country of Origin": "India",
        "Quality Standard": "100% Quality Inspected",
        "Delivery": "Free PAN India Express Delivery",
        ...specs
      },
      seller,
      tags: [
        ...(t.tags || []),
        brand.toLowerCase(),
        t.category,
        (t.subCategory || "").toLowerCase(),
        (t.productType || "").toLowerCase(),
        `style-${counter % 100}`
      ].filter(Boolean)
    };

    generated.push(product);
    counter++;
  }

  return generated;
}
