import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import env from "../../config/env";
const Checkout = () => {
  const { cart, fetchCart } = useCartStore(),
    user = useAuthStore((s) => s.user),
    nav = useNavigate();
  const [a, setA] = useState({
      name: user?.name || "",
      phone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "India",
    }),
    [method, setMethod] = useState("Razorpay"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!cart) fetchCart().catch(() => {});
  }, [cart, fetchCart]);
  if (!cart?.items?.length)
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4">Your cart is empty.</Typography>
      </Container>
    );
  const subtotal = Number(cart.totalPrice) || 0;
  const marketplaceFee = 5;
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const codFee = method === "COD" ? 25 : 0;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const total = Number(
    (subtotal + marketplaceFee + deliveryFee + codFee + tax).toFixed(2),
  );
  const money = (amount) => `₹${Number(amount).toFixed(2)}`;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await orderService.createOrder({
        shippingAddress: a,
        paymentMethod: method,
      });
      const order = r.data;
      if (method === "COD") {
        nav(`/order-success?id=${order._id}`);
        return;
      }
      const payment = await paymentService.createPaymentOrder(order._id);
      if (!env.razorpayKeyId)
        throw new Error("VITE_RAZORPAY_KEY_ID is not configured.");
      if (!window.Razorpay)
        throw new Error("Razorpay checkout script is not loaded.");
      const rp = new window.Razorpay({
        key: env.razorpayKeyId,
        amount: payment.data.amount,
        currency: payment.data.currency,
        name: "ShopSphere",
        description: `Order ${order._id}`,
        order_id: payment.data.orderId,
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            nav(`/order-success?id=${order._id}`);
          } catch (err) {
            setError(err.message);
          }
        },
      });
      rp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Checkout
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 5,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} mb={2}>
            Shipping address
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 2,
            }}
          >
            {Object.entries(a).map(([k, v]) => (
              <TextField
                key={k}
                label={
                  k === "postalCode"
                    ? "Postal code"
                    : k[0].toUpperCase() + k.slice(1)
                }
                value={v}
                onChange={(e) => setA({ ...a, [k]: e.target.value })}
                required
              />
            ))}
          </Box>
          <Typography variant="h6" fontWeight={800} mt={5} mb={1}>
            Payment
          </Typography>
          <FormControl>
            <RadioGroup
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <FormControlLabel
                value="Razorpay"
                control={<Radio />}
                label="Razorpay"
              />
              <FormControlLabel
                value="COD"
                control={<Radio />}
                label="Cash on Delivery"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: 1,
            height: "fit-content",
            position: { md: "sticky" },
            top: { md: 24 },
          }}
        >
          <Stack direction="row" justifyContent="space-between" mb={1.5}>
            <Typography>Items ({cart.totalItems})</Typography>
            <Typography>{money(subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mb={1.5}>
            <Typography>Marketplace fee</Typography>
            <Typography>{money(marketplaceFee)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mb={1.5}>
            <Typography>Delivery</Typography>
            <Typography color={deliveryFee === 0 ? "success.main" : undefined}>
              {deliveryFee === 0 ? "FREE" : money(deliveryFee)}
            </Typography>
          </Stack>
          {method === "COD" && (
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Typography>Cash on Delivery fee</Typography>
              <Typography>{money(codFee)}</Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography>GST (18%)</Typography>
            <Typography>{money(tax)}</Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" justifyContent="space-between" mb={2.5}>
            <Typography variant="h6" fontWeight={800}>
              Order total
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {money(total)}
            </Typography>
          </Stack>
          <Button type="submit" fullWidth variant="contained" disabled={busy}>
            {busy ? "Processing…" : "Place order"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1.5}
          >
            Delivery is free on items worth ₹500 or more. COD includes a ₹25 handling fee.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
export default Checkout;
