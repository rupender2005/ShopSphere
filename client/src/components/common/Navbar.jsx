import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";

const navItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Products",
    path: "/products",
  },
];

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.reset);
  const cartCount = cart?.totalItems || 0;

  useEffect(() => {
    if (isAuthenticated) fetchCart().catch(() => {});
  }, [isAuthenticated, fetchCart]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      resetCart();

      closeDrawer();
      navigate("/");
    } catch (error) {
      console.error(
        "Error in client > components > common > Navbar > handleLogout:",
        error,
      );
    }
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "text.primary" : "text.secondary",
    fontWeight: isActive ? 600 : 500,
    textTransform: "none",
    minWidth: "auto",
  });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 72 },
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <Typography
              component={Link}
              to="/"
              variant="h6"
              sx={{
                textDecoration: "none",
                color: "text.primary",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              ShopSphere
            </Typography>

            {/* Desktop navigation */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", md: "flex" },
                ml: 6,
                flexGrow: 1,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/"}
                  sx={linkStyle}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            {/* Desktop actions */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: { xs: "none", md: "flex" },
              }}
            >
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                aria-label="Shopping cart"
              >
                <Badge
                  badgeContent={cartCount || 0}
                  color="primary"
                  invisible={!cartCount}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/profile"
                    startIcon={<PersonOutlineIcon />}
                    sx={linkStyle}
                  >
                    {user?.name || "Profile"}
                  </Button>

                  {user?.role === "Admin" && (
                    <Button
                      component={Link}
                      to="/admin"
                      startIcon={<AdminPanelSettingsIcon />}
                      sx={linkStyle}
                    >
                      Admin
                    </Button>
                  )}

                  <Button
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    sx={linkStyle}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={linkStyle}>
                    Login
                  </Button>

                  <Button component={Link} to="/signup" variant="contained">
                    Sign up
                  </Button>
                </>
              )}
            </Stack>

            {/* Mobile actions */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                display: { xs: "flex", md: "none" },
              }}
            >
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                aria-label="Shopping cart"
              >
                <Badge
                  badgeContent={cartCount || 0}
                  color="primary"
                  invisible={!cartCount}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              <IconButton
                onClick={() => setIsDrawerOpen(true)}
                color="inherit"
                aria-label="Open navigation menu"
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: "85%", sm: 360 },
          },
        }}
      >
        <AnimatePresence mode="wait">
          {isDrawerOpen && (
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" fontWeight={700}>
                    ShopSphere
                  </Typography>

                  <IconButton
                    onClick={closeDrawer}
                    aria-label="Close navigation menu"
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>

              <Divider />

              <List sx={{ p: 1.5 }}>
                {navItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeDrawer}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                      }}
                    >
                      {item.label}
                    </ListItemButton>
                  </ListItem>
                ))}

                <ListItem disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to="/cart"
                    onClick={closeDrawer}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <ShoppingCartIcon fontSize="small" />
                      <span>Cart</span>
                    </Stack>
                  </ListItemButton>
                </ListItem>

                {isAuthenticated ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NavLink}
                        to="/profile"
                        onClick={closeDrawer}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <PersonOutlineIcon fontSize="small" />
                          <span>Profile</span>
                        </Stack>
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        component={NavLink}
                        to="/orders"
                        onClick={closeDrawer}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                        }}
                      >
                        Orders
                      </ListItemButton>
                    </ListItem>

                    {user?.role === "Admin" && (
                      <ListItem disablePadding>
                        <ListItemButton
                          component={Link}
                          to="/admin"
                          onClick={closeDrawer}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <AdminPanelSettingsIcon fontSize="small" />
                            <span>Admin Panel</span>
                          </Stack>
                        </ListItemButton>
                      </ListItem>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={handleLogout}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <LogoutIcon fontSize="small" />
                          <span>Logout</span>
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NavLink}
                        to="/login"
                        onClick={closeDrawer}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                        }}
                      >
                        Login
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        component={NavLink}
                        to="/signup"
                        onClick={closeDrawer}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        Sign up
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  );
};

export default Navbar;
