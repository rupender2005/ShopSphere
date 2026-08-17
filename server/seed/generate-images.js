/*
 * generate-images.js
 * ---------------------------------------------------------
 * Fills every folder under:
 * server/seed/images/products/<category>/
 *
 * Every missing product image is downloaded from Pexels.
 * No generated text-image placeholders are created.
 *
 * Strategy:
 *   - Existing images are kept untouched.
 *   - Missing product images are searched on Pexels.
 *   - Search starts with brand + product name.
 *   - Falls back to product + category.
 *   - Final fallback is category search.
 *
 * Category banners also use real Pexels photos.
 *
 * SETUP:
 *   1. npm install sharp        (inside server/)
 *   2. Add to server/.env:
 *        PEXELS_API_KEY=your_key_here
 *   3. Run from server/seed/:
 *        node generate-images.js
 *   4. Then run your normal seed:
 *        node seed.js
 * ---------------------------------------------------------
 */

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const { categoryDefinitions, slugify } = require("./seed.js");

/* =========================================================
   CONFIG
========================================================= */

const PRODUCT_IMAGES_DIR = path.join(__dirname, "images", "products");

const CATEGORY_IMAGES_DIR = path.join(__dirname, "images", "categories");

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

const REQUEST_DELAY_MS = 400;

/*
 * Generic fallback search terms per category.
 */
const CATEGORY_SEARCH_TERMS = {
  smartphones: "smartphone",
  laptops: "laptop computer",
  tablets: "tablet device",
  "headphones-earbuds": "wireless headphones",
  "smart-watches": "smartwatch",
  cameras: "camera photography",
  gaming: "gaming controller",
  "mens-clothing": "men fashion clothing",
  "womens-clothing": "women fashion clothing",
  shoes: "sneakers shoes",
  "bags-backpacks": "backpack bag",
  "watches-accessories": "wrist watch",
  furniture: "furniture interior",
  "kitchen-dining": "kitchenware",
  "home-decor": "home decor",
  lighting: "lamp lighting",
  "home-appliances": "home appliance",
  skincare: "skincare cosmetics",
  makeup: "makeup cosmetics",
  "hair-care-fragrances": "perfume fragrance",
  "fitness-gym": "gym fitness equipment",
  "cricket-sports": "sports equipment",
  books: "books stack",
  "toys-kids": "kids toys",
  "groceries-beverages": "grocery food",
  jewelry: "jewelry accessories",
  automotive: "car accessories",
  "pet-supplies": "pet supplies",
  "office-stationery": "office stationery",
  "travel-gear": "travel luggage",
};

/* =========================================================
   HELPERS
========================================================= */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hasExistingImage = (dir, slug) => {
  if (!fs.existsSync(dir)) return false;

  const pattern = new RegExp(`^${slug}-1\\.(jpg|jpeg|png|webp)$`, "i");

  return fs.readdirSync(dir).some((file) => pattern.test(file));
};

const hasExistingCategoryImage = (slug) => {
  if (!fs.existsSync(CATEGORY_IMAGES_DIR)) {
    return false;
  }

  const pattern = new RegExp(`^${slug}\\.(jpg|jpeg|png|webp)$`, "i");

  return fs.readdirSync(CATEGORY_IMAGES_DIR).some((file) => pattern.test(file));
};

/* =========================================================
   PEXELS
========================================================= */

