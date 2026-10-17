const { Product } = require("../models/product.model");
const { Category } = require("../models/category.model");
const { cloudinary } = require("../config/cloudinary");
const { ResponseHandler } = require("../utils/responseHandler");

// Upload Image To Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ShopSphere/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(file.buffer);
  });
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("category", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(filter);

    return ResponseHandler(res, 200, true, "Products fetched successfully", {
      products,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > product",
    );
  }
};

// Get Product
const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    }).populate("category", "name");

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    return ResponseHandler(
      res,
      200,
      true,
      "Product fetched successfully",
      product,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > product",
    );
  }
};

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      brand,
      isFeatured,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return ResponseHandler(
        res,
        400,
        false,
        "Name, description, price and category are required",
      );
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return ResponseHandler(res, 404, false, "Category not found");
    }

    if (!req.files || req.files.length === 0) {
      return ResponseHandler(
        res,
        400,
        false,
        "At least one product image is required",
      );
    }

    const imageUrls = [];

    for (const file of req.files) {
      const imageUrl = await uploadToCloudinary(file);

      imageUrls.push(imageUrl);
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      brand,
      images: imageUrls,
      thumbnail: imageUrls[0],
      isFeatured,
    });

    return ResponseHandler(
      res,
      201,
      true,
      "Product created successfully",
      product,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > product",
    );
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
      brand,
      isFeatured,
      isActive,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return ResponseHandler(res, 404, false, "Category not found");
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discountPrice =
      discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.stock = stock ?? product.stock;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    if (req.files && req.files.length > 0) {
      const imageUrls = [];

      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file);

        imageUrls.push(imageUrl);
      }

      product.images = imageUrls;
      product.thumbnail = imageUrls[0];
      product.imageAttributions = [];
    }

    await product.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Product updated successfully",
      product,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > product",
    );
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    product.isActive = false;

    await product.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Product deleted successfully",
      product,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > product",
    );
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
