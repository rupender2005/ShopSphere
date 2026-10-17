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
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import categoryService from "../../services/categoryService";
import Loader from "../../components/common/Loader";
import ApiError from "../../components/common/ApiError";

const Categories = () => {
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
      const response = await categoryService.getCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load categories.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load, reloadKey]);

  const removeCategory = async (id) => {
    if (!window.confirm("Deactivate this category?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await categoryService.deleteCategory(id);
      await load();
      setSuccess("Category deactivated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to deactivate this category.");
    } finally {
      setBusyId("");
    }
  };

  const saveCategory = async () => {
    setOpen(false);
    await load();
    setSuccess(edit ? "Category updated." : "Category created.");
  };

  if (loading) return <Loader />;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="row" justifyContent="space-between" mb={4} gap={2}>
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
          {categories.length === 0 ? (
            <Typography color="text.secondary">
              No categories yet. Add a category to organize products.
            </Typography>
          ) : (
            categories.map((category) => (
              <Paper
                key={category._id}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{category.name}</Typography>
                  <Typography color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Edit ${category.name}`}
                  onClick={() => {
                    setEdit(category);
                    setOpen(true);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  aria-label={`Deactivate ${category.name}`}
                  color="error"
                  disabled={busyId === category._id}
                  onClick={() => removeCategory(category._id)}
                >
                  <Delete />
                </IconButton>
              </Paper>
            ))
          )}
        </>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{edit ? "Edit" : "Add"} category</DialogTitle>
        <DialogContent>
          <CategoryForm category={edit} onSaved={saveCategory} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

const CategoryForm = ({ category, onSaved }) => {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (category) {
        await categoryService.updateCategory(category._id, {
          name,
          description,
        });
      } else {
        await categoryService.createCategory({ name, description });
      }
      await onSaved();
    } catch (requestError) {
      setError(requestError.message || "Unable to save this category.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ display: "grid", gap: 2, py: 2, minWidth: { sm: 360 } }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <TextField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        multiline
      />
      <Button type="submit" variant="contained" disabled={busy}>
        {busy ? "Saving category…" : "Save category"}
      </Button>
    </Box>
  );
};

export default Categories;
