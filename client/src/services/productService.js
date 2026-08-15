import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getProducts = async (params = {}) => {
  try {
    return (await api.get("/products", { params })).data;
  } catch (error) {
    throw handleServiceError(error, "productService", "getProducts");
  }
};
const getProduct = async (productId) => {
  try {
    return (await api.get(`/products/${productId}`)).data;
  } catch (error) {
    throw handleServiceError(error, "productService", "getProduct");
  }
};
const createProduct = async (productData) => {
  try {
    return (await api.post("/products", productData)).data;
  } catch (error) {
    throw handleServiceError(error, "productService", "createProduct");
  }
};
const updateProduct = async (productId, productData) => {
  try {
    return (await api.put(`/products/${productId}`, productData)).data;
  } catch (error) {
    throw handleServiceError(error, "productService", "updateProduct");
  }
};
const deleteProduct = async (productId) => {
  try {
    return (await api.delete(`/products/${productId}`)).data;
  } catch (error) {
    throw handleServiceError(error, "productService", "deleteProduct");
  }
};
export default {
  getProducts,
  getProduct,
  getProductById: getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
