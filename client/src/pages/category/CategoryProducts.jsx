import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/common/Loader";
const CategoryProducts = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null),
    [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      categoryService.getCategory(id),
      productService.getProducts({ category: id, limit: 50 }),
    ])
      .then(([c, p]) => {
        setCategory(c.data);
        setProducts(p.data?.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Typography variant="h3" fontWeight={800}>
            {category?.name || "Category"}
          </Typography>
          <Typography color="text.secondary" mb={4}>
            {category?.description}
          </Typography>
          {products.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
                gap: 3,
              }}
            >
              {products.map((p) => (
                <ProductCard key={p._id} data={p} />
              ))}
            </Box>
          ) : (
            <>
              <Typography>No products in this category.</Typography>
              <Button component={Link} to="/products" sx={{ mt: 2 }}>
                Browse all products
              </Button>
            </>
          )}
        </>
      )}
    </Container>
  );
};
export default CategoryProducts;
