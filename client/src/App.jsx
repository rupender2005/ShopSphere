import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import Loader from "./components/common/Loader";

import useAuthStore from "./store/authStore";

// Public pages
import Home from "./pages/Home";
import Products from "./pages/product/Products";
import ProductDetail from "./pages/product/ProductDetail";
import CategoryProducts from "./pages/category/CategoryProducts";
import StoreInfo from "./pages/StoreInfo";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Customer pages
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";
import Profile from "./pages/account/Profile";
import OrderHistory from "./pages/account/OrderHistory";
import OrderDetail from "./pages/account/OrderDetail";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminReviews from "./pages/admin/Reviews";

// Fallback
import NotFound from "./pages/NotFound";

const App = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    initializeAuth().catch(() => {
      // initializeAuth already handles and stores the error.
      // App only needs to continue after auth initialization.
    });
  }, [initializeAuth]);

  if (!isInitialized) {
    return <Loader fullScreen text="Loading ShopSphere..." size={40} />;
  }

  return (
    <Routes>
      {/* Public storefront */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="categories/:id" element={<CategoryProducts />} />
        <Route path="help/:topic" element={<StoreInfo />} />

        <Route path="cart" element={<Cart />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected customer routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/products" element={<AdminProducts />} />
            <Route path="admin/categories" element={<AdminCategories />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
