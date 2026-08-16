import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import orderService from "../../services/orderService";
import Loader from "../../components/common/Loader";
const OrderDetail = () => {
  const { id } = useParams();
  const [o, setO] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    orderService
      .getOrder(id)
      .then((r) => setO(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <Loader fullScreen />;
  if (!o)
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || "Order not found"}</Alert>
      </Container>
    );
  const cancel = async () => {
    try {
      const r = await orderService.cancelOrder(id);
      setO(r.data);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4" fontWeight={800}>
          Order #{o._id.slice(-8)}
        </Typography>
        <Typography>{o.orderStatus}</Typography>
      </Stack>
      <Typography color="text.secondary" my={1}>
        {new Date(o.createdAt).toLocaleString()}
      </Typography>
      <Divider sx={{ my: 3 }} />
      {o.items?.map((i) => (
        <Stack
          key={i.product?._id || i.name}
          direction="row"
          justifyContent="space-between"
          sx={{ py: 2 }}
        >
          <Typography>
            {i.name} × {i.quantity}
          </Typography>
          <Typography>₹{Number(i.price * i.quantity).toFixed(2)}</Typography>
        </Stack>
      ))}
      <Divider sx={{ my: 2 }} />
      <Typography>Subtotal: ₹{Number(o.subtotal).toFixed(2)}</Typography>
      <Typography>Shipping: ₹{Number(o.shippingFee).toFixed(2)}</Typography>
      <Typography>Tax: ₹{Number(o.tax).toFixed(2)}</Typography>
      <Typography variant="h5" fontWeight={800} mt={2}>
        Total: ₹{Number(o.totalAmount).toFixed(2)}
      </Typography>
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography fontWeight={800}>Shipping to</Typography>
        <Typography>
          {o.shippingAddress.name}, {o.shippingAddress.phone}
        </Typography>
        <Typography>
          {o.shippingAddress.street}, {o.shippingAddress.city},{" "}
          {o.shippingAddress.state} - {o.shippingAddress.postalCode},{" "}
          {o.shippingAddress.country}
        </Typography>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Stack direction="row" gap={2} mt={3}>
        <Button component={Link} to="/orders">
          Back to orders
        </Button>
        {!["Delivered", "Cancelled"].includes(o.orderStatus) && (
          <Button color="error" onClick={cancel}>
            Cancel order
          </Button>
        )}
      </Stack>
    </Container>
  );
};
export default OrderDetail;
