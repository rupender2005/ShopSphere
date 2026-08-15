const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  addToCartSchema,
  updateCartSchema,
  productIdParamsSchema,
} = require("../validators/cart.validator");

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

// Get Cart
router.get("/", protect, getCart);

// Add To Cart
router.post("/", protect, validate(addToCartSchema), addToCart);

// Update Cart
router.put("/", protect, validate(updateCartSchema), updateCart);

// Remove From Cart
router.delete(
  "/:productId",
  protect,
  validate(productIdParamsSchema, "params"),
  removeFromCart,
);

// Clear Cart
router.delete("/", protect, clearCart);

module.exports = router;
