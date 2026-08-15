const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .default(""),
  image: z
    .string()
    .trim()
    .url("Invalid image URL")
    .optional()
    .or(z.literal(""))
    .default(""),
});

const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name must be at most 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional(),
    image: z
      .string()
      .trim()
      .url("Invalid image URL")
      .optional()
      .or(z.literal("")),
    isActive: z.boolean().optional(),
  })
  .strict();

const categoryIdParamsSchema = z.object({
  categoryId: z
    .string({ required_error: "Category ID is required" })
    .regex(objectIdRegex, "Invalid category ID"),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
};
