import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
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
  Divider,
} from "@mui/material";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import orderService from "../../services/orderService";
import { startRazorpayCheckout } from "../../utils/razorpayCheckout";
const Checkout = () => {
  const { cart, fetchCart } = useCartStore(),
    user = useAuthStore((s) => s.user),
    nav = useNavigate();
  const savedAddress = {
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "India",
  };
  const hasSavedAddress = Boolean(
    user?.address &&
      ["street", "city", "state", "postalCode"].some(
        (field) => user.address[field],
      ),
  );
  const [a, setA] = useState({
      ...savedAddress,
    }),
    [method, setMethod] = useState("Razorpay"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [pendingOrderId, setPendingOrderId] = useState("");
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
  const includedTax = Number(((subtotal * 18) / 118).toFixed(2));
  const total = Number(
    (subtotal + marketplaceFee + deliveryFee + codFee).toFixed(2),
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
        await fetchCart().catch(() => {});
        nav(`/order-success?id=${order._id}`);
        return;
      }
      setPendingOrderId(order._id);
      const result = await startRazorpayCheckout({ orderId: order._id, user });
      if (result.status === "paid") {
        await fetchCart().catch(() => {});
        nav(`/order-success?id=${order._id}`);
      } else if (result.status === "dismissed") {
        setError("Payment was closed. Your cart is saved; you can retry from this order.");
      } else {
        setError(result.error?.message || "Payment could not be completed.");
      }
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
      {pendingOrderId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your order is saved and your cart is still available. Retry payment from{" "}
          <Link to={`/orders/${pendingOrderId}`}>the order page</Link>.
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Shipping address
              </Typography>
              {hasSavedAddress && (
                <Typography variant="body2" color="text.secondary">
                  Saved from your profile
                </Typography>
              )}
            </Box>
            {hasSavedAddress && (
              <Button
                type="button"
                size="small"
                onClick={() => setA(savedAddress)}
              >
                Use saved address
              </Button>
            )}
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
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
          <Alert severity="info" sx={{ mt: 2 }}>
            If you close Razorpay before paying, your order stays pending and
            your cart stays saved. You can retry payment later from My orders.
            Stock is checked again when payment is confirmed.
          </Alert>
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
            <Typography>GST included in item prices</Typography>
            <Typography>{money(includedTax)}</Typography>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={busy || Boolean(pendingOrderId)}
          >
            {busy ? "Processing…" : pendingOrderId ? "Order created" : "Place order"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1.5}
          >
            GST is already included in item prices. Delivery is free on items worth ₹500 or more; COD includes a ₹25 handling fee.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
export default Checkout;
