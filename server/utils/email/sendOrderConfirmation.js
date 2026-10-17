const { Order } = require("../../models/order.model");
const { sendEmail } = require("./sendEmail");
const { getOrderConfirmationContent } = require("./html/orderConfirmation");

const sendOrderConfirmation = async (orderId) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(
      `Order confirmation email was not sent for ${orderId}: email is not configured.`,
    );
    return false;
  }

  try {
    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      console.warn(`Order confirmation email skipped: order ${orderId} was not found.`);
      return false;
    }

    if (order.confirmationEmailSentAt) return true;

    const recipient = order.user?.email;
    if (!recipient) {
      console.warn(`Order confirmation email skipped: order ${orderId} has no user email.`);
      return false;
    }

    const { html, text } = getOrderConfirmationContent(order);
    await sendEmail(
      recipient,
      `ShopSphere order confirmation — ${order._id}`,
      html,
      text,
    );

    await Order.updateOne(
      { _id: order._id, confirmationEmailSentAt: null },
      { $set: { confirmationEmailSentAt: new Date() } },
    );

    return true;
  } catch (error) {
    console.error(`Order confirmation email failed for ${orderId}:`, error.message);
    return false;
  }
};

module.exports = { sendOrderConfirmation };
