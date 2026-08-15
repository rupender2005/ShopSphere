import { create } from "zustand";
import authService from "../services/authService";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.register(userData);

      set({
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > register";

      console.error("Error in client > store > authStore > register:", error);

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.login(credentials);

      set({
        user: data.data?.user || null,
        token: data.data?.token || null,
        isAuthenticated: !!data.data?.token,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > login";

      console.error("Error in client > store > authStore > login:", error);

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.logout();

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > logout";

      console.error("Error in client > store > authStore > logout:", error);

      // Clear local auth even if the server logout request fails
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  getMe: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.getMe();

      set({
        user: data.data?.user || data.data || null,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > getMe";

      console.error("Error in client > store > authStore > getMe:", error);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });

      localStorage.removeItem("token");

      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.forgotPassword(email);

      set({
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > forgotPassword";

      console.error(
        "Error in client > store > authStore > forgotPassword:",
        error,
      );

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });

    try {
      const data = await authService.resetPassword(token, password);

      set({
        isLoading: false,
      });

      return data;
    } catch (error) {
      const message =
        error.message || "Error in client > store > authStore > resetPassword";

      console.error(
        "Error in client > store > authStore > resetPassword:",
        error,
      );

      set({
        isLoading: false,
        error: message,
      });

      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
