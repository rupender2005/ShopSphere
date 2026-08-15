const crypto = require("crypto");
const razorpay = require("../config/razorpay");

const { Order } = require("../models/order.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Create Payment Order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return ResponseHandler(res, 400, false, "Order ID is required");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    if (order.paymentMethod !== "Razorpay") {
      return ResponseHandler(
        res,
        400,
        false,
        "This order does not use Razorpay",
      );
    }

    if (order.paymentStatus === "Paid") {
      return ResponseHandler(res, 400, false, "Order is already paid");
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Payment order created successfully",
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > payment",
    );
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !orderId
    ) {
      return ResponseHandler(res, 400, false, "Payment details are required");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return ResponseHandler(res, 400, false, "Invalid Razorpay order ID");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const signaturesMatch =
      generatedSignature.length === razorpaySignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpaySignature),
      );

    if (!signaturesMatch) {
      return ResponseHandler(res, 400, false, "Invalid payment signature");
    }

    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (error) {
      return ResponseHandler(
        res,
        502,
        false,
        "Unable to verify payment status with Razorpay",
      );
    }

    const expectedAmount = Math.round(order.totalAmount * 100);
    if (
      payment.order_id !== razorpayOrderId ||
      Number(payment.amount) !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return ResponseHandler(res, 400, false, "Payment details do not match the order");
    }

    if (payment.status !== "captured" && payment.captured !== true) {
      return ResponseHandler(
        res,
        400,
        false,
        `Payment is not captured yet (current status: ${payment.status || "unknown"})`,
      );
    }

    if (order.paymentStatus === "Paid") {
      return ResponseHandler(res, 400, false, "Payment has already been verified");
    }

    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed";
    order.paidAt = new Date();

    await order.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Payment verified successfully",
      order,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > payment",
    );
  }
};

// Get Payment Status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).select(
      "paymentStatus razorpayOrderId razorpayPaymentId totalAmount orderStatus",
    );

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    return ResponseHandler(
      res,
      200,
      true,
      "Payment status fetched successfully",
      order,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > payment",
    );
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
};
