import { Link } from "react-router-dom";
import { Button, Container, Typography } from "@mui/material";
const NotFound = () => (
  <Container sx={{ py: 12, textAlign: "center" }}>
    <Typography variant="h1" fontWeight={900}>
      404
    </Typography>
    <Typography variant="h4" fontWeight={700} mb={2}>
      Page not found
    </Typography>
    <Typography color="text.secondary" mb={4}>
      The page you’re looking for doesn’t exist or has moved.
    </Typography>
    <Button component={Link} to="/" variant="contained">
      Back to ShopSphere
    </Button>
  </Container>
);
export default NotFound;
