/*
 * generate-images.js
 * ---------------------------------------------------------
 * Fills every folder under server/seed/images/products/<category>/
 * with a "<product-slug>-1.<ext>" file so seed.js's validation
 * passes without you hand-collecting ~300 images.
 *
 * Strategy (hybrid):
 *   - First 3 products in each category (matches `isFeatured:
 *     index < 3` in seed.js) get a REAL stock photo from the
 *     Pexels API, searched by category keyword.
 *   - Every other product gets a generated placeholder card
 *     (colored background + brand/product name), created locally
 *     with no network call.
 *
 * Already-existing images are left untouched (e.g. the iPhone 15
 * photos you added manually) — this only fills GAPS.
 *
 * SETUP:
 *   1. npm install sharp        (inside server/)
 *   2. Get a free key at https://www.pexels.com/api/ and add to
 *      server/.env:
 *        PEXELS_API_KEY=your_key_here
 *   3. Run from server/seed/:
 *        node generate-images.js
 *   4. Then run your normal seed:
 *        node seed.js
 *
 * If PEXELS_API_KEY is missing, every product (including
 * featured ones) falls back to a generated placeholder — the
 * script still finishes successfully, it just won't fetch real
 * photos.
 * ---------------------------------------------------------
 */

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const sharp = require("sharp");

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

const FEATURED_COUNT = 3; // must match `isFeatured: index < 3` in seed.js

const REQUEST_DELAY_MS = 400; // gentle pacing, well under Pexels' 200/hour limit

/*
 * Generic stock-photo search terms per category. These are
 * deliberately category-level (not brand/model names) since
 * stock libraries don't carry real product photography for
 * specific branded items like "Galaxy S24 Ultra".
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

/*
 * One background color per category so placeholder cards are
 * visually distinct by section. Kept mid-tone so white text
 * stays readable.
 */
const CATEGORY_COLORS = {
  smartphones: "#2563eb",
  laptops: "#1e3a8a",
  tablets: "#0ea5e9",
  "headphones-earbuds": "#7c3aed",
  "smart-watches": "#6d28d9",
  cameras: "#334155",
  gaming: "#dc2626",
  "mens-clothing": "#0f766e",
  "womens-clothing": "#db2777",
  shoes: "#ea580c",
  "bags-backpacks": "#92400e",
  "watches-accessories": "#78350f",
  furniture: "#57534e",
  "kitchen-dining": "#b45309",
  "home-decor": "#a16207",
  lighting: "#ca8a04",
  "home-appliances": "#475569",
  skincare: "#db2777",
  makeup: "#be185d",
  "hair-care-fragrances": "#9333ea",
  "fitness-gym": "#16a34a",
  "cricket-sports": "#15803d",
  books: "#4338ca",
  "toys-kids": "#e11d48",
  "groceries-beverages": "#65a30d",
  jewelry: "#a16207",
  automotive: "#1e293b",
  "pet-supplies": "#c2410c",
  "office-stationery": "#0369a1",
  "travel-gear": "#0e7490",
};

/* =========================================================
   HELPERS
========================================================= */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/*
 * Splits a product name into at most 2 lines of ~18 chars each
 * so long names (e.g. "Harry Potter and the Philosopher's
 * Stone") don't overflow the card.
 */
const wrapText = (value, maxLineLength = 18) => {
  const words = value.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }

    if (lines.length === 1) {
      break; // stop building once we have line 1, remainder joins line 2
    }
  }

  const remainder = words.slice(lines.join(" ").split(" ").length).join(" ");

  if (lines.length === 0) {
    lines.push(current);
  } else if (remainder) {
    lines.push(
      remainder.length > maxLineLength
        ? `${remainder.slice(0, maxLineLength - 1)}…`
        : remainder,
    );
  } else if (current && current !== lines[0]) {
    lines.push(current);
  }

  return lines.slice(0, 2);
};

const darken = (hex, amount = 0.25) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
};

const hasExistingImage = (dir, slug) => {
  if (!fs.existsSync(dir)) return false;

  const pattern = new RegExp(`^${slug}-1\\.(jpg|jpeg|png|webp)$`, "i");

  return fs.readdirSync(dir).some((file) => pattern.test(file));
};

