const express = require("express");
const cors = require("cors");
const path = require("path");

const dotenv = require("dotenv");

// Always load the server-local .env, even when the server is started from the project root.
dotenv.config({ path: path.join(__dirname, ".env") });

const { connectDB } = require("./config/db");
const { ResponseHandler } = require("./utils/responseHandler");
const { transporter } = require("./config/nodemailer");

const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const productRoute = require("./routes/product.route");
const categoryRoute = require("./routes/category.route");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");
const paymentRoute = require("./routes/payment.route");
const reviewRoute = require("./routes/review.route");
const adminRoute = require("./routes/admin.route");

const errorHandler = require("./middleware/error.middleware");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required. Add it to server/.env before starting ShopSphere.");
  process.exit(1);
}

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser/server-to-server requests with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin is not allowed"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRoute);

// Server Check
app.get("/", (req, res) => {
  return ResponseHandler(res, 200, true, "Server is running!");
});

// Route Not Found
app.use((req, res) => {
  return ResponseHandler(
    res,
    404,
    false,
    "Route not found! Please check your endpoint.",
  );
});

// Error Middleware
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter.verify((error) => {
      if (error) {
        console.error("Email configuration check failed. Forgot-password emails will not be deliverable until EMAIL_USER and EMAIL_PASSWORD are configured correctly.");
        console.error(error.message);
        return;
      }

      console.log("Email transporter verified successfully.");
    });
  } else {
    console.warn("EMAIL_USER and EMAIL_PASSWORD are not configured. Email features are disabled until SMTP credentials are added.");
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Error starting ShopSphere server:", error.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
