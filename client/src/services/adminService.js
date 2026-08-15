import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "getDashboardStats");
  }
};

const getUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "getUsers");
  }
};

const getOrders = async () => {
  try {
    const response = await api.get("/admin/orders");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "getOrders");
  }
};

const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const response = await api.put(`/admin/orders/${orderId}/status`, {
      orderStatus,
    });
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "updateOrderStatus");
  }
};

const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "updateUserRole");
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "adminService", "deleteUser");
  }
};

export default {
  getDashboardStats,
  getUsers,
  getOrders,
  updateOrderStatus,
  updateUserRole,
  deleteUser,
};
