import { Link, useSearchParams } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";
const OrderSuccess = () => {
  const [q] = useSearchParams();
  return (
    <Container sx={{ py: 12, textAlign: "center" }}>
      <Typography variant="h2" fontWeight={800}>
        Order placed 🎉
      </Typography>
      <Typography color="text.secondary" my={3}>
        Your order {q.get("id") || ""} has been created successfully.
      </Typography>
      <Button component={Link} to="/orders" variant="contained">
        View my orders
      </Button>
    </Container>
  );
};
export default OrderSuccess;
