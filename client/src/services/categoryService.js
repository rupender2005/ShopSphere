import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "categoryService", "getCategories");
  }
};

const getCategory = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "categoryService", "getCategory");
  }
};

const createCategory = async (categoryData) => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "categoryService", "createCategory");
  }
};

const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "categoryService", "updateCategory");
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "categoryService", "deleteCategory");
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
