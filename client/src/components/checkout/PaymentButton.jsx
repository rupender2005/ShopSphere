import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import { startRazorpayCheckout } from "../../utils/razorpayCheckout";

const PaymentButton = ({ orderId, onSuccess, fullWidth = false }) => {
  const user = useAuthStore((state) => state.user);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const pay = async () => {
    setBusy(true);
    setMessage("");

    try {
      const result = await startRazorpayCheckout({ orderId, user });
      if (result.status === "paid") {
        await fetchCart().catch(() => {});
        await onSuccess?.(result.order);
      } else if (result.status === "dismissed") {
        setMessage("Payment was closed. You can retry whenever you’re ready.");
      } else {
        setMessage(result.error?.message || "Payment could not be completed.");
      }
    } catch (error) {
      setMessage(error.message || "Unable to start payment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={1}>
      {message && <Alert severity="info">{message}</Alert>}
      <Button
        variant="contained"
        onClick={pay}
        disabled={busy}
        fullWidth={fullWidth}
      >
        {busy ? "Opening secure checkout…" : "Pay now"}
      </Button>
    </Stack>
  );
};

export default PaymentButton;
