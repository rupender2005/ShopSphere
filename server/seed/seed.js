const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const { connectDB } = require("../config/db");
const { cloudinary } = require("../config/cloudinary");
const { Category } = require("../models/category.model");
const { Product } = require("../models/product.model");

/* =========================================================
   CONFIG
========================================================= */

const SEED_ROOT = __dirname;

const CATEGORY_IMAGES_DIR = path.join(SEED_ROOT, "images", "categories");

const PRODUCT_IMAGES_DIR = path.join(SEED_ROOT, "images", "products");

const CLOUDINARY_FOLDER = "shopsphere/seed";

/*
 * Change to true only when you deliberately want the seed
 * to continue even when an image is missing.
 *
 * Recommended:
 *
 * false
 *
 * This prevents products from being created without images.
 */
const ALLOW_MISSING_IMAGES = process.env.SEED_ALLOW_MISSING_IMAGES === "true";

/* =========================================================
   CATEGORY DEFINITIONS
========================================================= */

const categoryDefinitions = [
  {
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest smartphones and mobile devices.",
    products: [
      ["iPhone 15", "Apple", 69999],
      ["iPhone 15 Pro", "Apple", 129999],
      ["Galaxy S24", "Samsung", 74999],
      ["Galaxy S24 Ultra", "Samsung", 129999],
      ["OnePlus 13", "OnePlus", 69999],
      ["Pixel 9", "Google", 79999],
      ["Nothing Phone 3", "Nothing", 49999],
      ["Xiaomi 14", "Xiaomi", 59999],
      ["Vivo X100", "Vivo", 62999],
      ["Reno 13 Pro", "Oppo", 49999],
    ],
  },

  {
    name: "Laptops",
    slug: "laptops",
    description: "Laptops for work, study, gaming and creativity.",
    products: [
      ["MacBook Air M3", "Apple", 109999],
      ["MacBook Pro M4", "Apple", 169999],
      ["Inspiron 15", "Dell", 64999],
      ["XPS 13", "Dell", 119999],
      ["Pavilion 14", "HP", 67999],
      ["Victus Gaming 16", "HP", 94999],
      ["IdeaPad Slim 5", "Lenovo", 69999],
      ["Legion 5", "Lenovo", 124999],
      ["ROG Strix G16", "Asus", 139999],
      ["ZenBook 14", "Asus", 89999],
    ],
  },

  {
    name: "Tablets",
    slug: "tablets",
    description: "Tablets for entertainment, work and learning.",
    products: [
      ["iPad 10th Gen", "Apple", 39999],
      ["iPad Air", "Apple", 59999],
      ["iPad Pro", "Apple", 99999],
      ["Galaxy Tab S9", "Samsung", 74999],
      ["Galaxy Tab S9 FE", "Samsung", 44999],
      ["OnePlus Pad 2", "OnePlus", 39999],
      ["Xiaomi Pad 7", "Xiaomi", 29999],
      ["Lenovo Tab P12", "Lenovo", 34999],
      ["Pixel Tablet", "Google", 49999],
      ["MatePad 11", "Huawei", 42999],
    ],
  },

  {
    name: "Headphones & Earbuds",
    slug: "headphones-earbuds",
    description: "Wireless headphones, earbuds and audio accessories.",
    products: [
      ["AirPods Pro", "Apple", 24999],
      ["AirPods Max", "Apple", 59999],
      ["Galaxy Buds 3 Pro", "Samsung", 19999],
      ["WF-1000XM5", "Sony", 23999],
      ["WH-1000XM5", "Sony", 29999],
      ["QuietComfort Ultra", "Bose", 34999],
      ["Nothing Ear", "Nothing", 8999],
      ["OnePlus Buds Pro", "OnePlus", 11999],
      ["JBL Tune 770NC", "JBL", 7999],
      ["Soundcore Liberty 4", "Anker", 9999],
    ],
  },

  {
    name: "Smart Watches",
    slug: "smart-watches",
    description: "Smart watches and fitness wearables.",
    products: [
      ["Apple Watch Series 10", "Apple", 46999],
      ["Apple Watch Ultra 2", "Apple", 89999],
      ["Galaxy Watch 7", "Samsung", 34999],
      ["Galaxy Watch Ultra", "Samsung", 59999],
      ["Pixel Watch 3", "Google", 39999],
      ["OnePlus Watch 2", "OnePlus", 24999],
      ["Watch GT 5", "Huawei", 29999],
      ["Venu 3", "Garmin", 44999],
      ["Versa 4", "Fitbit", 18999],
      ["Charge 6", "Fitbit", 14999],
    ],
  },

  {
    name: "Cameras",
    slug: "cameras",
    description: "Digital cameras, lenses and photography equipment.",
    products: [
      ["EOS R50", "Canon", 69999],
      ["EOS R6 Mark II", "Canon", 169999],
      ["Z50 II", "Nikon", 89999],
      ["Z6 III", "Nikon", 199999],
      ["Alpha A6400", "Sony", 89999],
      ["Alpha A7 IV", "Sony", 189999],
      ["X-T50", "Fujifilm", 149999],
      ["X100VI", "Fujifilm", 159999],
      ["Lumix G9 II", "Panasonic", 149999],
      ["Hero 13", "GoPro", 44999],
    ],
  },

  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming consoles, accessories and equipment.",
    products: [
      ["PlayStation 5 Slim", "Sony", 54999],
      ["PlayStation 5 Pro", "Sony", 79999],
      ["Xbox Series X", "Microsoft", 55999],
      ["Xbox Series S", "Microsoft", 34999],
      ["Nintendo Switch OLED", "Nintendo", 34999],
      ["ROG Ally X", "Asus", 89999],
      ["DualSense Controller", "Sony", 6999],
      ["Xbox Wireless Controller", "Microsoft", 5999],
      ["Gaming Headset G733", "Logitech", 14999],
      ["G502 X Mouse", "Logitech", 11999],
    ],
  },

  {
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "Men's shirts, t-shirts, jeans, jackets and more.",
    products: [
      ["Slim Fit Oxford Shirt", "Levi's", 2499],
      ["Classic Polo T-Shirt", "Puma", 1999],
      ["Essential Cotton T-Shirt", "Adidas", 1499],
      ["Regular Fit Jeans", "Levi's", 2999],
      ["511 Slim Jeans", "Levi's", 3499],
      ["Casual Denim Jacket", "Jack & Jones", 4499],
      ["Linen Casual Shirt", "Van Heusen", 2699],
      ["Formal Shirt", "Allen Solly", 2299],
      ["Cargo Joggers", "Nike", 3999],
      ["Zip Hoodie", "Puma", 3499],
    ],
  },

  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Women's dresses, tops, jeans, kurtas and more.",
    products: [
      ["Floral Midi Dress", "Zara", 3999],
      ["Classic Blazer", "H&M", 4499],
      ["High Rise Jeans", "Levi's", 3299],
      ["Relaxed Fit Jeans", "Only", 2999],
      ["Cotton Kurta", "Biba", 2199],
      ["Printed Kurta Set", "Aurelia", 3499],
      ["Oversized Sweatshirt", "H&M", 2299],
      ["Satin Top", "Zara", 2499],
      ["Summer Maxi Dress", "Mango", 4299],
      ["Wide Leg Trousers", "Vero Moda", 2999],
    ],
  },

  {
    name: "Shoes",
    slug: "shoes",
    description: "Sneakers, running shoes, formal shoes and sandals.",
    products: [
      ["Air Max 270", "Nike", 12999],
      ["Air Force 1", "Nike", 9999],
      ["Ultraboost Light", "Adidas", 13999],
      ["Superstar", "Adidas", 7999],
      ["RS-X Sneakers", "Puma", 6999],
      ["Deviate Nitro", "Puma", 10999],
      ["Fresh Foam 1080", "New Balance", 12999],
      ["574 Classic", "New Balance", 8999],
      ["Classic Leather", "Reebok", 6999],
      ["Chuck 70", "Converse", 7499],
    ],
  },

  {
    name: "Bags & Backpacks",
    slug: "bags-backpacks",
    description: "Backpacks, handbags, laptop bags and travel bags.",
    products: [
      ["Everyday Backpack", "American Tourister", 2499],
      ["Laptop Backpack 25L", "Wildcraft", 2299],
      ["Business Laptop Bag", "Samsonite", 5999],
      ["Urban Backpack", "Puma", 1999],
      ["Leather Office Bag", "Fossil", 8999],
      ["Classic Tote Bag", "Mango", 2999],
      ["Crossbody Bag", "Guess", 4999],
      ["Travel Duffel", "Nike", 3999],
      ["Rolling Cabin Bag", "American Tourister", 4999],
      ["Premium Backpack", "Targus", 4499],
    ],
  },

  {
    name: "Watches & Accessories",
    slug: "watches-accessories",
    description: "Classic watches and stylish accessories.",
    products: [
      ["Analog Classic Watch", "Titan", 5999],
      ["Chronograph Watch", "Fossil", 11999],
      ["Minimalist Watch", "Daniel Wellington", 8999],
      ["Automatic Watch", "Seiko", 24999],
      ["Leather Strap Watch", "Casio", 4999],
      ["Edifice Chronograph", "Casio", 10999],
      ["Classic Gold Watch", "Sonata", 2999],
      ["Metal Bracelet Watch", "Timex", 6999],
      ["Retro Digital Watch", "Casio", 2999],
      ["Premium Steel Watch", "Titan", 13999],
    ],
  },

  {
    name: "Furniture",
    slug: "furniture",
    description: "Furniture for living rooms, bedrooms and offices.",
    products: [
      ["Modern Study Desk", "IKEA", 8999],
      ["Ergonomic Office Chair", "IKEA", 12999],
      ["Three Seater Sofa", "Urban Ladder", 39999],
      ["Wooden Coffee Table", "Wakefit", 6999],
      ["Queen Bed Frame", "Wakefit", 24999],
      ["Bedside Table", "IKEA", 4999],
      ["Bookshelf", "IKEA", 7999],
      ["Dining Table", "Pepperfry", 19999],
      ["TV Unit", "Urban Ladder", 15999],
      ["Recliner Chair", "Wakefit", 22999],
    ],
  },

  {
    name: "Kitchen & Dining",
    slug: "kitchen-dining",
    description: "Cookware, utensils and dining essentials.",
    products: [
      ["Non Stick Cookware Set", "Prestige", 4999],
      ["Pressure Cooker 5L", "Hawkins", 2999],
      ["Air Fryer", "Philips", 8999],
      ["Mixer Grinder", "Bajaj", 4499],
      ["Induction Cooktop", "Prestige", 2499],
      ["Knife Set", "Victorinox", 3999],
      ["Dinner Set 24 Piece", "Corelle", 5999],
      ["Electric Kettle", "Philips", 1999],
      ["Toaster", "Morphy Richards", 2499],
      ["Water Bottle Set", "Milton", 1499],
    ],
  },

  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Decorative items to make your home beautiful.",
    products: [
      ["Decorative Wall Clock", "Homesake", 1999],
      ["Artificial Indoor Plant", "IKEA", 1499],
      ["Decorative Vase", "Homesake", 1299],
      ["Wall Art Set", "Amazon Basics", 2499],
      ["Decorative Mirror", "Homesake", 3499],
      ["Table Decor Set", "Home Centre", 1799],
      ["Cushion Cover Set", "Solimo", 999],
      ["Decorative Candle Set", "Yankee Candle", 1599],
      ["Photo Frame Set", "IKEA", 1299],
      ["Area Rug", "Home Centre", 3999],
    ],
  },

  {
    name: "Lighting",
    slug: "lighting",
    description: "Lamps, bulbs and decorative lighting.",
    products: [
      ["Smart LED Bulb", "Philips", 799],
      ["Smart RGB Bulb", "Wipro", 699],
      ["Desk Lamp", "Philips", 1499],
      ["Floor Lamp", "IKEA", 3499],
      ["Table Lamp", "Wipro", 1299],
      ["LED Strip Light", "Syska", 999],
      ["Ceiling Light", "Philips", 2499],
      ["Decorative Pendant Light", "Home Centre", 2999],
      ["Night Lamp", "Syska", 899],
      ["Reading Lamp", "Philips", 1799],
    ],
  },

  {
    name: "Home Appliances",
    slug: "home-appliances",
    description: "Useful appliances for everyday home life.",
    products: [
      ["Refrigerator 340L", "LG", 49999],
      ["Washing Machine 8KG", "Samsung", 39999],
      ["Microwave Oven", "LG", 10999],
      ["Dishwasher", "Bosch", 44999],
      ["Air Conditioner 1.5T", "Daikin", 47999],
      ["Air Purifier", "Philips", 12999],
      ["Vacuum Cleaner", "Dyson", 39999],
      ["Room Heater", "Bajaj", 2499],
      ["Water Heater 15L", "Racold", 9999],
      ["Robot Vacuum", "Ecovacs", 29999],
    ],
  },

  {
    name: "Skincare",
    slug: "skincare",
    description: "Skincare products for daily personal care.",
    products: [
      ["Vitamin C Serum", "The Ordinary", 1299],
      ["Niacinamide Serum", "The Ordinary", 1199],
      ["Hydrating Moisturizer", "CeraVe", 1699],
      ["Foaming Cleanser", "CeraVe", 1499],
      ["Sunscreen SPF 50", "Minimalist", 699],
      ["Face Wash", "Cetaphil", 549],
      ["Hydrating Toner", "Plum", 499],
      ["Retinol Serum", "Minimalist", 799],
      ["Eye Cream", "Neutrogena", 899],
      ["Body Lotion", "Nivea", 499],
    ],
  },

  {
    name: "Makeup",
    slug: "makeup",
    description: "Makeup and beauty essentials.",
    products: [
      ["Matte Lipstick", "MAC", 2199],
      ["Liquid Foundation", "Maybelline", 999],
      ["Mascara", "Maybelline", 699],
      ["Concealer", "L'Oreal", 899],
      ["Blush Palette", "Maybelline", 799],
      ["Eyeshadow Palette", "Swiss Beauty", 799],
      ["Compact Powder", "Lakme", 499],
      ["Liquid Eyeliner", "Lakme", 399],
      ["Makeup Primer", "Insight", 499],
      ["Highlighter", "MAC", 2499],
    ],
  },

  {
    name: "Hair Care & Fragrances",
    slug: "hair-care-fragrances",
    description: "Hair care products and fragrances.",
    products: [
      ["Repair Shampoo", "L'Oreal", 699],
      ["Hair Conditioner", "Dove", 499],
      ["Hair Serum", "Streax", 499],
      ["Hair Mask", "Mamaearth", 599],
      ["Anti Dandruff Shampoo", "Head & Shoulders", 499],
      ["Eau de Parfum", "Zara", 2499],
      ["Men's Perfume", "Wild Stone", 899],
      ["Women's Perfume", "Ariana Grande", 3999],
      ["Deodorant Spray", "Nivea", 349],
      ["Body Mist", "Victoria's Secret", 2999],
    ],
  },

  {
    name: "Fitness & Gym",
    slug: "fitness-gym",
    description: "Equipment and accessories for fitness enthusiasts.",
    products: [
      ["Yoga Mat", "Boldfit", 799],
      ["Adjustable Dumbbell Set", "Decathlon", 4999],
      ["Resistance Bands", "Boldfit", 699],
      ["Treadmill", "Lifelong", 29999],
      ["Exercise Bike", "Reach", 18999],
      ["Kettlebell 10KG", "Decathlon", 1999],
      ["Gym Gloves", "Nivia", 699],
      ["Foam Roller", "Boldfit", 999],
      ["Skipping Rope", "Decathlon", 499],
      ["Fitness Bench", "Lifelong", 5999],
    ],
  },

  {
    name: "Cricket & Sports",
    slug: "cricket-sports",
    description: "Cricket, football and outdoor sports equipment.",
    products: [
      ["English Willow Bat", "SG", 12999],
      ["Kashmir Willow Bat", "SS", 6999],
      ["Cricket Helmet", "Masuri", 8999],
      ["Cricket Gloves", "SS", 2999],
      ["Football", "Adidas", 1999],
      ["Football Boots", "Nike", 7999],
      ["Basketball", "Spalding", 2499],
      ["Tennis Racket", "Wilson", 8999],
      ["Badminton Racket", "Yonex", 4999],
      ["Table Tennis Set", "Stag", 1999],
    ],
  },

  {
    name: "Books",
    slug: "books",
    description: "Fiction, non-fiction, education and bestsellers.",
    products: [
      ["The Alchemist", "Penguin", 399],
      ["Atomic Habits", "Penguin", 599],
      ["Ikigai", "Penguin", 399],
      ["Rich Dad Poor Dad", "Plata Publishing", 499],
      ["The Psychology of Money", "Harriman House", 499],
      ["The Hobbit", "HarperCollins", 499],
      ["1984", "Penguin", 299],
      ["Harry Potter and the Philosopher's Stone", "Bloomsbury", 599],
      ["Deep Work", "Grand Central", 499],
      ["Think and Grow Rich", "Jaico", 299],
    ],
  },

  {
    name: "Toys & Kids",
    slug: "toys-kids",
    description: "Toys, games and products for kids.",
    products: [
      ["Building Blocks Set", "LEGO", 2999],
      ["Remote Control Car", "Hot Wheels", 1999],
      ["Doll House", "Barbie", 3499],
      ["Barbie Fashion Doll", "Barbie", 1499],
      ["Board Game", "Hasbro", 1299],
      ["Educational Puzzle", "Funskool", 699],
      ["Kids Scooter", "Razor", 3499],
      ["Toy Kitchen Set", "Funskool", 1799],
      ["Stuffed Teddy Bear", "Archies", 999],
      ["Kids Drawing Kit", "Faber-Castell", 599],
    ],
  },

  {
    name: "Groceries & Beverages",
    slug: "groceries-beverages",
    description: "Everyday groceries, snacks and beverages.",
    products: [
      ["Premium Basmati Rice", "India Gate", 799],
      ["Whole Wheat Atta", "Aashirvaad", 499],
      ["Green Tea", "Tetley", 349],
      ["Instant Coffee", "Nescafe", 299],
      ["Breakfast Cereal", "Kellogg's", 399],
      ["Mixed Nuts", "Happilo", 699],
      ["Dark Chocolate", "Cadbury", 199],
      ["Peanut Butter", "MyFitness", 349],
      ["Oats", "Quaker", 199],
      ["Olive Oil", "Figaro", 899],
    ],
  },

  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Jewelry, rings, necklaces and elegant accessories.",
    products: [
      ["Classic Gold Ring", "Tanishq", 24999],
      ["Diamond Pendant", "CaratLane", 49999],
      ["Silver Bracelet", "Mia", 7999],
      ["Pearl Necklace", "Sukkhi", 4999],
      ["Stud Earrings", "Tanishq", 12999],
      ["Gold Chain", "Mia", 34999],
      ["Fashion Necklace", "Sukkhi", 1999],
      ["Diamond Earrings", "CaratLane", 29999],
      ["Charm Bracelet", "Mia", 3999],
      ["Couple Rings", "CaratLane", 9999],
    ],
  },

  {
    name: "Automotive",
    slug: "automotive",
    description: "Automotive accessories and car care products.",
    products: [
      ["Car Dash Camera", "70mai", 7999],
      ["Car Vacuum Cleaner", "Black+Decker", 4999],
      ["Car Phone Holder", "Portronics", 799],
      ["Tyre Inflator", "AGARO", 1999],
      ["Car Air Purifier", "Philips", 3999],
      ["Jump Starter", "Amaron", 4999],
      ["Car Cleaning Kit", "3M", 1499],
      ["Motorcycle Helmet", "Axor", 4999],
      ["Riding Gloves", "Rynox", 1999],
      ["Car Seat Cover", "AutoFurnish", 3999],
    ],
  },

  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    description: "Food, toys and accessories for pets.",
    products: [
      ["Premium Dog Food", "Royal Canin", 2999],
      ["Puppy Food", "Pedigree", 1499],
      ["Cat Food", "Whiskas", 999],
      ["Interactive Dog Toy", "Kong", 1299],
      ["Pet Bed", "Drools", 1999],
      ["Dog Leash", "Wahl", 799],
      ["Cat Litter", "Whiskas", 899],
      ["Pet Grooming Kit", "Havells", 2499],
      ["Water Bowl", "Trixie", 499],
      ["Pet Travel Bag", "Trixie", 2499],
    ],
  },

  {
    name: "Office & Stationery",
    slug: "office-stationery",
    description: "Office products, stationery and study essentials.",
    products: [
      ["Premium Notebook", "Classmate", 199],
      ["Ball Pen Set", "Parker", 499],
      ["Gel Pen Set", "Cello", 199],
      ["Office Backpack", "American Tourister", 2999],
      ["Desk Organizer", "Fellowes", 999],
      ["Stapler", "Kangaro", 199],
      ["Printer", "HP", 8999],
      ["Wireless Keyboard", "Logitech", 1999],
      ["Wireless Mouse", "Logitech", 1299],
      ["Office Chair", "Green Soul", 9999],
    ],
  },

  {
    name: "Travel Gear",
    slug: "travel-gear",
    description: "Luggage, travel accessories and outdoor essentials.",
    products: [
      ["Cabin Trolley", "American Tourister", 4999],
      ["Large Check-In Trolley", "Samsonite", 12999],
      ["Travel Backpack", "Wildcraft", 3999],
      ["Neck Pillow", "Cabeau", 1999],
      ["Packing Cubes", "Amazon Basics", 999],
      ["Travel Adapter", "Portronics", 1499],
      ["Passport Holder", "Fossil", 2999],
      ["Travel Duffel Bag", "Nike", 3999],
      ["Toiletry Bag", "American Tourister", 999],
      ["Camping Tent", "Quechua", 7999],
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/*
 * Escapes regex special characters in a slug so it can be
 * safely dropped into a `new RegExp(...)` pattern.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * Builds a key that uniquely identifies a product across
 * categories, so two products that happen to share a name
 * (in different categories) never collide.
 */
const productKey = (category, productName) =>
  `${category.slug}::${slugify(productName)}`;

const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }
};

