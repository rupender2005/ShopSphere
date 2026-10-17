const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
  price: z.coerce
    .number({ required_error: "Price is required" })
    .min(0, "Price cannot be negative"),
  discountPrice: z.coerce
    .number()
    .min(0, "Discount price cannot be negative")
    .nullable()
    .optional(),
  stock: z.coerce
    .number({ required_error: "Stock is required" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  category: z
    .string({ required_error: "Category is required" })
    .regex(objectIdRegex, "Invalid category ID"),
  brand: z
    .string()
    .trim()
    .max(100, "Brand must be at most 100 characters")
    .optional()
    .default(""),
  isFeatured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional()
    .default(false),
  isActive: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional()
    .default(true),
}).refine(
  (data) =>
    data.discountPrice == null ||
    data.discountPrice <= data.price,
  {
    message: "Discount price cannot be greater than price",
    path: ["discountPrice"],
  },
);

const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(200, "Product name must be at most 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must be at most 5000 characters")
      .optional(),
    price: z.coerce.number().min(0, "Price cannot be negative").optional(),
    discountPrice: z.coerce
      .number()
      .min(0, "Discount price cannot be negative")
      .nullable()
      .optional(),
    stock: z.coerce
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
      .optional(),
    category: z
      .string()
      .regex(objectIdRegex, "Invalid category ID")
      .optional(),
    brand: z
      .string()
      .trim()
      .max(100, "Brand must be at most 100 characters")
      .optional(),
    isFeatured: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((v) => v === true || v === "true")
      .optional(),
    isActive: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((v) => v === true || v === "true")
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.discountPrice == null ||
      data.price === undefined ||
      data.discountPrice <= data.price,
    {
      message: "Discount price cannot be greater than price",
      path: ["discountPrice"],
    },
  );

const productIdParamsSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .regex(objectIdRegex, "Invalid product ID"),
});

const getProductsQuerySchema = z.object({
  category: z
    .string()
    .regex(objectIdRegex, "Invalid category ID")
    .optional(),
  brand: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
}).refine(
  ({ minPrice, maxPrice }) =>
    minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
  {
    message: "Minimum price cannot be greater than maximum price",
    path: ["minPrice"],
  },
);

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdParamsSchema,
  getProductsQuerySchema,
};
