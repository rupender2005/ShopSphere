const jwt = require("jsonwebtoken");

const { User } = require("../models/user.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Protect Routes
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHandler(
        res,
        401,
        false,
        "Authentication token is required",
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-password +loginToken",
    );

    if (!user) {
      return ResponseHandler(res, 401, false, "User not found");
    }

    if (user.loginToken !== token) {
      return ResponseHandler(
        res,
        401,
        false,
        "Invalid or expired authentication token",
      );
    }

    req.user = user;

    next();
  } catch (error) {
    return ResponseHandler(
      res,
      401,
      false,
      "Invalid or expired authentication token",
    );
  }
};

module.exports = {
  protect,
};