const getImageFiles = (directory) => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
      }),
    );
};

const getCategoryImagePath = (category) => {
  const possibleExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  for (const extension of possibleExtensions) {
    const filePath = path.join(
      CATEGORY_IMAGES_DIR,
      `${category.slug}${extension}`,
    );

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
};

/*
 * Matches files named exactly "<product-slug>-<number>.<ext>".
 *
 * FIX: the previous version used `startsWith(productSlug + "-")`,
 * which is a PREFIX match. Because several categories contain
 * products whose names are prefixes of other products in the
 * same category (e.g. "iPhone 15" / "iPhone 15 Pro", or
 * "Galaxy S24" / "Galaxy S24 Ultra"), that prefix match let a
 * file like "iphone-15-pro-1.jpg" get pulled into the image
 * list for "iPhone 15" too. Anchoring the regex with `^` and `$`
 * and requiring the suffix to be purely digits closes that gap:
 * "iphone-15-pro-1" no longer matches "^iphone-15-\d+$".
 */
const getProductImagePaths = (category, productName) => {
  const categoryDirectory = path.join(PRODUCT_IMAGES_DIR, category.slug);

  if (!fs.existsSync(categoryDirectory)) {
    return [];
  }

  const productSlug = slugify(productName);

  const pattern = new RegExp(`^${escapeRegExp(productSlug)}-\\d+$`);

  return getImageFiles(categoryDirectory)
    .filter((file) => pattern.test(slugify(path.parse(file).name)))
    .map((file) => path.join(categoryDirectory, file));
};

/* =========================================================
   CLOUDINARY
========================================================= */

const uploadImageToCloudinary = async ({ filePath, folder, publicId }) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  });

  return result.secure_url;
};

