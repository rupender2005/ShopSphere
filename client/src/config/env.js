const normalizeOptionalEnv = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.startsWith("your-") || normalized.includes("your-web-client-id")) {
    return "";
  }
  return normalized;
};

const env = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  razorpayKeyId: normalizeOptionalEnv(import.meta.env.VITE_RAZORPAY_KEY_ID),
  googleClientId: normalizeOptionalEnv(import.meta.env.VITE_GOOGLE_CLIENT_ID),
};

export default env;
