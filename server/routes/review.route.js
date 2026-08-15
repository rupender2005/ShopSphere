const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createReviewSchema,
  updateReviewSchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
} = require("../validators/review.validator");

const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

// Get Product Reviews
router.get(
  "/product/:productId",
  validate(productIdParamsSchema, "params"),
  getProductReviews,
);

// Create Review
router.post(
  "/product/:productId",
  protect,
  validate(productIdParamsSchema, "params"),
  validate(createReviewSchema),
  createReview,
);

// Update Review
router.put(
  "/:reviewId",
  protect,
  validate(reviewIdParamsSchema, "params"),
  validate(updateReviewSchema),
  updateReview,
);

// Delete Review
router.delete(
  "/:reviewId",
  protect,
  validate(reviewIdParamsSchema, "params"),
  deleteReview,
);

module.exports = router;
