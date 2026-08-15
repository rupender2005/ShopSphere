import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import RateReviewIcon from "@mui/icons-material/RateReview";

const DRAWER_WIDTH = 260;

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: DashboardIcon,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Inventory2Icon,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: CategoryIcon,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBagIcon,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: PeopleIcon,
  },
  {
    label: "Reviews",
    path: "/admin/reviews",
    icon: RateReviewIcon,
  },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          minHeight: 72,
          px: 2.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            letterSpacing: "-0.02em",
          }}
        >
          ShopSphere
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Admin Panel
        </Typography>
      </Box>

      <Divider />

      {/* Navigation */}
      <List
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                sx={{
                  minHeight: 46,
                  borderRadius: 2,
                  px: 1.5,

                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",

                    "& .MuiListItemIcon-root": {
                      color: "inherit",
                    },

                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },

                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "text.secondary",
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Divider />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          ShopSphere Admin
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
          },
        }}
      >
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          style={{
            height: "100%",
          }}
        >
          {drawerContent}
        </motion.div>
      </Drawer>
    </>
  );
};

export default AdminSidebar;
