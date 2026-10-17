import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductForm from "../../components/admin/ProductForm";
import Loader from "../../components/common/Loader";
import SafeImage from "../../components/common/SafeImage";
import ApiError from "../../components/common/ApiError";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [edit, setEdit] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts({ limit: 50 }),
        categoryService.getCategories(),
      ]);
      setProducts(productsResponse.data?.products || []);
      setCategories(
        Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [],
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load products.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load, reloadKey]);

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await productService.deleteProduct(id);
      await load();
      setSuccess("Product deleted.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this product.");
    } finally {
      setBusyId("");
    }
  };

  const saveProduct = async () => {
    setOpen(false);
    await load();
    setSuccess(edit ? "Product updated." : "Product added.");
  };

  if (loading) return <Loader />;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" mb={4} gap={2}>
        <Typography variant="h3" fontWeight={800}>
          Products
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          Add product
        </Button>
      </Stack>
      {error ? (
        <ApiError
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : (
        <>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
          <Box sx={{ display: "grid", gap: 2 }}>
            {products.length === 0 ? (
              <Typography color="text.secondary">No products yet. Add your first product.</Typography>
            ) : (
              products.map((product) => (
                <Paper
                  key={product._id}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <SafeImage
                    src={product.thumbnail || product.images?.[0]}
                    alt={`${product.name} product`}
                    sx={{
                      width: 70,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{product.name}</Typography>
                    <Typography color="text.secondary">
                      ₹{product.price} · Stock {product.stock}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={`Edit ${product.name}`}
                    onClick={() => {
                      setEdit(product);
                      setOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${product.name}`}
                    color="error"
                    disabled={busyId === product._id}
                    onClick={() => removeProduct(product._id)}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              ))
            )}
          </Box>
        </>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{edit ? "Edit" : "Add"} product</DialogTitle>
        <DialogContent>
          <ProductForm
            product={edit}
            categories={categories}
            onSaved={saveProduct}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
