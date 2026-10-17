const mongoose = require("mongoose");
const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");

class InventoryUnavailableError extends Error {
  constructor(productName) {
    super(`${productName} is no longer available in the requested quantity.`);
    this.name = "InventoryUnavailableError";
    this.code = "ORDER_INVENTORY_UNAVAILABLE";
  }
}

class OrderStateError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "OrderStateError";
    this.code = code;
  }
}

const removePurchasedItemsFromCart = async (userId, orderItems, session) => {
  const cart = await Cart.findOne({ user: userId })
    .session(session)
    .populate("items.product");

  if (!cart) return;

  const quantitiesToRemove = new Map();
  for (const item of orderItems) {
    const productId = item.product?._id || item.product;
    const key = String(productId);
    quantitiesToRemove.set(
      key,
      (quantitiesToRemove.get(key) || 0) + Number(item.quantity || 0),
    );
  }

  const remainingItems = [];
  for (const item of cart.items) {
    const productId = item.product?._id || item.product;
    const key = String(productId);
    const removeQuantity = quantitiesToRemove.get(key) || 0;
    quantitiesToRemove.set(key, Math.max(0, removeQuantity - item.quantity));
    const remainingQuantity = item.quantity - removeQuantity;

    if (remainingQuantity > 0 && item.product) {
      item.quantity = remainingQuantity;
      remainingItems.push(item);
    }
  }

  cart.items = remainingItems;
  cart.totalItems = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = remainingItems.reduce((sum, item) => {
    const product = item.product;
    const price = product.discountPrice ?? product.price;
    return sum + Number(price || 0) * item.quantity;
  }, 0);

  await cart.save({ session });
};

const completePaidOrder = async ({ orderId, userId, paymentId, signature }) => {
  const session = await mongoose.startSession();
  let completedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, user: userId }).session(
        session,
      );

      if (!order) {
        throw new OrderStateError("Order not found", "ORDER_NOT_FOUND");
      }

      if (order.orderStatus === "Cancelled") {
        throw new OrderStateError(
          "This order was cancelled before payment completed.",
          "ORDER_CANCELLED",
        );
      }

      if (order.paymentStatus === "Paid") {
        if (order.razorpayPaymentId === paymentId) {
          completedOrder = order;
          return;
        }

        throw new OrderStateError(
          "A different payment has already completed for this order.",
          "DUPLICATE_PAYMENT",
        );
      }

      if (!order.inventoryDeducted) {
        for (const item of order.items) {
          const result = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session },
          );

          if (result.modifiedCount !== 1) {
            throw new InventoryUnavailableError(item.name);
          }
        }

        order.inventoryDeducted = true;
      }

      order.razorpayPaymentId = paymentId;
      order.razorpaySignature = signature;
      order.paymentStatus = "Paid";
      order.orderStatus = "Confirmed";
      order.paidAt = new Date();

      await order.save({ session });
      await removePurchasedItemsFromCart(userId, order.items, session);
      completedOrder = order;
    });

    return completedOrder;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  completePaidOrder,
  InventoryUnavailableError,
  OrderStateError,
};