/*
 * Category banner files are named "<slug>.<ext>" (no "-1" suffix)
 * to match seed.js's getCategoryImagePath().
 */
const hasExistingCategoryImage = (slug) => {
  if (!fs.existsSync(CATEGORY_IMAGES_DIR)) return false;

  const pattern = new RegExp(`^${slug}\\.(jpg|jpeg|png|webp)$`, "i");

  return fs.readdirSync(CATEGORY_IMAGES_DIR).some((file) => pattern.test(file));
};

/* =========================================================
   PLACEHOLDER GENERATION (no network)
========================================================= */

const generatePlaceholder = async ({
  dir,
  slug,
  name,
  brand,
  categorySlug,
}) => {
  const bgColor = CATEGORY_COLORS[categorySlug] || "#4b5563";
  const accentColor = darken(bgColor);

  const nameLines = wrapText(name);

  const nameSvg = nameLines
    .map(
      (line, i) =>
        `<text x="400" y="${430 + i * 40}" font-family="Arial, sans-serif" font-size="30" fill="#ffffff" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  const svg = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" fill="${bgColor}"/>
      <rect x="0" y="720" width="800" height="80" fill="${accentColor}"/>
      <text x="400" y="360" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeXml(brand)}</text>
      ${nameSvg}
      <text x="400" y="770" font-family="Arial, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" opacity="0.85">ShopSphere</text>
    </svg>
  `;

  const outPath = path.join(dir, `${slug}-1.png`);

  await sharp(Buffer.from(svg)).png().toFile(outPath);

  return outPath;
};

/*
 * Wide banner placeholder for a category tile (no product name,
 * just the category itself, sized for a landscape card).
 */
const generateCategoryPlaceholder = async ({ slug, name }) => {
  const bgColor = CATEGORY_COLORS[slug] || "#4b5563";
  const accentColor = darken(bgColor);

  const svg = `
    <svg width="1200" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="500" fill="${bgColor}"/>
      <rect x="0" y="430" width="1200" height="70" fill="${accentColor}"/>
      <text x="600" y="250" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeXml(name)}</text>
      <text x="600" y="475" font-family="Arial, sans-serif" font-size="22" fill="#ffffff" text-anchor="middle" opacity="0.85">ShopSphere</text>
    </svg>
  `;

  const outPath = path.join(CATEGORY_IMAGES_DIR, `${slug}.png`);

  await sharp(Buffer.from(svg)).png().toFile(outPath);

  return outPath;
};

/* =========================================================
   PEXELS STOCK PHOTOS
========================================================= */

const fetchStockPhotoUrls = async (query, count) => {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`;

  const response = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels request failed (${response.status}) for "${query}"`,
    );
  }

  const data = await response.json();

  return (data.photos || []).map((photo) => photo.src.large);
};

