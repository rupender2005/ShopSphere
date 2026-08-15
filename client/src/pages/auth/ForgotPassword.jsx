import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import useAuthStore from "../../store/authStore";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const verifyResetOtp = useAuthStore((state) => state.verifyResetOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const submitEmail = async (event) => {
    event.preventDefault();
    setLocalError("");
    setResendMessage("");
    clearError();

    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      setLocalError(error?.message || "Unable to send the reset email.");
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    setLocalError("");
    setResendMessage("");
    clearError();

    try {
      const response = await verifyResetOtp(email.trim(), otp.trim());
      const token = response?.data?.token;

      if (!token) {
        throw new Error("Reset verification did not return a valid reset token.");
      }

      navigate(`/reset-password/${token}`, { replace: true });
    } catch (error) {
      setLocalError(error?.message || "The OTP is invalid or expired.");
    }
  };

  const resendOtp = async () => {
    setLocalError("");
    setResendMessage("");
    clearError();

    try {
      await forgotPassword(email.trim());
      setResendMessage("A new OTP has been sent. The previous code is no longer valid.");
      setOtp("");
    } catch (error) {
      setLocalError(error?.message || "Unable to resend the OTP.");
    }
  };

  if (sent) {
    return (
      <Stack spacing={2.5}>
        <Stack spacing={1} alignItems="center" textAlign="center">
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 54 }} />
          <Typography variant="h4" fontWeight={800}>
            Check your inbox
          </Typography>
          <Typography color="text.secondary">
            We sent a six-digit OTP to <strong>{email}</strong>. It expires in 15 minutes.
          </Typography>
        </Stack>

        {resendMessage && <Alert severity="success">{resendMessage}</Alert>}
        {(localError || storeError) && <Alert severity="error">{localError || storeError}</Alert>}

        <Box component="form" onSubmit={submitOtp}>
          <Stack spacing={2}>
            <TextField
              label="6-digit OTP"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputProps={{ inputMode: "numeric", maxLength: 6 }}
              autoComplete="one-time-code"
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying…" : "Verify OTP"}
            </Button>
          </Stack>
        </Box>

        <Button variant="outlined" onClick={resendOtp} disabled={isLoading}>
          Resend OTP
        </Button>

        <Button
          variant="text"
          onClick={() => {
            setSent(false);
            setOtp("");
            setResendMessage("");
            setLocalError("");
          }}
        >
          Use a different email
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Remembered your password? <Link to="/login">Back to sign in</Link>
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LockResetOutlinedIcon color="primary" />
          <Typography variant="h4" fontWeight={800}>
            Reset your password
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          Enter your email and we’ll send a secure reset link plus a six-digit OTP.
        </Typography>
      </Stack>

      {(localError || storeError) && <Alert severity="error">{localError || storeError}</Alert>}

      <Box component="form" onSubmit={submitEmail}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
            {isLoading ? "Sending reset email…" : "Send reset email"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Remembered your password? <Link to="/login">Back to sign in</Link>
      </Typography>
    </Stack>
  );
};

export default ForgotPassword;
