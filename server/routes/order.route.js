const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createOrderSchema,
  orderIdParamsSchema,
} = require("../validators/order.validator");

const {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
} = require("../controllers/order.controller");

// Create Order
router.post("/", protect, validate(createOrderSchema), createOrder);

// Get My Orders
router.get("/", protect, getMyOrders);

// Get Order
router.get(
  "/:orderId",
  protect,
  validate(orderIdParamsSchema, "params"),
  getOrder,
);

// Cancel Order
router.put(
  "/:orderId/cancel",
  protect,
  validate(orderIdParamsSchema, "params"),
  cancelOrder,
);

module.exports = router;
