import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import useAuthStore from "../../store/authStore";

const AuthRequiredDialog = ({ open, onClose, initialMode = "login", onAuthenticated }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState("");

  const login = useAuthStore((state) => state.login);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setSent(false);
    setLocalError("");
    clearError();
  };

  const handleClose = () => {
    setPassword("");
    setSent(false);
    setLocalError("");
    clearError();
    onClose();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLocalError("");
    try {
      await login({ email, password });
      onAuthenticated?.();
      handleClose();
    } catch (error) {
      setLocalError(error?.message || "Unable to sign in.");
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setLocalError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      setLocalError(error?.message || "Unable to send the reset link.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1 }}>
        <Typography variant="h5" fontWeight={800}>
          {mode === "login" ? "Sign in to continue" : "Reset your password"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {mode === "login"
            ? "Please sign in before adding products to your cart."
            : "Enter your email and we’ll send a secure password reset link."}
        </Typography>
        <IconButton
          aria-label="Close"
          onClick={handleClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {sent ? (
          <Stack spacing={2.5}>
            <Alert severity="success" icon={<LockResetOutlinedIcon />}>
              <strong>Reset link sent.</strong> If an account exists for {email}, check that inbox for the password reset email.
            </Alert>
            <Button variant="contained" fullWidth onClick={() => changeMode("login")}>
              Back to sign in
            </Button>
          </Stack>
        ) : mode === "login" ? (
          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2}>
              {(localError || storeError) && (
                <Alert severity="error">{localError || storeError}</Alert>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LoginOutlinedIcon />}
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>

              <Button
                variant="text"
                onClick={() => changeMode("reset")}
                sx={{ alignSelf: "center" }}
              >
                Forgot password?
              </Button>

              <Divider>or</Divider>

              <Button
                variant="outlined"
                fullWidth
                href="/signup"
                onClick={handleClose}
              >
                Create an account
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleForgotPassword}>
            <Stack spacing={2}>
              {(localError || storeError) && (
                <Alert severity="error">{localError || storeError}</Alert>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockResetOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LockResetOutlinedIcon />}
                disabled={isLoading}
              >
                {isLoading ? "Sending…" : "Send reset link"}
              </Button>

              <Button
                variant="text"
                onClick={() => changeMode("login")}
                sx={{ alignSelf: "center" }}
              >
                Back to sign in
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;
