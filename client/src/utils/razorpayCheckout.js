import env from "../config/env";
import paymentService from "../services/paymentService";

export const startRazorpayCheckout = async ({ orderId, user }) => {
  if (!env.razorpayKeyId) {
    throw new Error("VITE_RAZORPAY_KEY_ID is not configured.");
  }

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout script is not loaded.");
  }

  const payment = await paymentService.createPaymentOrder(orderId);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const checkout = new window.Razorpay({
      key: env.razorpayKeyId,
      amount: payment.data.amount,
      currency: payment.data.currency,
      name: "ShopSphere",
      description: `Order ${orderId}`,
      order_id: payment.data.orderId,
      prefill: { name: user?.name, email: user?.email },
      handler: async (response) => {
        try {
          const verified = await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId,
          });
          finish({ status: "paid", order: verified.data });
        } catch (error) {
          finish({ status: "error", error });
        }
      },
      modal: {
        ondismiss: () => finish({ status: "dismissed" }),
      },
    });

    checkout.on("payment.failed", (response) => {
      finish({
        status: "error",
        error: new Error(
          response?.error?.description || "Payment was not completed.",
        ),
      });
    });

    checkout.open();
  });
};
