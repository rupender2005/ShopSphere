const Razorpay = require("razorpay");

let razorpayClient = null;

const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getRazorpay = () => {
  console.log("Razorpay config check:", {
    keyIdLoaded: Boolean(process.env.RAZORPAY_KEY_ID),
    keySecretLoaded: Boolean(process.env.RAZORPAY_KEY_SECRET),
    keyIdPrefix: process.env.RAZORPAY_KEY_ID
      ? process.env.RAZORPAY_KEY_ID.slice(0, 9)
      : null,
  });

  if (!isRazorpayConfigured()) {
    const error = new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.",
    );

    error.code = "RAZORPAY_NOT_CONFIGURED";

    throw error;
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};
module.exports = {
  getRazorpay,
  isRazorpayConfigured,
};
