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
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import categoryService from "../../services/categoryService";
const Categories = () => {
  const [c, setC] = useState([]),
    [edit, setEdit] = useState(null),
    [open, setOpen] = useState(false);
  const load = () =>
    categoryService
      .getCategories()
      .then((r) => setC(Array.isArray(r.data) ? r.data : []));
  useEffect(() => {
    load();
  }, []);
  const del = async (id) => {
    if (confirm("Deactivate this category?")) {
      await categoryService.deleteCategory(id);
      load();
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h3" fontWeight={800}>
          Categories
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          Add category
        </Button>
      </Stack>
      {c.map((x) => (
        <Paper
          key={x._id}
          sx={{ p: 2, mb: 2, display: "flex", alignItems: "center" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={700}>{x.name}</Typography>
            <Typography color="text.secondary">{x.description}</Typography>
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{edit ? "Edit" : "Add"} category</DialogTitle>
        <DialogContent>
          <CategoryForm
            category={edit}
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
const CategoryForm = ({ category, onSaved }) => {
  const [n, setN] = useState(category?.name || ""),
    [d, setD] = useState(category?.description || "");
  const submit = async (e) => {
    e.preventDefault();
    if (category)
      await categoryService.updateCategory(category._id, {
        name: n,
        description: d,
      });
    else await categoryService.createCategory({ name: n, description: d });
    onSaved();
  };
  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ display: "grid", gap: 2, py: 2 }}
    >
      <TextField
        label="Name"
        value={n}
        onChange={(e) => setN(e.target.value)}
        required
      />
      <TextField
        label="Description"
        value={d}
        onChange={(e) => setD(e.target.value)}
        multiline
      />
      <Button type="submit" variant="contained">
        Save
      </Button>
    </Box>
  );
};
export default Categories;
