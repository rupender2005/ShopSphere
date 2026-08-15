import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import ProductCard from "../components/product/ProductCard";
import CategoryCard from "../components/category/CategoryCard";
import Loader from "../components/common/Loader";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ featured: "true", limit: 8 }),
      categoryService.getCategories(),
    ])
      .then(([p, c]) => {
        setProducts(p.data?.products || []);
        setCategories(Array.isArray(c.data) ? c.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 9, md: 13 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, maxWidth: 760, mb: 2 }}
          >
            Shop smarter. Live better.
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 620, opacity: 0.8, mb: 4 }}>
            Discover quality products with a simple, secure shopping experience
            built for ShopSphere.
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            color="secondary"
            size="large"
          >
            Shop products
          </Button>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#f8fafc", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          {categories.length > 0 && (
            <Box sx={{ mb: { xs: 7, md: 9 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "flex-end" }}
                gap={2}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: ".13em",
                      color: "primary.main",
                    }}
                  >
                    Browse
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    sx={{ letterSpacing: "-.02em" }}
                  >
                    Shop by category
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.75, maxWidth: 560 }}
                  >
                    Find what you need faster with our hand-picked product
                    categories.
                  </Typography>
                </Box>

                <Button
                  component={Link}
                  to="/products"
                  variant="text"
                  sx={{ fontWeight: 800 }}
                >
                  View all products →
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                  gap: 2.25,
                }}
              >
                {categories.slice(0, 5).map((category, index) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    index={index}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box component="section">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "flex-end" }}
              gap={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: ".13em",
                    color: "primary.main",
                  }}
                >
                  Curated for you
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ letterSpacing: "-.02em" }}
                >
                  Featured products
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Popular picks worth taking a closer look at.
                </Typography>
              </Box>

              <Button
                component={Link}
                to="/products"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              >
                Browse shop
              </Button>
            </Stack>

            {loading ? (
              <Loader />
            ) : products.length === 0 ? (
              <Card
                elevation={0}
                sx={{ border: "1px solid rgba(15,23,42,.08)", borderRadius: 4 }}
              >
                <CardContent sx={{ py: 7, textAlign: "center" }}>
                  <Typography variant="h6" fontWeight={800}>
                    Featured products are on the way
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
                    Add a few featured products from the admin panel to populate
                    this section.
                  </Typography>
                  <Button component={Link} to="/products" variant="contained">
                    Explore products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: { xs: 2, md: 2.5 },
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} data={product} />
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