/* =========================================================
   CATEGORY IMAGE UPLOAD
========================================================= */

const uploadCategoryImages = async () => {
  console.log("\nUploading category images...\n");

  const categoryImageUrls = new Map();

  for (const category of categoryDefinitions) {
    const imagePath = getCategoryImagePath(category);

    if (!imagePath) {
      if (ALLOW_MISSING_IMAGES) {
        console.warn(`⚠ Category image missing: ${category.name}`);

        categoryImageUrls.set(category.name, "");

        continue;
      }

      throw new Error(
        `Category image missing for "${category.name}". Expected something like:\n${path.join(
          CATEGORY_IMAGES_DIR,
          `${category.slug}.jpg`,
        )}`,
      );
    }

    console.log(`Uploading category image: ${category.name}`);

    const url = await uploadImageToCloudinary({
      filePath: imagePath,
      folder: `${CLOUDINARY_FOLDER}/categories`,
      publicId: category.slug,
    });

    categoryImageUrls.set(category.name, url);
  }

  return categoryImageUrls;
};

/* =========================================================
   PRODUCT IMAGE UPLOAD
========================================================= */

const uploadProductImages = async () => {
  console.log("\nUploading product images...\n");

  // FIX: keyed by `category.slug::productSlug` instead of bare
  // product name, so products with the same name in different
  // categories can never overwrite each other's image list.
  const productImageMap = new Map();

  for (const category of categoryDefinitions) {
    for (const [productName] of category.products) {
      const imagePaths = getProductImagePaths(category, productName);

      const key = productKey(category, productName);

      if (imagePaths.length === 0) {
        if (ALLOW_MISSING_IMAGES) {
          console.warn(`⚠ Product images missing: ${productName}`);

          productImageMap.set(key, []);

          continue;
        }

        throw new Error(
          `Product images missing for "${productName}".\nExpected folder:\n${path.join(
            PRODUCT_IMAGES_DIR,
            category.slug,
          )}\n\nExpected filenames like:\n${slugify(productName)}-1.jpg`,
        );
      }

      const urls = [];

      for (const imagePath of imagePaths) {
        const extensionlessName = path.parse(imagePath).name;

        console.log(
          `Uploading: ${category.name} → ${path.basename(imagePath)}`,
        );

        const url = await uploadImageToCloudinary({
          filePath: imagePath,
          folder: `${CLOUDINARY_FOLDER}/products/${category.slug}/${slugify(
            productName,
          )}`,
          publicId: extensionlessName,
        });

        urls.push(url);
      }

      productImageMap.set(key, urls);
    }
  }

  return productImageMap;
};

