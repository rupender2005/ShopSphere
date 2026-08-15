const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  orderIdParamsSchema,
} = require("../validators/payment.validator");

const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
} = require("../controllers/payment.controller");

// Create Payment Order
router.post(
  "/create-order",
  protect,
  validate(createPaymentOrderSchema),
  createPaymentOrder,
);

// Verify Payment
router.post("/verify", protect, validate(verifyPaymentSchema), verifyPayment);

// Get Payment Status
router.get(
  "/status/:orderId",
  protect,
  validate(orderIdParamsSchema, "params"),
  getPaymentStatus,
);

module.exports = router;
