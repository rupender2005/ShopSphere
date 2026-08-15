import useAuthStore from "../store/authStore";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const getMe = useAuthStore((state) => state.getMe);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearError = useAuthStore((state) => state.clearError);

  const isAdmin = user?.role === "Admin";

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
    isInitialized,
    error,

    login,
    register,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    clearError,
  };
};

export default useAuth;
