import api from "./api";
import handleServiceError from "../utils/errorHandler";

const getUser = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "userService", "getUser");
  }
};

const updateUser = async (userData) => {
  try {
    const response = await api.put("/users", userData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "userService", "updateUser");
  }
};

const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/users/change-password", passwordData);
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "userService", "changePassword");
  }
};

const deleteUser = async () => {
  try {
    const response = await api.delete("/users");
    return response.data;
  } catch (error) {
    throw handleServiceError(error, "userService", "deleteUser");
  }
};

export default { getUser, updateUser, changePassword, deleteUser };
