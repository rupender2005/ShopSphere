import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Outlet, Link } from "react-router-dom";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)",
        px: { xs: 2, sm: 3 },
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center">
          <Stack spacing={0.75} alignItems="center" textAlign="center">
            <Box
              component={Link}
              to="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
                fontWeight: 900,
                fontSize: { xs: "1.9rem", sm: "2.15rem" },
                letterSpacing: "-0.04em",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <ShoppingBagOutlinedIcon fontSize="small" />
              </Box>
              ShopSphere
            </Box>

            <Typography variant="body2" color="text.secondary">
              Your online shopping destination
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 3, sm: 4.5 },
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
            }}
          >
            <Outlet />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default AuthLayout;
