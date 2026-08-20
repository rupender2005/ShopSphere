const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

app.use(
  cors({
    origin: "https://shopsphere-tan.vercel.app",
    credentials: true,
  }),
);

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
  console.error(
    "JWT_SECRET is required. Add it to Render Environment Variables.",
  );
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error(
    "MONGO_URI is required. Add it to Render Environment Variables.",
  );
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
      // Allow requests without an Origin header
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

// Server check
app.get("/", (req, res) => {
  return ResponseHandler(res, 200, true, "Server is running!");
});

// Route not found
app.use((req, res) => {
  return ResponseHandler(
    res,
    404,
    false,
    "Route not found! Please check your endpoint.",
  );
});

// Error middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    console.log("Database connection established.");

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      transporter.verify((error) => {
        if (error) {
          console.error("Email configuration check failed:");
          console.error(error.message);
          return;
        }

        console.log("Email transporter verified successfully.");
      });
    } else {
      console.warn(
        "EMAIL_USER and EMAIL_PASSWORD are not configured. Email features are disabled.",
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting ShopSphere server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
