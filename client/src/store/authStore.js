import { create } from "zustand";
import authService from "../services/authService";
import { getToken, setToken, removeToken } from "../utils/storage";

const useAuthStore = create((set) => ({
  user: null,
  token: getToken(),
  isAuthenticated: Boolean(getToken()),
  isLoading: false,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    const token = getToken();

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await authService.getMe();
      const user =
        response?.data?.user || response?.data || response?.user || null;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      return response;
    } catch (error) {
      removeToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error.message,
      });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(payload);
      const user = response?.data?.user;
      const token = response?.data?.token;

      if (token) setToken(token);

      set({
        user: user || null,
        token: token || null,
        isAuthenticated: Boolean(token),
        isLoading: false,
        isInitialized: true,
      });

      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.googleLogin(credential);
      const user = response?.data?.user;
      const token = response?.data?.token;

      if (!token) {
        throw new Error(
          response?.message ||
            "Google login did not return an authentication token.",
        );
      }

      setToken(token);
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);
      const user = response?.data?.user;
      const token = response?.data?.token;

      if (!token) {
        throw new Error(
          response?.message || "Login did not return an authentication token.",
        );
      }

      setToken(token);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });

      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.forgotPassword(email);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  verifyResetOtp: async (email, otp) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.verifyResetOtp(email, otp);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.resetPassword(token, password);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
    } catch (_) {
      // Local logout must still complete even if the backend request fails.
    }

    removeToken();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    });
  },

  updateUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
