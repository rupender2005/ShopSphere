import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import useAuthStore from "../../store/authStore";

const pageTitles = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of your ShopSphere store",
  },
  "/admin/products": {
    title: "Products",
    subtitle: "Manage your store products",
  },
  "/admin/categories": {
    title: "Categories",
    subtitle: "Manage product categories",
  },
  "/admin/orders": {
    title: "Orders",
    subtitle: "Manage customer orders",
  },
  "/admin/users": {
    title: "Users",
    subtitle: "Manage registered customers",
  },
  "/admin/reviews": {
    title: "Reviews",
    subtitle: "Manage customer reviews",
  },
};

const AdminNavbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const currentPage = useMemo(() => {
    return (
      pageTitles[location.pathname] || {
        title: "Admin Panel",
        subtitle: "Manage your ShopSphere store",
      }
    );
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(
        "Error in client > components > admin > AdminNavbar > handleLogout:",
        error,
      );
    }
  };

  const getInitials = (name) => {
    if (!name) {
      return "A";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Mobile menu */}
        <IconButton
          onClick={onMenuClick}
          aria-label="Open admin menu"
          sx={{
            display: { xs: "inline-flex", md: "none" },
            mr: 1,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="h6" fontWeight={700} noWrap>
              {currentPage.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: { xs: "none", sm: "block" },
              }}
              noWrap
            >
              {currentPage.subtitle}
            </Typography>
          </motion.div>
        </Box>

        {/* Admin information */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 2 }}>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              textAlign: "right",
            }}
          >
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name || "Admin"}
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || ""}
            </Typography>
          </Box>

          <Tooltip title={user?.name || "Admin"}>
            <Avatar
              src={user?.avatar || ""}
              alt={user?.name || "Admin"}
              sx={{
                width: 38,
                height: 38,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              aria-label="Logout"
              color="inherit"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
