import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "reviewService", "getProductReviews");
  }
};

const createReview = async (productId, reviewData) => {
  try {
    const response = await api.post(
      `/reviews/product/${productId}`,
      reviewData,
    );
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "reviewService", "createReview");
  }
};

const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "reviewService", "updateReview");
  }
};

const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "reviewService", "deleteReview");
  }
};

export default {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
