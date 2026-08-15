import api from "./api";
import handleServiceError from "../utils/errorHandler";

const wrap =
  (fn, name) =>
  async (...args) => {
    try {
      return (await fn(...args)).data;
    } catch (error) {
      throw handleServiceError(error, "authService", name);
    }
  };

export default {
  register: wrap((d) => api.post("/auth/register", d), "register"),
  login: wrap((d) => api.post("/auth/login", d), "login"),
  googleLogin: wrap(
    (credential) => api.post("/auth/google", { credential }),
    "googleLogin",
  ),
  logout: wrap(() => api.post("/auth/logout"), "logout"),
  getMe: wrap(() => api.get("/auth/me"), "getMe"),
  forgotPassword: wrap(
    (email) => api.post("/auth/forgot-password", { email }),
    "forgotPassword",
  ),
  verifyResetOtp: wrap(
    (email, otp) => api.post("/auth/verify-reset-otp", { email, otp }),
    "verifyResetOtp",
  ),
  resetPassword: wrap(
    (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
    "resetPassword",
  ),
};
