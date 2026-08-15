import { useEffect, useState } from "react";
import {
  Box,
  Container,
  TextField,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import productService from "../../services/productService";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/common/Loader";
const Products = () => {
  const [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(1);
  const load = () => {
    setLoading(true);
    productService
      .getProducts({ search: search || undefined, page, limit: 12 })
      .then((r) => {
        setProducts(r.data?.products || []);
        setTotal(r.data?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page]);
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} mb={3}>
        Products
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="Search products"
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <Button
          variant="contained"
          onClick={() => {
            setPage(1);
            load();
          }}
        >
          Search
        </Button>
      </Box>
      {loading ? (
        <Loader />
      ) : (
        <>
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
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 5 }}
          >
            <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography sx={{ pt: 1 }}>
              Page {page} of {total}
            </Typography>
            <Button
              disabled={page >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};
export default Products;
