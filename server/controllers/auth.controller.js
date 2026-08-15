const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { User } = require("../models/user.model");
const { ResponseHandler } = require("../utils/responseHandler");

const { sendEmail } = require("../utils/email/sendEmail");
const { forgotHtml } = require("../utils/email/html/forgotPass");
const { verifyGoogleIdToken } = require("../utils/google/verifyGoogleToken");

const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Authentication is not configured on the server");
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler(
        res,
        400,
        false,
        "Email and password are required",
      );
    }

    if (password.length < 8) {
      return ResponseHandler(
        res,
        400,
        false,
        "Password must be at least 8 characters",
      );
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return ResponseHandler(res, 400, false, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userData = await User.findById(user._id).select("-password");

    return ResponseHandler(
      res,
      201,
      true,
      "User registered successfully",
      userData,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ResponseHandler(
        res,
        400,
        false,
        "Email and password are required",
      );
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return ResponseHandler(res, 401, false, "Invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return ResponseHandler(res, 401, false, "Invalid email or password");
    }

    const token = createAuthToken(user);

    user.loginToken = token;

    await user.save();

    const userData = await User.findById(user._id).select("-password");

    return ResponseHandler(res, 200, true, "Login successful", {
      user: userData,
      token,
    });
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Google Login / Register
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return ResponseHandler(res, 400, false, "Google credential is required");
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return ResponseHandler(res, 500, false, "Google authentication is not configured on the server");
    }

    const payload = await verifyGoogleIdToken(credential, process.env.GOOGLE_CLIENT_ID);
    const email = payload.email.trim().toLowerCase();

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] }).select("+password +loginToken");

    if (user && !user.googleId && email !== user.email) {
      return ResponseHandler(res, 409, false, "Unable to link this Google account");
    }

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

      user = await User.create({
        name: payload.name || email.split("@")[0],
        email,
        password: randomPassword,
        googleId: payload.sub,
        avatar: payload.picture || "",
      });
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (payload.name && !user.name) user.name = payload.name;
      if (payload.picture && !user.avatar) user.avatar = payload.picture;
    }

    const token = createAuthToken(user);

    user.loginToken = token;
    await user.save();

    const userData = await User.findById(user._id).select("-password -googleId");

    return ResponseHandler(res, 200, true, "Google login successful", {
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Error in server > controllers > auth > googleLogin", error.message);
    return ResponseHandler(res, 401, false, error.message || "Google authentication failed");
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    user.loginToken = undefined;

    await user.save();

    return ResponseHandler(res, 200, true, "Logout successful");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Get Logged In User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    return ResponseHandler(res, 200, true, "User fetched successfully", user);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return ResponseHandler(res, 400, false, "Email is required");
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordToken +resetPasswordOtp +resetPasswordExpire",
    );

    // Do not disclose whether an account exists.
    if (!user) {
      return ResponseHandler(
        res,
        200,
        true,
        "If an account exists for that email, a password reset message has been sent.",
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetOtp = String(crypto.randomInt(100000, 1000000));

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const emailHtml = forgotHtml(resetLink, "ShopSphere", resetOtp);

    try {
      await sendEmail(
        user.email,
        "ShopSphere Password Reset",
        emailHtml,
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return ResponseHandler(
        res,
        503,
        false,
        "We could not send the password reset email. Please try again later.",
      );
    }

    return ResponseHandler(
      res,
      200,
      true,
      "If an account exists for that email, a password reset message has been sent.",
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Verify Password Reset OTP
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEmail || !normalizedOtp) {
      return ResponseHandler(res, 400, false, "Email and OTP are required");
    }

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordOtp: normalizedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordOtp +resetPasswordExpire");

    if (!user || !user.resetPasswordToken) {
      return ResponseHandler(res, 400, false, "Invalid or expired reset code");
    }

    // Issue a fresh short-lived raw token after the OTP is proven.
    // The raw token is not stored in the database; only its hash is stored.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordOtp = undefined;

    await user.save();

    return ResponseHandler(res, 200, true, "Reset code verified", {
      token: rawToken,
    });
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return ResponseHandler(res, 400, false, "Password is required");
    }

    if (password.length < 8) {
      return ResponseHandler(
        res,
        400,
        false,
        "Password must be at least 8 characters",
      );
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return ResponseHandler(res, 400, false, "Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    user.loginToken = undefined;

    await user.save();

    return ResponseHandler(res, 200, true, "Password reset successfully");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > auth",
    );
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
