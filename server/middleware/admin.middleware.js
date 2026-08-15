const { ResponseHandler } = require("../utils/responseHandler");
// Check Admin
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHandler(res, 401, false, "Authentication required");
    }

    if (req.user.role !== "Admin") {
      return ResponseHandler(res, 403, false, "Access denied. Admin only");
    }

    next();
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > middleware > admin",
    );
  }
};

module.exports = isAdmin;
