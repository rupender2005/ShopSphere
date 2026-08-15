const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createPaymentOrderSchema = z.object({
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid order ID"),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z
    .string({ required_error: "Razorpay order ID is required" })
    .min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z
    .string({ required_error: "Razorpay payment ID is required" })
    .min(1, "Razorpay payment ID is required"),
  razorpaySignature: z
    .string({ required_error: "Razorpay signature is required" })
    .min(1, "Razorpay signature is required"),
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid order ID"),
});

const orderIdParamsSchema = z.object({
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid order ID"),
});

module.exports = {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  orderIdParamsSchema,
};
