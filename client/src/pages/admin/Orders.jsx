import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import adminService from "../../services/adminService";
import Loader from "../../components/common/Loader";
import ApiError from "../../components/common/ApiError";

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load orders.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load, reloadKey]);

  const changeStatus = async (orderId, status) => {
    setBusyOrderId(orderId);
    setError("");
    setSuccess("");
    try {
      await adminService.updateOrderStatus(orderId, status);
      await load();
      setSuccess(`Order #${orderId.slice(-8)} updated to ${status}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to update this order.");
    } finally {
      setBusyOrderId("");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Orders
      </Typography>
      {error && (
        <Box sx={{ mb: 2 }}>
          <ApiError
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </Box>
      )}
      {success && !error && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {orders.length === 0 && !error ? (
        <Typography color="text.secondary">There are no orders yet.</Typography>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} sx={{ p: 3, mb: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ md: "center" }}
              gap={2}
            >
              <Box>
                <Typography fontWeight={800}>
                  Order #{order._id.slice(-8)}
                </Typography>
                <Typography color="text.secondary">
                  {order.user?.name || "Customer"} · {order.user?.email || ""}
                </Typography>
                <Typography mt={1}>
                  ₹{Number(order.totalAmount).toFixed(2)} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Select
                size="small"
                aria-label={`Order ${order._id.slice(-8)} status`}
                value={order.orderStatus}
                disabled={busyOrderId === order._id}
                onChange={(event) =>
                  changeStatus(order._id, event.target.value)
                }
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
              {busyOrderId === order._id && (
                <Typography variant="body2" color="text.secondary">
                  Saving status…
                </Typography>
              )}
            </Stack>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default Orders;
