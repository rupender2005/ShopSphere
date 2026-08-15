import { useEffect, useState } from "react";
import {
  Box,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import adminService from "../../services/adminService";
const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const Orders = () => {
  const [o, setO] = useState([]);
  const load = () =>
    adminService
      .getOrders()
      .then((r) => setO(Array.isArray(r.data) ? r.data : []));
  useEffect(() => {
    load();
  }, []);
  const change = async (id, status) => {
    await adminService.updateOrderStatus(id, status);
    load();
  };
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Orders
      </Typography>
      {o.map((x) => (
        <Paper key={x._id} sx={{ p: 3, mb: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography fontWeight={800}>#{x._id.slice(-8)}</Typography>
              <Typography color="text.secondary">
                {x.user?.name} · {x.user?.email}
              </Typography>
              <Typography mt={1}>
                ₹{Number(x.totalAmount).toFixed(2)} ·{" "}
                {new Date(x.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Select
              size="small"
              value={x.orderStatus}
              onChange={(e) => change(x._id, e.target.value)}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Paper>
      ))}
    </Container>
  );
};
export default Orders;
