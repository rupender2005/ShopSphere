const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const shippingAddressSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters"),
  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .min(10, "Phone must be at least 10 characters")
    .max(20, "Phone must be at most 20 characters"),
  street: z
    .string({ required_error: "Street is required" })
    .trim()
    .min(3, "Street must be at least 3 characters"),
  city: z
    .string({ required_error: "City is required" })
    .trim()
    .min(2, "City must be at least 2 characters"),
  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(2, "State must be at least 2 characters"),
  postalCode: z
    .string({ required_error: "Postal code is required" })
    .trim()
    .min(4, "Postal code must be at least 4 characters"),
  country: z
    .string()
    .trim()
    .default("India"),
});

const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["Razorpay", "COD"]).optional().default("Razorpay"),
});

const orderIdParamsSchema = z.object({
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid order ID"),
});

module.exports = {
  createOrderSchema,
  orderIdParamsSchema,
  shippingAddressSchema,
};
