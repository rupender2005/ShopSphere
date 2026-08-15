import api from "./api";
import handleServiceError from "../utils/errorHandler";

const createPaymentOrder = async (orderId) => {
  try {
    return (await api.post("/payments/create-order", { orderId })).data;
  } catch (error) {
    throw handleServiceError(error, "paymentService", "createPaymentOrder");
  }
};
const verifyPayment = async (paymentData) => {
  try {
    return (await api.post("/payments/verify", paymentData)).data;
  } catch (error) {
    throw handleServiceError(error, "paymentService", "verifyPayment");
  }
};
const getPaymentStatus = async (orderId) => {
  try {
    return (await api.get(`/payments/status/${orderId}`)).data;
  } catch (error) {
    throw handleServiceError(error, "paymentService", "getPaymentStatus");
  }
};
export default { createPaymentOrder, verifyPayment, getPaymentStatus };
