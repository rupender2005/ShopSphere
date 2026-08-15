import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import userService from "../../services/userService";
import useAuthStore from "../../store/authStore";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      phone: user.phone || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      postalCode: user.address?.postalCode || "",
      country: user.address?.country || "India",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await userService.updateUser({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      });

      // The user service returns the backend response payload:
      // { success, message, data: updatedUser }.
      const updatedUser = response?.data || response;

      // Update the existing authenticated user in Zustand. The token is
      // intentionally preserved, so the user remains logged in.
      updateUser(updatedUser);

      // Return the user to the storefront after a successful profile update.
      navigate("/", { replace: true });
    } catch (serviceError) {
      setError(serviceError.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account permanently?")) return;

    try {
      await userService.deleteUser();
      await logout();
      navigate("/", { replace: true });
    } catch (serviceError) {
      setError(serviceError.message || "Failed to delete account");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" fontWeight={800} mb={3}>
          My profile
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            name="street"
            label="Street"
            value={form.street}
            onChange={handleChange}
          />
          <TextField
            name="city"
            label="City"
            value={form.city}
            onChange={handleChange}
          />
          <TextField
            name="state"
            label="State"
            value={form.state}
            onChange={handleChange}
          />
          <TextField
            name="postalCode"
            label="Postal code"
            value={form.postalCode}
            onChange={handleChange}
          />
          <TextField
            name="country"
            label="Country"
            value={form.country}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            sx={{ gridColumn: "1 / -1" }}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </Box>

        <Button color="error" onClick={handleDelete} sx={{ mt: 3 }}>
          Delete account
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;
