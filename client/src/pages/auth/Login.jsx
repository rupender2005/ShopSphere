import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useAuthStore from "../../store/authStore";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";

const Login = () => {
  const { login, googleLogin, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState("");
  const redirect = loc.state?.from?.pathname || new URLSearchParams(loc.search).get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) nav(redirect, { replace: true });
    return () => clearError();
  }, [clearError, isAuthenticated, nav, redirect]);

  const submit = async (event) => {
    event.preventDefault();
    setGoogleError("");
    try {
      await login({ email, password });
    } catch (_) {}
  };

  const handleGoogleSuccess = async (credential) => {
    setGoogleError("");
    clearError();
    try {
      await googleLogin(credential);
    } catch (error) {
      setGoogleError(error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, sm: 8 } }}>
      <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h4" fontWeight={800}>Welcome back</Typography>
            <Typography color="text.secondary">Sign in to continue shopping on ShopSphere.</Typography>
          </Stack>

          {(error || googleError) && <Alert severity="error">{googleError || error}</Alert>}

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={setGoogleError}
          />

          <Divider>or</Divider>

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                fullWidth
              />
              <Button fullWidth variant="contained" type="submit" size="large" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`}>Create account</Link>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;
