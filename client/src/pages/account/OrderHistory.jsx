import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import orderService from "../../services/orderService";
import Loader from "../../components/common/Loader";
const OrderHistory = () => {
  const [o, setO] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    orderService
      .getMyOrders()
      .then((r) => setO(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader fullScreen />;
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        My orders
      </Typography>
      {!o.length ? (
        <Typography color="text.secondary">
          You haven't placed any orders yet.
        </Typography>
      ) : (
        o.map((x) => (
          <Paper key={x._id} sx={{ p: 3, mb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <BoxTitle id={x._id} />
              <Chip label={x.orderStatus} />
            </Stack>
            <Typography color="text.secondary" mt={1}>
              {new Date(x.createdAt).toLocaleString()}
            </Typography>
            <Typography fontWeight={700} mt={2}>
              ₹{Number(x.totalAmount).toFixed(2)}
            </Typography>
            <Button component={Link} to={`/orders/${x._id}`} sx={{ mt: 2 }}>
              View order
            </Button>
          </Paper>
        ))
      )}
    </Container>
  );
};
const BoxTitle = ({ id }) => (
  <Typography fontWeight={800}>Order #{id.slice(-8)}</Typography>
);
export default OrderHistory;
