const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const addToCartSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid product ID"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be a positive number")
    .max(100, "Quantity cannot exceed 100"),
});

const updateCartSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid product ID"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be a positive number")
    .max(100, "Quantity cannot exceed 100"),
});

const productIdParamsSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid product ID"),
});

module.exports = {
  addToCartSchema,
  updateCartSchema,
  productIdParamsSchema,
};
