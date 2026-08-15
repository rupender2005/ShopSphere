const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createProductSchema,
  updateProductSchema,
  productIdParamsSchema,
  getProductsQuerySchema,
} = require("../validators/product.validator");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// Get Products
router.get("/", validate(getProductsQuerySchema, "query"), getProducts);

// Get Product
router.get(
  "/:productId",
  validate(productIdParamsSchema, "params"),
  getProduct,
);

// Create Product
router.post(
  "/",
  protect,
  isAdmin,
  upload.array("images", 5),
  validate(createProductSchema),
  createProduct,
);

// Update Product
router.put(
  "/:productId",
  protect,
  isAdmin,
  upload.array("images", 5),
  validate(productIdParamsSchema, "params"),
  validate(updateProductSchema),
  updateProduct,
);

// Delete Product
router.delete(
  "/:productId",
  protect,
  isAdmin,
  validate(productIdParamsSchema, "params"),
  deleteProduct,
);

module.exports = router;
