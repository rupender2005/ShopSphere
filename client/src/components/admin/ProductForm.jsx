import { useState } from "react";
import { Alert, Box, Button, MenuItem, TextField } from "@mui/material";
import productService from "../../services/productService";

const ProductForm = ({ product, categories, onSaved }) => {
  const [values, setValues] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    discountPrice: product?.discountPrice ?? "",
    stock: product?.stock ?? 0,
    category: product?.category?._id || product?.category || "",
    brand: product?.brand || "",
    isFeatured: product?.isFeatured || false,
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const updateValue = (name, value) =>
    setValues((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([name, value]) => {
        if (value !== "" && value !== null) formData.append(name, value);
      });
      files.forEach((file) => formData.append("images", file));

      if (product) {
        await productService.updateProduct(product._id, formData);
      } else {
        await productService.createProduct(formData);
      }
      await onSaved();
    } catch (requestError) {
      setError(requestError.message || "Unable to save this product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ display: "grid", gap: 2, py: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        value={values.name}
        onChange={(event) => updateValue("name", event.target.value)}
        required
      />
      <TextField
        label="Description"
        multiline
        minRows={4}
        value={values.description}
        onChange={(event) => updateValue("description", event.target.value)}
        required
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <TextField
          label="Price"
          type="number"
          value={values.price}
          onChange={(event) => updateValue("price", event.target.value)}
          required
        />
        <TextField
          label="Discount price"
          type="number"
          value={values.discountPrice}
          onChange={(event) => updateValue("discountPrice", event.target.value)}
        />
        <TextField
          label="Stock"
          type="number"
          value={values.stock}
          onChange={(event) => updateValue("stock", event.target.value)}
          required
        />
        <TextField
          select
          label="Category"
          value={values.category}
          onChange={(event) => updateValue("category", event.target.value)}
          required
        >
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TextField
        label="Brand"
        value={values.brand}
        onChange={(event) => updateValue("brand", event.target.value)}
      />
      <TextField
        select
        label="Featured on home page"
        value={values.isFeatured ? "true" : "false"}
        onChange={(event) =>
          updateValue("isFeatured", event.target.value === "true")
        }
      >
        <MenuItem value="true">Yes</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </TextField>
      <Button component="label" variant="outlined">
        {files.length ? `${files.length} image(s) selected` : "Choose images"}
        <input
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
        />
      </Button>
      <Button type="submit" variant="contained" disabled={busy}>
        {busy ? "Saving product…" : "Save product"}
      </Button>
    </Box>
  );
};

export default ProductForm;
