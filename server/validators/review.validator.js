const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createReviewSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string({ required_error: "Comment is required" })
    .trim()
    .min(5, "Comment must be at least 5 characters")
    .max(1000, "Comment must be at most 1000 characters"),
});

const updateReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .trim()
      .min(5, "Comment must be at least 5 characters")
      .max(1000, "Comment must be at most 1000 characters")
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "At least one of rating or comment is required",
  });

const productIdParamsSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid product ID"),
});

const reviewIdParamsSchema = z.object({
  reviewId: z
    .string({ required_error: "Review ID is required" })
    .regex(objectIdRegex, "Invalid review ID"),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  productIdParamsSchema,
  reviewIdParamsSchema,
};
