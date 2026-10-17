import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import orderService from "../../services/orderService";
import Loader from "../../components/common/Loader";
import ApiError from "../../components/common/ApiError";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("We couldn’t find an order number for this confirmation.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await orderService.getOrder(orderId);
      setOrder(response.data);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your order summary.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder, reloadKey]);

  if (loading) return <Loader fullScreen text="Loading your order..." />;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack alignItems="center" textAlign="center" spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h2" fontWeight={800}>
          Order placed 🎉
        </Typography>
        {order ? (
          <Typography color="text.secondary">
            Thanks for shopping with ShopSphere. Your order is ready to track.
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Your order was submitted. You can find it in your order history.
          </Typography>
        )}
      </Stack>

      {error && (
        <ApiError
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      )}

      {order && (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            gap={1}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" fontWeight={800}>
              Order #{order._id.slice(-8)}
            </Typography>
            <Typography color="text.secondary">
              {order.paymentMethod === "COD" && order.paymentStatus === "Pending"
                ? "Cash on Delivery — pay when it arrives"
                : `Payment: ${order.paymentStatus}`}
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={1.5} sx={{ py: 2 }}>
            {order.items?.map((item, index) => (
              <Stack
                key={`${item.product?._id || item.name}-${index}`}
                direction="row"
                justifyContent="space-between"
                gap={2}
              >
                <Typography>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography>
                  ₹{Number(item.price * item.quantity).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={1} sx={{ py: 2 }}>
            <SummaryLine label="Items subtotal" amount={order.subtotal} />
            <SummaryLine label="Marketplace fee" amount={order.marketplaceFee} />
            <SummaryLine
              label="Delivery"
              amount={order.shippingFee}
              freeWhenZero
            />
            {Number(order.codFee) > 0 && (
              <SummaryLine label="Cash on Delivery fee" amount={order.codFee} />
            )}
            {order.taxIncluded && (
              <Typography variant="body2" color="text.secondary">
                GST is included in item prices.
              </Typography>
            )}
          </Stack>
          <Divider />
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ pt: 2 }}
          >
            <Typography variant="h6" fontWeight={800}>
              Order total
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              ₹{Number(order.totalAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center" gap={2}>
        {order && (
          <Button
            component={Link}
            to={`/orders/${order._id}`}
            variant="contained"
          >
            View order details
          </Button>
        )}
        <Button component={Link} to="/orders" variant={order ? "outlined" : "contained"}>
          View my orders
        </Button>
      </Stack>
    </Container>
  );
};

const SummaryLine = ({ label, amount, freeWhenZero = false }) => (
  <Stack direction="row" justifyContent="space-between" gap={2}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography>
      {freeWhenZero && Number(amount) === 0
        ? "FREE"
        : `₹${Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
    </Typography>
  </Stack>
);

export default OrderSuccess;
