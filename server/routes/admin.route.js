const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");
const { validate } = require("../middleware/validate.middleware");

const {
  updateOrderStatusSchema,
  updateUserRoleSchema,
  orderIdParamsSchema,
  userIdParamsSchema,
} = require("../validators/admin.validator");

const {
  getDashboardStats,
  getUsers,
  getOrders,
  updateOrderStatus,
  updateUserRole,
  deleteUser,
} = require("../controllers/admin.controller");

// Get Dashboard
router.get("/dashboard", protect, isAdmin, getDashboardStats);

// Get All Users
router.get("/users", protect, isAdmin, getUsers);

// Get All Orders
router.get("/orders", protect, isAdmin, getOrders);

// Update Order Status
router.put(
  "/orders/:orderId/status",
  protect,
  isAdmin,
  validate(orderIdParamsSchema, "params"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

// Update User Role
router.put(
  "/users/:userId/role",
  protect,
  isAdmin,
  validate(userIdParamsSchema, "params"),
  validate(updateUserRoleSchema),
  updateUserRole,
);

// Delete User
router.delete(
  "/users/:userId",
  protect,
  isAdmin,
  validate(userIdParamsSchema, "params"),
  deleteUser,
);

module.exports = router;
