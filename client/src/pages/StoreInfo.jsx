import { Link, useParams } from "react-router-dom";
import { Alert, Button, Container, Paper, Stack, Typography } from "@mui/material";

const pages = {
  shipping: {
    title: "Shipping",
    paragraphs: [
      "Delivery is free when the items subtotal is ₹500 or more. Below ₹500, the delivery fee is ₹50. Cash on Delivery adds a ₹25 handling fee; these charges are shown before you place the order.",
      "Open My orders to follow an order through Pending, Confirmed, Processing, Shipped, and Delivered. ShopSphere currently shows order status rather than an estimated delivery date.",
    ],
  },
  returns: {
    title: "Returns and cancellations",
    paragraphs: [
      "You can cancel an order from its details page before it is delivered. For a paid Razorpay order, ShopSphere requests a refund when the cancellation is accepted; the payment status shows whether that refund is pending or complete.",
      "This ShopSphere version does not yet have a post-delivery return request flow. Contact the store before relying on a return or exchange for a delivered item.",
    ],
  },
  privacy: {
    title: "Privacy overview",
    paragraphs: [
      "ShopSphere uses your account and profile details to sign you in, your saved address to prepare checkout, and cart and order details to provide shopping and order history.",
      "Google handles Google sign-in. Razorpay handles online payment entry and processing; ShopSphere stores the resulting order and payment status, not your card or bank credentials.",
    ],
  },
  terms: {
    title: "Terms of use",
    paragraphs: [
      "Product availability is checked when an order is placed and again when an online payment is confirmed. If an item is no longer available at payment confirmation, the payment is sent for refund and the order cannot be completed.",
      "The checkout shows the item subtotal, delivery fee, marketplace fee, and any Cash on Delivery fee before you place the order. GST is included in displayed item prices.",
    ],
  },
};

const StoreInfo = () => {
  const { topic } = useParams();
  const page = pages[topic];
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();

  if (!page && topic !== "contact") {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">This help page could not be found.</Alert>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Back to ShopSphere
        </Button>
      </Container>
    );
  }

  const title = topic === "contact" ? "Contact ShopSphere" : page.title;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h3" fontWeight={800} mb={3}>
          {title}
        </Typography>
        {topic === "contact" ? (
          <Stack spacing={2}>
            {supportEmail ? (
              <>
                <Typography color="text.secondary">
                  For help with an order, include its number so the store can find it.
                </Typography>
                <Button
                  component="a"
                  href={`mailto:${supportEmail}`}
                  variant="contained"
                  sx={{ alignSelf: "flex-start" }}
                >
                  Email {supportEmail}
                </Button>
              </>
            ) : (
              <Alert severity="info">
                The store has not configured a support email yet. For order
                updates, open My orders and select the order to view its status.
              </Alert>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {page.paragraphs.map((paragraph) => (
              <Typography key={paragraph} color="text.secondary" lineHeight={1.8}>
                {paragraph}
              </Typography>
            ))}
          </Stack>
        )}
        <Button component={Link} to="/products" sx={{ mt: 4 }}>
          Browse products
        </Button>
      </Paper>
    </Container>
  );
};

export default StoreInfo;
