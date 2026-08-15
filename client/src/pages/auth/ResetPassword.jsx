import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import useAuthStore from "../../store/authStore";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [localError, setLocalError] = useState(
    token ? "" : "This password reset link is missing or invalid.",
  );

  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    clearError();

    if (!token) {
      setLocalError("This password reset link is missing or invalid.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      setLocalError(error?.message || "Unable to reset the password.");
    }
  };

  if (done) {
    return (
      <Stack spacing={2.5} alignItems="center" textAlign="center">
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
        <Typography variant="h4" fontWeight={800}>
          Password updated
        </Typography>
        <Alert severity="success" sx={{ width: "100%" }}>
          Your password has been changed successfully. Redirecting you to sign in…
        </Alert>
        <Button component={Link} to="/login" variant="contained" fullWidth>
          Sign in now
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LockResetOutlinedIcon color="primary" />
          <Typography variant="h4" fontWeight={800}>
            Choose a new password
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          Create a new password for your ShopSphere account.
        </Typography>
      </Stack>

      {(localError || storeError) && <Alert severity="error">{localError || storeError}</Alert>}

      <Stack component="form" onSubmit={submit} spacing={2}>
        <TextField
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          helperText="At least 8 characters"
          required
          autoFocus
        />
        <TextField
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
          {isLoading ? "Updating password…" : "Update password"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ResetPassword;
