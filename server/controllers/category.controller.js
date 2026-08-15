const { Category } = require("../models/category.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Get Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return ResponseHandler(
      res,
      200,
      true,
      "Categories fetched successfully",
      categories,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > category",
    );
  }
};

// Get Category
const getCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findOne({
      _id: categoryId,
      isActive: true,
    });

    if (!category) {
      return ResponseHandler(res, 404, false, "Category not found");
    }

    return ResponseHandler(
      res,
      200,
      true,
      "Category fetched successfully",
      category,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > category",
    );
  }
};

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return ResponseHandler(res, 400, false, "Category name is required");
    }

    const categoryExists = await Category.findOne({
      name: name.trim(),
    });

    if (categoryExists) {
      return ResponseHandler(res, 400, false, "Category already exists");
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    return ResponseHandler(
      res,
      201,
      true,
      "Category created successfully",
      category,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > category",
    );
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return ResponseHandler(res, 404, false, "Category not found");
    }

    if (name && name.trim() !== category.name) {
      const categoryExists = await Category.findOne({
        name: name.trim(),
        _id: { $ne: categoryId },
      });

      if (categoryExists) {
        return ResponseHandler(res, 400, false, "Category already exists");
      }
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;
    category.image = image ?? category.image;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    await category.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Category updated successfully",
      category,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > category",
    );
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return ResponseHandler(res, 404, false, "Category not found");
    }

    category.isActive = false;

    await category.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Category deleted successfully",
      category,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > category",
    );
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
