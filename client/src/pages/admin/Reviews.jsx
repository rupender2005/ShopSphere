import { Alert, Container, Typography } from "@mui/material";
const Reviews = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Typography variant="h3" fontWeight={800} mb={3}>
      Reviews
    </Typography>
    <Alert severity="info">
      The current backend exposes customer review CRUD, but it does not expose
      an admin-wide reviews endpoint. This page therefore does not pretend to
      provide unavailable admin functionality.
    </Alert>
  </Container>
);
export default Reviews;
