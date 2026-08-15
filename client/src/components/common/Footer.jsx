import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Shop",
      links: [
        {
          label: "Home",
          path: "/",
        },
        {
          label: "Products",
          path: "/products",
        },
        {
          label: "Cart",
          path: "/cart",
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          label: "Login",
          path: "/login",
        },
        {
          label: "Create Account",
          path: "/signup",
        },
        {
          label: "Profile",
          path: "/profile",
        },
        {
          label: "Orders",
          path: "/orders",
        },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={5}
          sx={{
            py: { xs: 5, md: 7 },
          }}
        >
          {/* Brand */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                component={Link}
                to="/"
                variant="h6"
                sx={{
                  display: "inline-block",
                  color: "text.primary",
                  textDecoration: "none",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                ShopSphere
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 2,
                  maxWidth: 430,
                  lineHeight: 1.8,
                }}
              >
                Your online shopping destination for quality products, secure
                payments, and a smooth shopping experience.
              </Typography>
            </motion.div>
          </Grid>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <Grid key={section.title} size={{ xs: 6, md: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: 0.1 * (index + 1),
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  {section.title}
                </Typography>

                <Stack spacing={1.25}>
                  {section.links.map((link) => (
                    <MuiLink
                      key={link.path}
                      component={Link}
                      to={link.path}
                      underline="none"
                      color="text.secondary"
                      sx={{
                        width: "fit-content",
                        fontSize: 14,
                        transition: "color 0.2s ease",
                        "&:hover": {
                          color: "text.primary",
                        },
                      }}
                    >
                      {link.label}
                    </MuiLink>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      <Container maxWidth="xl">
        <Box
          sx={{
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ShopSphere. All rights reserved.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Built with React & MERN
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
