const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const sharp = require("sharp");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { categoryDefinitions, slugify } = require("./seed");
const imagesRoot = path.join(__dirname, "images", "products");
const attributionPath = path.join(__dirname, "product-image-attributions.json");
const pexelsKey = process.env.PEXELS_API_KEY;

const categoryTerms = {
  smartphones: "smartphone product",
  laptops: "laptop computer",
  tablets: "tablet device",
  "headphones-earbuds": "headphones earbuds",
  "smart-watches": "smart watch",
  cameras: "digital camera photography",
  gaming: "gaming console controller",
  "mens-clothing": "mens clothing fashion",
  "womens-clothing": "womens clothing fashion",
  shoes: "shoes sneakers",
  "bags-backpacks": "backpack travel bag",
  "watches-accessories": "wrist watch accessories",
  furniture: "furniture chair table",
  "kitchen-dining": "kitchen appliances cookware",
  "home-decor": "home decor rug vase",
  lighting: "lamp lighting",
  "home-appliances": "home appliance refrigerator washing machine",
  skincare: "skincare cosmetics bottles",
  makeup: "makeup cosmetics",
  "hair-care-fragrances": "hair care perfume fragrance",
  "fitness-gym": "fitness gym equipment",
  "cricket-sports": "sports equipment cricket",
  books: "books reading",
  "toys-kids": "toys kids",
  "groceries-beverages": "grocery food beverages",
  jewelry: "jewelry accessories",
  automotive: "car accessories automotive",
  "pet-supplies": "pet supplies dog cat",
  "office-stationery": "office stationery supplies",
  "travel-gear": "travel luggage bags",
};

const stopWords = new Set([
  "and", "the", "with", "for", "set", "classic", "premium", "series",
  "pro", "new", "size", "inch", "piece", "piece", "light", "smart",
]);

const getImagePaths = (category, productName) => {
  const directory = path.join(imagesRoot, category.slug);
  if (!fs.existsSync(directory)) return [];
  const slug = slugify(productName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${slug}-(\\d+)\\.(jpg|jpeg|png|webp)$`, "i");
  return fs
    .readdirSync(directory)
    .filter((file) => pattern.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => path.join(directory, file));
};

const isTextPlaceholder = async (filePath) => {
  try {
    const stats = await sharp(filePath).stats();
    return stats.entropy < 2;
  } catch {
    return false;
  }
};

const getTargets = async () => {
  const targets = [];
  for (const category of categoryDefinitions) {
    for (const [name, brand] of category.products) {
      for (const filePath of getImagePaths(category, name)) {
        if (await isTextPlaceholder(filePath)) {
          const imageNumber = Number(
            path.parse(filePath).name.match(/-(\d+)$/)?.[1] || 1,
          );
          targets.push({ category, name, brand, filePath, imageNumber });
        }
      }
    }
  }
  return targets;
};

const fetchCategoryPhotos = async (category) => {
  const query = categoryTerms[category.slug] || category.name;
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "80");
  url.searchParams.set("orientation", "square");
  const response = await fetch(url, {
    headers: { Authorization: pexelsKey },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`Pexels returned ${response.status} for ${category.name}`);
  }
  const data = await response.json();
  return data.photos || [];
};

const scorePhoto = (photo, target) => {
  const description = `${photo.alt || ""} ${photo.url || ""}`.toLowerCase();
  const terms = `${target.name} ${target.brand}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  return terms.reduce((score, term) => score + (description.includes(term) ? 1 : 0), 0);
};

const choosePhotos = (photos, targets, usedIds) => {
  const available = photos.filter(
    (photo) => photo.src?.large && !usedIds.has(photo.id),
  );
  const pending = [...targets].sort(
    (a, b) =>
      `${b.name} ${b.brand}`.length - `${a.name} ${a.brand}`.length,
  );
  const chosen = [];

  for (const target of pending) {
    if (!available.length) break;
    available.sort((a, b) => scorePhoto(b, target) - scorePhoto(a, target));
    const photo = available.shift();
    usedIds.add(photo.id);
    chosen.push({ target, photo });
  }

  return chosen;
};

const downloadAndReplace = async ({ target, photo }) => {
  const imageUrl = photo.src.large2x || photo.src.large;
  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Photo download failed for ${target.name}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const oldPath = target.filePath;
  const newPath = path.join(
    path.dirname(oldPath),
    `${slugify(target.name)}-${target.imageNumber}.jpg`,
  );
  const tempPath = `${newPath}.tmp`;

  await sharp(buffer)
    .resize(900, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(tempPath);
  fs.renameSync(tempPath, newPath);
  if (oldPath !== newPath) fs.unlinkSync(oldPath);

  return {
    categorySlug: target.category.slug,
    categoryName: target.category.name,
    productName: target.name,
    imageNumber: target.imageNumber,
    imageFile: path.relative(__dirname, newPath).replace(/\\/g, "/"),
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pexelsUrl: photo.url,
  };
};

const run = async () => {
  if (!pexelsKey) throw new Error("PEXELS_API_KEY is missing from server/.env");

  const targets = await getTargets();
  console.log(`Placeholder images found: ${targets.length}`);
  if (!targets.length) return;

  const byCategory = new Map();
  for (const target of targets) {
    const group = byCategory.get(target.category.slug) || [];
    group.push(target);
    byCategory.set(target.category.slug, group);
  }

  const usedPhotoIds = new Set();
  const previousAttributions = fs.existsSync(attributionPath)
    ? JSON.parse(fs.readFileSync(attributionPath, "utf8"))
    : [];
  const attributionByFile = new Map(
    previousAttributions.map((item) => [item.imageFile, item]),
  );
  const failures = [];
  let replacedCount = 0;
  const saveAttributions = () => {
    fs.writeFileSync(
      attributionPath,
      JSON.stringify([...attributionByFile.values()], null, 2),
    );
  };

  for (const [categorySlug, categoryTargets] of byCategory) {
    const category = categoryTargets[0].category;
    console.log(`Searching ${category.name} (${categoryTargets.length})`);
    try {
      const photos = await fetchCategoryPhotos(category);
      const chosen = choosePhotos(photos, categoryTargets, usedPhotoIds);
      if (chosen.length < categoryTargets.length) {
        throw new Error(`Only ${chosen.length} usable photos were returned`);
      }
      for (let index = 0; index < chosen.length; index += 4) {
        const batch = chosen.slice(index, index + 4);
        const completed = await Promise.all(batch.map(downloadAndReplace));
        for (const attribution of completed) {
          attributionByFile.set(attribution.imageFile, attribution);
          replacedCount += 1;
        }
        saveAttributions();
      }
    } catch (error) {
      failures.push(`${category.name}: ${error.message}`);
      console.error(`Could not replace ${category.name} placeholders: ${error.message}`);
    }
  }

  saveAttributions();
  console.log(`Replaced this run: ${replacedCount}`);
  console.log(`Credits recorded: ${attributionByFile.size}`);
  console.log(`Failed categories: ${failures.length}`);
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