const fetchCategoryStockPhotoUrl = async (query) => {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

  const response = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels request failed (${response.status}) for "${query}"`,
    );
  }

  const data = await response.json();

  return data.photos && data.photos[0] ? data.photos[0].src.large : null;
};

const downloadImage = async (url, outPath) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(outPath, buffer);
};

/* =========================================================
   MAIN
========================================================= */

const run = async () => {
  console.log("\n========================================");
  console.log("   ShopSphere Image Generator (hybrid)");
  console.log("========================================\n");

  if (!PEXELS_API_KEY) {
    console.warn(
      "⚠ No PEXELS_API_KEY found in server/.env — every product will get a generated placeholder instead of a real photo.\n",
    );
  }

  let placeholderCount = 0;
  let stockCount = 0;
  let skippedCount = 0;

  let categoryStockCount = 0;
  let categoryPlaceholderCount = 0;
  let categorySkippedCount = 0;

  /* ---------------------------------------------------------
     PASS 1: category banner images (30 total, one per category)
  --------------------------------------------------------- */
  console.log("--- Category banners ---\n");

  fs.mkdirSync(CATEGORY_IMAGES_DIR, { recursive: true });

  for (const category of categoryDefinitions) {
    if (hasExistingCategoryImage(category.slug)) {
      console.log(`Skipping (already have image): ${category.name}`);
      categorySkippedCount++;
      continue;
    }

    const query = CATEGORY_SEARCH_TERMS[category.slug] || category.name;
    let stockUrl = null;

    if (PEXELS_API_KEY) {
      try {
        stockUrl = await fetchCategoryStockPhotoUrl(query);
        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        console.warn(
          `⚠ ${error.message} — using placeholder for ${category.name}.`,
        );
      }
    }

    if (stockUrl) {
      try {
        const outPath = path.join(CATEGORY_IMAGES_DIR, `${category.slug}.jpg`);
        console.log(`Stock photo: ${category.name}`);
        await downloadImage(stockUrl, outPath);
        categoryStockCount++;
        continue;
      } catch (error) {
        console.warn(`⚠ ${error.message} — using placeholder instead.`);
      }
    }

    console.log(`Placeholder: ${category.name}`);
    await generateCategoryPlaceholder({
      slug: category.slug,
      name: category.name,
    });
    categoryPlaceholderCount++;
  }

  /* ---------------------------------------------------------
     PASS 2: product images (300 total, up to 10 per category)
  --------------------------------------------------------- */
  console.log("\n--- Product images ---\n");

  for (const category of categoryDefinitions) {
    const dir = path.join(PRODUCT_IMAGES_DIR, category.slug);
    fs.mkdirSync(dir, { recursive: true });

    const featuredProducts = category.products.slice(0, FEATURED_COUNT);
    const restProducts = category.products.slice(FEATURED_COUNT);

    // ---- Featured products: try real stock photos first ----
    let stockUrls = [];

    const needsStock = featuredProducts.some(
      ([name]) => !hasExistingImage(dir, slugify(name)),
    );

    if (PEXELS_API_KEY && needsStock) {
      try {
        const query = CATEGORY_SEARCH_TERMS[category.slug] || category.name;
        stockUrls = await fetchStockPhotoUrls(query, featuredProducts.length);
        await sleep(REQUEST_DELAY_MS);
      } catch (error) {
        console.warn(
          `⚠ ${error.message} — falling back to placeholders for ${category.name}.`,
        );
      }
    }

    for (let i = 0; i < featuredProducts.length; i++) {
      const [name, brand] = featuredProducts[i];
      const slug = slugify(name);

      if (hasExistingImage(dir, slug)) {
        console.log(
          `Skipping (already have image): ${category.name} → ${name}`,
        );
        skippedCount++;
        continue;
      }

      if (stockUrls[i]) {
        try {
          const outPath = path.join(dir, `${slug}-1.jpg`);
          console.log(`Stock photo: ${category.name} → ${name}`);
          await downloadImage(stockUrls[i], outPath);
          stockCount++;
          continue;
        } catch (error) {
          console.warn(`⚠ ${error.message} — using placeholder instead.`);
        }
      }

      console.log(`Placeholder: ${category.name} → ${name}`);
      await generatePlaceholder({
        dir,
        slug,
        name,
        brand,
        categorySlug: category.slug,
      });
      placeholderCount++;
    }

    // ---- Remaining products: placeholders only ----
    for (const [name, brand] of restProducts) {
      const slug = slugify(name);

      if (hasExistingImage(dir, slug)) {
        console.log(
          `Skipping (already have image): ${category.name} → ${name}`,
        );
        skippedCount++;
        continue;
      }

      console.log(`Placeholder: ${category.name} → ${name}`);
      await generatePlaceholder({
        dir,
        slug,
        name,
        brand,
        categorySlug: category.slug,
      });
      placeholderCount++;
    }
  }

  console.log("\n========================================");
  console.log("   Done");
  console.log("========================================");
  console.log("Category banners:");
  console.log(`  Stock photos downloaded: ${categoryStockCount}`);
  console.log(`  Placeholders generated:  ${categoryPlaceholderCount}`);
  console.log(`  Already existed (kept):  ${categorySkippedCount}`);
  console.log("Product images:");
  console.log(`  Stock photos downloaded: ${stockCount}`);
  console.log(`  Placeholders generated:  ${placeholderCount}`);
  console.log(`  Already existed (kept):  ${skippedCount}`);
  console.log(
    "\nNext: run `node seed.js` to validate, upload, and seed the database.\n",
  );
};

run().catch((error) => {
  console.error("\nImage generation failed:", error.message);
  process.exitCode = 1;
});
