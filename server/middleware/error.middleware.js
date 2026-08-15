const multer = require("multer");
const { ResponseHandler } = require("../utils/responseHandler");

// Centralized Error Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image size cannot exceed 5 MB"
        : "File upload failed";
    return ResponseHandler(res, 400, false, message);
  }

  if (err?.name === "ValidationError") {
    return ResponseHandler(res, 400, false, "Validation failed", {
      errors: Object.values(err.errors || {}).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    });
  }

  if (err?.name === "CastError") {
    return ResponseHandler(res, 400, false, "Invalid resource ID");
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0];
    return ResponseHandler(
      res,
      409,
      false,
      duplicateField
        ? `${duplicateField} already exists`
        : "A record with the same value already exists",
    );
  }

  return ResponseHandler(
    res,
    Number.isInteger(err?.statusCode) ? err.statusCode : 500,
    false,
    err?.message || "Error in server > middleware > error",
  );
};

module.exports = errorHandler;