const fetchPexelsPhotos = async (query, count = 1, orientation = "square") => {
  if (!PEXELS_API_KEY) {
    throw new Error("PEXELS_API_KEY is missing from server/.env");
  }

  const url =
    `https://api.pexels.com/v1/search` +
    `?query=${encodeURIComponent(query)}` +
    `&per_page=${count}` +
    `&orientation=${orientation}`;

  const response = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels request failed (${response.status}) for "${query}"`,
    );
  }

  const data = await response.json();

  return data.photos || [];
};

const downloadImage = async (url, outPath) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(outPath, buffer);
};

const getPhotoUrl = (photo) => {
  return (
    photo?.src?.large2x || photo?.src?.large || photo?.src?.original || null
  );
};

/* =========================================================
   PRODUCT SEARCH
========================================================= */

const getProductSearchQueries = (name, brand, category) => {
  const categoryTerm = CATEGORY_SEARCH_TERMS[category] || category;

  return [
    `${brand || ""} ${name || ""}`.trim(),
    `${name || ""} ${categoryTerm}`.trim(),
    categoryTerm,
  ].filter(Boolean);
};

const findRealProductPhoto = async (name, brand, category) => {
  const queries = getProductSearchQueries(name, brand, category);

  for (const query of queries) {
    try {
      const photos = await fetchPexelsPhotos(query, 5, "square");

      if (photos.length) {
        const usablePhoto = photos.find((photo) => getPhotoUrl(photo));

        if (usablePhoto) {
          return {
            url: getPhotoUrl(usablePhoto),
            photographer: usablePhoto.photographer || "Unknown",
            pexelsUrl: usablePhoto.url || null,
          };
        }
      }

      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      console.warn(`⚠ ${error.message}`);
    }
  }

  return null;
};

const findRealCategoryPhoto = async (categorySlug, categoryName) => {
  const query = CATEGORY_SEARCH_TERMS[categorySlug] || categoryName;

  try {
    const photos = await fetchPexelsPhotos(query, 5, "landscape");

    const photo = photos.find((item) => getPhotoUrl(item));

    if (!photo) {
      return null;
    }

    return {
      url: getPhotoUrl(photo),
      photographer: photo.photographer || "Unknown",
      pexelsUrl: photo.url || null,
    };
  } catch (error) {
    console.warn(`⚠ ${error.message}`);

    return null;
  }
};

/* =========================================================
   MAIN
========================================================= */

const run = async () => {
  console.log("\n========================================");
  console.log("   ShopSphere Real Image Generator");
  console.log("========================================\n");

  if (!PEXELS_API_KEY) {
    console.error("✖ PEXELS_API_KEY not found in server/.env");

    console.error("  Add PEXELS_API_KEY before running this script.\n");

    process.exitCode = 1;
    return;
  }

  let productDownloaded = 0;
  let productSkipped = 0;
  let productFailed = 0;

  let categoryDownloaded = 0;
  let categorySkipped = 0;
  let categoryFailed = 0;

  /* ---------------------------------------------------------
     PASS 1: CATEGORY BANNERS
  --------------------------------------------------------- */

  console.log("--- Category banners ---\n");

  fs.mkdirSync(CATEGORY_IMAGES_DIR, {
    recursive: true,
  });

  for (const category of categoryDefinitions) {
    if (hasExistingCategoryImage(category.slug)) {
      console.log(`✓ Already exists: ${category.name}`);

      categorySkipped++;
      continue;
    }

    try {
      const photo = await findRealCategoryPhoto(category.slug, category.name);

      if (!photo?.url) {
        console.log(`✖ No real photo found: ${category.name}`);

        categoryFailed++;
        continue;
      }

      const outPath = path.join(CATEGORY_IMAGES_DIR, `${category.slug}.jpg`);

      console.log(`↓ Downloading: ${category.name}`);

      await downloadImage(photo.url, outPath);

      console.log(`✓ Saved: ${category.name}`);

      categoryDownloaded++;

      await sleep(REQUEST_DELAY_MS);
    } catch (error) {
      console.error(`✖ Failed: ${category.name} → ${error.message}`);

      categoryFailed++;
    }
  }

  /* ---------------------------------------------------------
     PASS 2: PRODUCT IMAGES
  --------------------------------------------------------- */

  console.log("\n--- Product images ---\n");

  for (const category of categoryDefinitions) {
    const dir = path.join(PRODUCT_IMAGES_DIR, category.slug);

    fs.mkdirSync(dir, {
      recursive: true,
    });

    console.log(`\n[ ${category.name} ]`);

    for (const [name, brand] of category.products) {
      const slug = slugify(name);

      if (hasExistingImage(dir, slug)) {
        console.log(`  ✓ Already exists → ${name}`);

        productSkipped++;
        continue;
      }

      try {
        console.log(`  🔎 Searching → ${brand} ${name}`);

        const photo = await findRealProductPhoto(name, brand, category.slug);

        if (!photo?.url) {
          console.log(`  ✖ No real photo found → ${name}`);

          productFailed++;
          continue;
        }

        const outPath = path.join(dir, `${slug}-1.jpg`);

        console.log(`  ↓ Downloading real photo → ${name}`);

        await downloadImage(photo.url, outPath);

        console.log(`  ✓ Real photo saved → ${name}`);

        productDownloaded++;

        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        console.error(`  ✖ Failed → ${name}`);

        console.error(`    ${error.message}`);

        productFailed++;
      }
    }
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  console.log("\n========================================");
  console.log("   ShopSphere Image Generation Complete");
  console.log("========================================\n");

  console.log("Category banners:");
  console.log(`  ✓ Real photos downloaded : ${categoryDownloaded}`);
  console.log(`  ✓ Already existed        : ${categorySkipped}`);
  console.log(`  ✖ Failed / not found     : ${categoryFailed}`);

  console.log("\nProduct images:");
  console.log(`  ✓ Real photos downloaded : ${productDownloaded}`);
  console.log(`  ✓ Already existed        : ${productSkipped}`);
  console.log(`  ✖ Failed / not found     : ${productFailed}`);

  console.log("\n----------------------------------------");

  if (productFailed > 0 || categoryFailed > 0) {
    console.log("⚠ Some images could not be downloaded.");

    console.log("  No fake placeholder images were created.");
  } else {
    console.log("✓ All missing images were filled with real photos.");
  }

  console.log("----------------------------------------");

  console.log(
    "\nNext: run `node seed.js` to validate, upload, and seed the database.\n",
  );
};

/* =========================================================
   RUN
========================================================= */

run().catch((error) => {
  console.error("\nImage generation failed:", error.message);

  process.exitCode = 1;
});
