const { User } = require("../models/user.model");
const { Product } = require("../models/product.model");
const { Order } = require("../models/order.model");
const { Category } = require("../models/category.model");
const { ResponseHandler } = require("../utils/responseHandler");

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "User",
    });

    const totalProducts = await Product.countDocuments({
      isActive: true,
    });

    const totalCategories = await Category.countDocuments({
      isActive: true,
    });

    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.find({
      orderStatus: "Delivered",
    });

    const totalRevenue = deliveredOrders.reduce((total, order) => {
      return total + order.totalAmount;
    }, 0);

    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    return ResponseHandler(
      res,
      200,
      true,
      "Dashboard stats fetched successfully",
      {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue,
        pendingOrders,
      },
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -loginToken -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 });

    return ResponseHandler(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name thumbnail")
      .sort({ createdAt: -1 });

    return ResponseHandler(
      res,
      200,
      true,
      "Orders fetched successfully",
      orders,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return ResponseHandler(res, 400, false, "Order status is required");
    }

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return ResponseHandler(res, 400, false, "Invalid order status");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return ResponseHandler(res, 404, false, "Order not found");
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    if (orderStatus === "Cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    return ResponseHandler(
      res,
      200,
      true,
      "Order status updated successfully",
      order,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return ResponseHandler(res, 400, false, "Role is required");
    }

    if (!["Admin", "User"].includes(role)) {
      return ResponseHandler(res, 400, false, "Invalid role");
    }

    const user = await User.findById(userId);

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    user.role = role;

    await user.save();

    const updatedUser = await User.findById(userId).select(
      "-password -loginToken -resetPasswordToken -resetPasswordExpire",
    );

    return ResponseHandler(
      res,
      200,
      true,
      "User role updated successfully",
      updatedUser,
    );
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return ResponseHandler(res, 404, false, "User not found");
    }

    if (user.role === "Admin") {
      return ResponseHandler(res, 400, false, "Admin user cannot be deleted");
    }

    await User.findByIdAndDelete(userId);

    return ResponseHandler(res, 200, true, "User deleted successfully");
  } catch (error) {
    return ResponseHandler(
      res,
      500,
      false,
      "Error in server > controllers > admin",
    );
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getOrders,
  updateOrderStatus,
  updateUserRole,
  deleteUser,
};
