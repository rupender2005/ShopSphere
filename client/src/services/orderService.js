import api from "./api";
import handleServiceError from "../utils/errorHandler";

const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "orderService", "createOrder");
  }
};

const getMyOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "orderService", "getMyOrders");
  }
};

const getOrder = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "orderService", "getOrder");
  }
};

const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "orderService", "cancelOrder");
  }
};

export default { createOrder, getMyOrders, getOrder, cancelOrder };
