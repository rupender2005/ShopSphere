const multer = require("multer");
const { ResponseHandler } = require("../utils/responseHandler");

const storage = multer.memoryStorage();

// File Filter
const fileFilter = (req, file, cb) => {
  try {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Error in server > middleware > upload"), false);
    }

    cb(null, true);
  } catch (error) {
    cb(new Error("Error in server > middleware > upload"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
