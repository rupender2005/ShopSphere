const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  updateUserSchema,
  changePasswordSchema,
} = require("../validators/user.validator");

const {
  getUser,
  updateUser,
  changePassword,
  deleteUser,
} = require("../controllers/user.controller");

// Get User
router.get("/", protect, getUser);

// Update User
router.put("/", protect, validate(updateUserSchema), updateUser);

// Change Password
router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword,
);

// Delete User
router.delete("/", protect, deleteUser);

module.exports = router;
