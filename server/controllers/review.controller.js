const { Review } = require("../models/review.model");
const { Product } = require("../models/product.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Update Product Rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
  });

  const numReviews = reviews.length;

  const totalRating = reviews.reduce((total, review) => {
    return total + review.rating;
  }, 0);

  const rating = numReviews > 0 ? totalRating / numReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    rating,
    numReviews,
  });
};

// Get Product Reviews
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    const reviews = await Review.find({
      product: productId,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    return ResponseHandler(
      res,
      200,
      true,
      "Reviews fetched successfully",
      reviews,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > review",
    );
  }
};

// Create Review
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return ResponseHandler(
        res,
        400,
        false,
        "Rating and comment are required",
      );
    }

    if (rating < 1 || rating > 5) {
      return ResponseHandler(res, 400, false, "Rating must be between 1 and 5");
    }

    const product = await Product.findById(productId);

    if (!product) {
      return ResponseHandler(res, 404, false, "Product not found");
    }

    const reviewExists = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (reviewExists) {
      return ResponseHandler(
        res,
        400,
        false,
        "You have already reviewed this product",
      );
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRating(productId);

    const createdReview = await Review.findById(review._id).populate(
      "user",
      "name avatar",
    );

    return ResponseHandler(
      res,
      201,
      true,
      "Review created successfully",
      createdReview,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > review",
    );
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return ResponseHandler(res, 404, false, "Review not found");
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return ResponseHandler(res, 400, false, "Rating must be between 1 and 5");
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    await updateProductRating(review.product);

    const updatedReview = await Review.findById(review._id).populate(
      "user",
      "name avatar",
    );

    return ResponseHandler(
      res,
      200,
      true,
      "Review updated successfully",
      updatedReview,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > review",
    );
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user._id,
    });

    if (!review) {
      return ResponseHandler(res, 404, false, "Review not found");
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    await updateProductRating(productId);

    return ResponseHandler(res, 200, true, "Review deleted successfully");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > review",
    );
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
