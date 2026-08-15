import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loader from "./Loader";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = () => {
  const location = useLocation();

  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return <Loader fullScreen text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
