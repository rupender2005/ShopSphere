import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/common/Loader";
import ApiError from "../../components/common/ApiError";

const emptyFilters = {
  category: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sort: "newest",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [filterError, setFilterError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadCategories = useCallback(async () => {
    setCategoriesError("");
    try {
      const response = await categoryService.getCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setCategoriesError(
        requestError.message || "Unable to load product categories.",
      );
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await productService.getProducts({
          search: search || undefined,
          category: appliedFilters.category || undefined,
          minPrice: appliedFilters.minPrice || undefined,
          maxPrice: appliedFilters.maxPrice || undefined,
          minRating: appliedFilters.minRating || undefined,
          sort: appliedFilters.sort,
          page,
          limit: 12,
        });
        if (!active) return;
        setProducts(response.data?.products || []);
        setTotal(Math.max(response.data?.totalPages || 1, 1));
        setTotalProducts(response.data?.totalProducts || 0);
      } catch (requestError) {
        if (!active) return;
        setProducts([]);
        setTotal(1);
        setTotalProducts(0);
        setError(requestError.message || "Unable to load products.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      active = false;
    };
  }, [appliedFilters, page, refreshKey, search]);

  const updateFilter = (name) => (event) => {
    setFilters((current) => ({ ...current, [name]: event.target.value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    const minimum = filters.minPrice === "" ? null : Number(filters.minPrice);
    const maximum = filters.maxPrice === "" ? null : Number(filters.maxPrice);
    if (
      (minimum !== null && (!Number.isFinite(minimum) || minimum < 0)) ||
      (maximum !== null && (!Number.isFinite(maximum) || maximum < 0))
    ) {
      setFilterError("Enter valid prices that are zero or higher.");
      return;
    }
    if (minimum !== null && maximum !== null && minimum > maximum) {
      setFilterError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setFilterError("");
    setPage(1);
    setSearch(searchInput.trim());
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchInput("");
    setSearch("");
    setFilterError("");
    setPage(1);
  };

  const hasFilters =
    searchInput.trim() !== "" ||
    filters.category !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minRating !== "" ||
    filters.sort !== "newest";

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h3" fontWeight={800}>
            Products
          </Typography>
          {!loading && !error && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {totalProducts} {totalProducts === 1 ? "product" : "products"}
            </Typography>
          )}
        </Box>
      </Stack>

      <Paper
        component="form"
        onSubmit={applyFilters}
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}
      >
        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
          Find your next pick
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <TextField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            label="Search products"
            type="search"
            fullWidth
          />
          <TextField
            select
            label="Category"
            value={filters.category}
            onChange={updateFilter("category")}
            fullWidth
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Minimum rating"
            value={filters.minRating}
            onChange={updateFilter("minRating")}
            fullWidth
          >
            <MenuItem value="">Any rating</MenuItem>
            <MenuItem value="4">4 stars and up</MenuItem>
            <MenuItem value="3">3 stars and up</MenuItem>
            <MenuItem value="2">2 stars and up</MenuItem>
            <MenuItem value="1">1 star and up</MenuItem>
          </TextField>
          <TextField
            label="Minimum price"
            type="number"
            value={filters.minPrice}
            onChange={updateFilter("minPrice")}
            inputProps={{ min: 0, step: "any" }}
            fullWidth
          />
          <TextField
            label="Maximum price"
            type="number"
            value={filters.maxPrice}
            onChange={updateFilter("maxPrice")}
            inputProps={{ min: 0, step: "any" }}
            fullWidth
          />
          <TextField
            select
            label="Sort by"
            value={filters.sort}
            onChange={updateFilter("sort")}
            fullWidth
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-asc">Price: low to high</MenuItem>
            <MenuItem value="price-desc">Price: high to low</MenuItem>
            <MenuItem value="rating">Top rated</MenuItem>
          </TextField>
        </Box>
        {filterError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {filterError}
          </Alert>
        )}
        {categoriesError && (
          <Box sx={{ mt: 2 }}>
            <ApiError message={categoriesError} onRetry={loadCategories} />
          </Box>
        )}
        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
          <Button type="submit" variant="contained">
            Apply filters
          </Button>
          <Button type="button" onClick={clearFilters} disabled={!hasFilters}>
            Clear all
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <Loader />
      ) : error ? (
        <ApiError message={error} onRetry={() => setRefreshKey((key) => key + 1)} />
      ) : products.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700}>
            No products found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters.
          </Typography>
          <Button onClick={clearFilters} sx={{ mt: 2 }}>
            Clear filters
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
              gap: 3,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} data={product} />
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 5,
            }}
          >
            <Button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Typography>
              Page {page} of {total}
            </Typography>
            <Button
              disabled={page >= total}
              onClick={() => setPage((value) => value + 1)}
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
