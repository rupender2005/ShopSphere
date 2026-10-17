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

const updates = [
  {
    category: "Lighting",
    categorySlug: "lighting",
    product: "Floor Lamp",
    productSlug: "floor-lamp",
    image: path.join(__dirname, "images/products/lighting/floor-lamp-1.jpg"),
  },
  {
    category: "Home Decor",
    categorySlug: "home-decor",
    product: "Area Rug",
    productSlug: "area-rug",
    image: path.join(__dirname, "images/products/home-decor/area-rug-1.jpg"),
  },
  {
    category: "Home Appliances",
    categorySlug: "home-appliances",
    product: "Air Conditioner 1.5T",
    productSlug: "air-conditioner-1-5t",
    image: path.join(
      __dirname,
      "images/products/home-appliances/air-conditioner-1-5t-1.jpg",
    ),
  },
];

const syncProductImages = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured.");
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const prepared = [];

  for (const update of updates) {
    const category = await Category.findOne({ name: update.category });
    if (!category) throw new Error(`Category not found: ${update.category}`);

    const product = await Product.findOne({
      name: update.product,
      category: category._id,
    });
    if (!product) throw new Error(`Product not found: ${update.product}`);

    prepared.push({ ...update, product });
  }

  const uploaded = [];

  for (const update of prepared) {
    const result = await cloudinary.uploader.upload(update.image, {
      folder: `shopsphere/seed/products/${update.categorySlug}/${update.productSlug}`,
      public_id: `${update.productSlug}-1`,
      resource_type: "image",
      overwrite: true,
      invalidate: true,
    });
    uploaded.push({ productId: update.product._id, url: result.secure_url });
  }

  const result = await Product.bulkWrite(
    uploaded.map(({ productId, url }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $set: { thumbnail: url, images: [url] } },
      },
    })),
  );

  console.log(`Updated product images: ${result.modifiedCount}`);
};

syncProductImages()
  .catch((error) => {
    console.error("Product image sync failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
