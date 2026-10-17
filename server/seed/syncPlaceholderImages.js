const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { Product } = require("../models/product.model");
const { Category } = require("../models/category.model");
const manifestPath = path.join(__dirname, "product-image-attributions.json");

const uploadImage = async (entry) => {
  const imagePath = path.resolve(__dirname, entry.imageFile);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file is missing: ${entry.imageFile}`);
  }

  const categorySlug = entry.categorySlug;
  const productSlug = path.parse(imagePath).name.replace(/-\d+$/, "");
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: `shopsphere/seed/products/${categorySlug}/${productSlug}`,
    public_id: `${productSlug}-${entry.imageNumber}`,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  });

  return { entry, url: result.secure_url };
};

const uploadInBatches = async (entries, batchSize = 5) => {
  const uploaded = [];
  for (let index = 0; index < entries.length; index += batchSize) {
    const batch = entries.slice(index, index + batchSize);
    uploaded.push(...(await Promise.all(batch.map(uploadImage))));
    console.log(`Uploaded ${uploaded.length}/${entries.length} product images`);
  }
  return uploaded;
};

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured.");
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are not configured.");
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Run replacePlaceholderImages.js before syncing images.");
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (!manifest.length) throw new Error("No replacement images are listed.");

  await mongoose.connect(process.env.MONGO_URI);

  const productsByKey = new Map();
  for (const entry of manifest) {
    const category = await Category.findOne({ name: entry.categoryName });
    if (!category) throw new Error(`Category not found: ${entry.categoryName}`);
    const product = await Product.findOne({
      name: entry.productName,
      category: category._id,
    });
    if (!product) {
      throw new Error(`Product not found: ${entry.categoryName} / ${entry.productName}`);
    }
    productsByKey.set(`${entry.categoryName}::${entry.productName}`, product);
  }

  const uploaded = await uploadInBatches(manifest);
  const uploadedByProduct = new Map();
  for (const item of uploaded) {
    const product = productsByKey.get(
      `${item.entry.categoryName}::${item.entry.productName}`,
    );
    const group = uploadedByProduct.get(String(product._id)) || {
      product,
      entries: [],
    };
    group.entries.push(item);
    uploadedByProduct.set(String(product._id), group);
  }

  const operations = [...uploadedByProduct.values()].map(({ product, entries }) => {
    const images = [...(product.images || [])];
    const credits = [...(product.imageAttributions || [])];

    for (const { entry, url } of entries) {
      const index = entry.imageNumber - 1;
      while (images.length <= index) images.push("");
      images[index] = url;

      const credit = {
        imageNumber: entry.imageNumber,
        photographer: entry.photographer,
        photographerUrl: entry.photographerUrl,
        photoUrl: entry.pexelsUrl,
      };
      const creditIndex = credits.findIndex(
        (existing) => existing.imageNumber === entry.imageNumber,
      );
      if (creditIndex === -1) credits.push(credit);
      else credits[creditIndex] = credit;
    }

    const update = { images, imageAttributions: credits };
    if (entries.some(({ entry }) => entry.imageNumber === 1)) {
      update.thumbnail = images[0];
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: update },
      },
    };
  });

  const result = await Product.bulkWrite(operations, { ordered: true });
  console.log(`Updated product image fields: ${result.modifiedCount}`);
};

run()
  .catch((error) => {
    console.error("Product image sync failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
