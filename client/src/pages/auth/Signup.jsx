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

const Signup = () => {
  const { register, googleLogin, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState("");
  const redirect = new URLSearchParams(loc.search).get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) nav(redirect, { replace: true });
    return () => clearError();
  }, [clearError, isAuthenticated, nav, redirect]);

  const submit = async (event) => {
    event.preventDefault();
    setGoogleError("");
    try {
      await register({ name, email, password });
    } catch {}
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
            <Typography variant="h4" fontWeight={800}>Create your account</Typography>
            <Typography color="text.secondary">Join ShopSphere and start shopping.</Typography>
          </Stack>

          {(error || googleError) && <Alert severity="error">{googleError || error}</Alert>}

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={setGoogleError}
          />

          <Divider>or</Divider>

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} fullWidth />
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
                helperText="At least 8 characters"
              />
              <Button fullWidth variant="contained" type="submit" size="large" disabled={isLoading}>
                {isLoading ? "Creating account…" : "Create account"}
              </Button>
            </Stack>
          </Box>

          <Typography textAlign="center" color="text.secondary">
            Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Signup;
