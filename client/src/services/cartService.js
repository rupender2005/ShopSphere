import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "cartService", "getCart");
  }
};

const addToCart = async (cartData) => {
  try {
    const response = await api.post("/cart", cartData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "cartService", "addToCart");
  }
};

const updateCart = async (cartData) => {
  try {
    const response = await api.put("/cart", cartData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "cartService", "updateCart");
  }
};

const removeFromCart = async (productId) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "cartService", "removeFromCart");
  }
};

const clearCart = async () => {
  try {
    const response = await api.delete("/cart");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "cartService", "clearCart");
  }
};

export default {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
};
