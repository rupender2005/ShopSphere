import { useEffect, useState } from "react";
import {
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
const AdminProducts = () => {
  const [p, setP] = useState([]),
    [c, setC] = useState([]),
    [edit, setEdit] = useState(null),
    [open, setOpen] = useState(false),
    [loading, setLoading] = useState(true);
  const load = () =>
    Promise.all([
      productService.getProducts({ limit: 50 }),
      categoryService.getCategories(),
    ])
      .then(([a, b]) => {
        setP(a.data?.products || []);
        setC(Array.isArray(b.data) ? b.data : []);
      })
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const del = async (id) => {
    if (confirm("Delete this product?")) {
      await productService.deleteProduct(id);
      load();
    }
  };
  if (loading) return <Loader />;
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
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
      <Box sx={{ display: "grid", gap: 2 }}>
        {p.map((x) => (
          <Paper
            key={x._id}
            sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}
          >
            <Box
              component="img"
              src={x.thumbnail || x.images?.[0] || "https://placehold.co/80"}
              sx={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>{x.name}</Typography>
              <Typography color="text.secondary">
                ₹{x.price} · Stock {x.stock}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setEdit(x);
                setOpen(true);
              }}
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => del(x._id)}>
              <Delete />
            </IconButton>
          </Paper>
        ))}
      </Box>
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
            categories={c}
            onSaved={() => {
              setOpen(false);
              load();
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};
export default AdminProducts;
