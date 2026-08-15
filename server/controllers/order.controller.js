const { Order } = require("../models/order.model");
const { Cart } = require("../models/cart.model");
const { Product } = require("../models/product.model");
const { ResponseHandler } = require("../utils/responseHandler");
const razorpay = require("../config/razorpay");

// Create Order
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      return ResponseHandler(res, 400, false, "Shipping address is required");
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return ResponseHandler(res, 400, false, "Cart is empty");
    }

    for (const item of cart.items) {
      if (!item.product) {
        return ResponseHandler(res, 404, false, "Product not found");
      }

      if (item.quantity > item.product.stock) {
        return ResponseHandler(
          res,
          400,
          false,
          `Not enough stock for ${item.product.name}`,
        );
      }
    }

    const items = [];

    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      const price = product.discountPrice != null ? product.discountPrice : product.price;

      items.push({
        product: product._id,
        name: product.name,
        image: product.thumbnail,
        quantity: item.quantity,
        price,
      });

      subtotal += price * item.quantity;
    }

    const shippingFee = subtotal >= 500 ? 0 : 50;

    const tax = subtotal * 0.18;

    const totalAmount = subtotal + shippingFee + tax;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || "Razorpay",
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      product.stock -= item.quantity;

      await product.save();
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    const createdOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name thumbnail");

    return ResponseHandler(
      res,
      201,
      true,
      "Order created successfully",
      createdOrder,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > order",
    );
  }
};

// Get My Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product", "name thumbnail")
      .sort({ createdAt: -1 });

    return ResponseHandler(
      res,
      200,
      true,
      "Orders fetched successfully",
      orders,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > order",
    );
  }
};

// Get Order
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    })
      .populate("user", "name email")
      .populate("items.product", "name thumbnail");

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    return ResponseHandler(res, 200, true, "Order fetched successfully", order);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > order",
    );
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    if (
      order.orderStatus === "Delivered" ||
      order.orderStatus === "Cancelled"
    ) {
      return ResponseHandler(res, 400, false, `Order cannot be cancelled`);
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();

    if (order.paymentStatus === "Paid") {
      if (!order.razorpayPaymentId) {
        return ResponseHandler(
          res,
          409,
          false,
          "Paid order cannot be cancelled because its payment reference is missing",
        );
      }

      try {
        await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(order.totalAmount * 100),
          speed: "normal",
          notes: {
            orderId: order._id.toString(),
          },
        });
      } catch (error) {
        return ResponseHandler(
          res,
          502,
          false,
          "Payment refund could not be completed. The order was not cancelled.",
        );
      }

      order.paymentStatus = "Refunded";
    }

    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;

        await product.save();
      }
    }

    return ResponseHandler(
      res,
      200,
      true,
      "Order cancelled successfully",
      order,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > order",
    );
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
};
