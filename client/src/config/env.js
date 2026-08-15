const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
};

export default env;