/* =========================================================
   CATEGORY DATABASE
========================================================= */

const seedCategories = async (categoryImageUrls) => {
  console.log("\nSeeding categories...\n");

  const operations = categoryDefinitions.map((category) => ({
    updateOne: {
      filter: {
        name: category.name,
      },

      update: {
        $set: {
          name: category.name,

          description: category.description,

          image: categoryImageUrls.get(category.name) || "",

          isActive: true,
        },
      },

      upsert: true,
    },
  }));

  const result = await Category.bulkWrite(operations, {
    ordered: true,
  });

  console.log(`Categories inserted: ${result.upsertedCount}`);

  console.log(`Categories modified: ${result.modifiedCount}`);

  const savedCategories = await Category.find({
    name: {
      $in: categoryDefinitions.map((category) => category.name),
    },
  });

  return new Map(
    savedCategories.map((category) => [category.name, category._id]),
  );
};

/* =========================================================
   PRODUCT DATABASE
========================================================= */

const seedProducts = async ({ categoryMap, productImageMap }) => {
  console.log("\nPreparing products...\n");

  const operations = [];

  let productNumber = 0;

  for (const category of categoryDefinitions) {
    const categoryId = categoryMap.get(category.name);

    if (!categoryId) {
      throw new Error(`Category not found: ${category.name}`);
    }

    for (let index = 0; index < category.products.length; index++) {
      const [name, brand, price] = category.products[index];

      productNumber++;

      const images = productImageMap.get(productKey(category, name)) || [];

      const discountPercent = [5, 8, 10, 12, 15, 18][index % 6];

      const discountPrice = Math.round((price * (100 - discountPercent)) / 100);

      const rating = Number((4 + (index % 10) / 10).toFixed(1));

      const numReviews = 20 + index * 17;

      const description =
        `${name} by ${brand}. ` +
        `A premium ${category.name.toLowerCase()} ` +
        `product designed for everyday use. ` +
        `Shop quality products on ShopSphere ` +
        `with reliable stock availability and ` +
        `competitive pricing.`;

      operations.push({
        updateOne: {
          // FIX: scoped by category as well as name, so a product
          // name that happens to repeat in another category is
          // never merged into/overwritten by that other product.
          filter: {
            name,
            category: categoryId,
          },

          update: {
            $set: {
              name,

              description,

              price,

              discountPrice,

              stock: 15 + index * 7,

              category: categoryId,

              brand,

              images,

              thumbnail: images[0] || "",

              rating: Math.min(rating, 5),

              numReviews,

              isFeatured: index < 3,

              isActive: true,
            },
          },

          upsert: true,
        },
      });
    }
  }

  console.log(`Total products prepared: ${productNumber}`);

  const result = await Product.bulkWrite(operations, {
    ordered: false,
  });

  console.log(`Products inserted: ${result.upsertedCount}`);

  console.log(`Products modified: ${result.modifiedCount}`);
};

