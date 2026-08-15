const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
    { required_error: "Order status is required", invalid_type_error: "Invalid order status" },
  ),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["Admin", "User"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be Admin or User",
  }),
});

const orderIdParamsSchema = z.object({
  orderId: z
    .string({ required_error: "Order ID is required" })
    .regex(objectIdRegex, "Invalid order ID"),
});

const userIdParamsSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .regex(objectIdRegex, "Invalid user ID"),
});

module.exports = {
  updateOrderStatusSchema,
  updateUserRoleSchema,
  orderIdParamsSchema,
  userIdParamsSchema,
};
