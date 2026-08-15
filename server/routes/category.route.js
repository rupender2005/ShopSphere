const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
} = require("../validators/category.validator");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

// Get Categories
router.get("/", getCategories);

// Get Category
router.get(
  "/:categoryId",
  validate(categoryIdParamsSchema, "params"),
  getCategory,
);

// Create Category
router.post(
  "/",
  protect,
  isAdmin,
  validate(createCategorySchema),
  createCategory,
);

// Update Category
router.put(
  "/:categoryId",
  protect,
  isAdmin,
  validate(categoryIdParamsSchema, "params"),
  validate(updateCategorySchema),
  updateCategory,
);

// Delete Category
router.delete(
  "/:categoryId",
  protect,
  isAdmin,
  validate(categoryIdParamsSchema, "params"),
  deleteCategory,
);

module.exports = router;