/* =========================================================
   VALIDATION
========================================================= */

const validateImageFolders = () => {
  const errors = [];

  for (const category of categoryDefinitions) {
    const categoryImage = getCategoryImagePath(category);

    if (!categoryImage && !ALLOW_MISSING_IMAGES) {
      errors.push(`Missing category image: ${category.name}`);
    }

    for (const [productName] of category.products) {
      const productImages = getProductImagePaths(category, productName);

      if (productImages.length === 0 && !ALLOW_MISSING_IMAGES) {
        errors.push(`Missing product image: ${category.name} → ${productName}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("\nImage validation failed:\n");

    for (const error of errors) {
      console.error(`✗ ${error}`);
    }

    throw new Error(`Missing ${errors.length} image requirement(s).`);
  }
};

/* =========================================================
   MAIN
========================================================= */

const seedDatabase = async () => {
  try {
    console.log("\n========================================");

    console.log("       ShopSphere Database Seed");

    console.log("========================================\n");

    ensureDirectory(CATEGORY_IMAGES_DIR);

    ensureDirectory(PRODUCT_IMAGES_DIR);

    console.log("Validating local image files...");

    validateImageFolders();

    console.log("Image validation passed.");

    console.log("\nConnecting to MongoDB...");

    await connectDB();

    console.log("Checking Cloudinary configuration...");

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary credentials are missing. Check server/.env.");
    }

    console.log("Cloudinary configuration found.");

    /*
     * Upload category images first.
     */
    const categoryImageUrls = await uploadCategoryImages();

    /*
     * Upload every product image.
     */
    const productImageMap = await uploadProductImages();

    /*
     * Create/update categories.
     */
    const categoryMap = await seedCategories(categoryImageUrls);

    /*
     * Create/update products.
     */
    await seedProducts({
      categoryMap,
      productImageMap,
    });

    /*
     * Final counts.
     */
    const categoryNames = categoryDefinitions.map((category) => category.name);

    const productNames = categoryDefinitions.flatMap((category) =>
      category.products.map(([name]) => name),
    );

    const totalCategories = await Category.countDocuments({
      name: {
        $in: categoryNames,
      },
    });

    const totalProducts = await Product.countDocuments({
      name: {
        $in: productNames,
      },
    });

    console.log("\n========================================");

    console.log("     ShopSphere Seed Completed");

    console.log("========================================");

    console.log(`Categories: ${totalCategories}`);

    console.log(`Products:   ${totalProducts}`);

    console.log("Images:     Uploaded to Cloudinary");

    console.log("========================================\n");
  } catch (error) {
    console.error("\n========================================");

    console.error("        ShopSphere Seed Failed");

    console.error("========================================\n");

    console.error(error.message);

    console.error(
      "\nNo partial recovery should be assumed. " +
        "Check the missing image/configuration above " +
        "and run npm run seed again.\n",
    );

    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch (error) {
      // Ignore connection-close errors.
    }
  }
};

/*
 * Only run the seed automatically when this file is executed
 * directly (`node seed.js` / `npm run seed`). This lets other
 * scripts (e.g. generate-images.js) `require("./seed.js")` to
 * reuse categoryDefinitions/slugify without accidentally
 * triggering a full database seed as a side effect.
 */
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  categoryDefinitions,
  slugify,
  escapeRegExp,
  productKey,
};
