const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
  googleLoginSchema,
  verifyResetOtpSchema,
} = require("../validators/auth.validator");

const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyResetOtp,
} = require("../controllers/auth.controller");

// Register User
router.post("/register", validate(registerSchema), register);

// Login User
router.post("/login", validate(loginSchema), login);

// Google Login / Register
router.post("/google", validate(googleLoginSchema), googleLogin);

// Logout User
router.post("/logout", protect, logout);

// Get Logged In User
router.get("/me", protect, getMe);

// Forgot Password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// Verify password reset OTP
router.post("/verify-reset-otp", validate(verifyResetOtpSchema), verifyResetOtp);

// Reset Password
router.put(
  "/reset-password/:token",
  validate(resetPasswordParamsSchema, "params"),
  validate(resetPasswordSchema),
  resetPassword,
);

module.exports = router;
