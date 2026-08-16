import { useEffect, useState } from "react";
import { Alert, Box, Button, Container, TextField, Typography } from "@mui/material";
import productService from "../../services/productService";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/common/Loader";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await productService.getProducts({
          search: search || undefined,
          page,
          limit: 12,
        });
        if (!active) return;
        setProducts(response.data?.products || []);
        setTotal(Math.max(response.data?.totalPages || 1, 1));
      } catch (requestError) {
        if (!active) return;
        setProducts([]);
        setTotal(1);
        setError(requestError.message || "Unable to load products.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, [page, search]);

  const submitSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} mb={3}>Products</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          label="Search products"
          onKeyDown={(event) => event.key === "Enter" && submitSearch()}
        />
        <Button variant="contained" onClick={submitSearch}>Search</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <Loader /> : products.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700}>No products found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Try a different search term or browse again later.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 3 }}>
            {products.map((product) => <ProductCard key={product._id} data={product} />)}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 5 }}>
            <Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Typography sx={{ pt: 1 }}>Page {page} of {total}</Typography>
            <Button disabled={page >= total} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Products;
