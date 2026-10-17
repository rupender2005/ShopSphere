import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Delete, Remove } from "@mui/icons-material";
import useCartStore from "../../store/cartStore";
import Loader from "../../components/common/Loader";
import SafeImage from "../../components/common/SafeImage";
const Cart = () => {
  const { cart, isLoading, error, fetchCart, updateCartItem, removeFromCart } =
      useCartStore(),
    nav = useNavigate();
  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);
  if (isLoading && !cart) return <Loader fullScreen />;
  if (!cart?.items?.length)
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h3" fontWeight={800}>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" my={2}>
          Add something you love and it will appear here.
        </Typography>
        <Button component={Link} to="/products" variant="contained">
          Start shopping
        </Button>
      </Container>
    );
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Shopping cart
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 5,
        }}
      >
        <Box>
          {cart.items.map((i) => (
            <Box
              key={i.product._id}
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <SafeImage
                src={i.product.thumbnail || i.product.images?.[0]}
                alt={`${i.product.name} product`}
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  component={Link}
                  to={`/products/${i.product._id}`}
                  fontWeight={700}
                >
                  {i.product.name}
                </Typography>
                <Typography color="text.secondary">
                  ₹
                  {Number(i.product.discountPrice ?? i.product.price).toFixed(
                    2,
                  )}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1} mt={1}>
                  <IconButton
                    size="small"
                    aria-label={`Decrease quantity of ${i.product.name}`}
                    disabled={i.quantity <= 1}
                    onClick={() =>
                      updateCartItem(i.product._id, i.quantity - 1)
                    }
                  >
                    <Remove />
                  </IconButton>
                  <Typography>{i.quantity}</Typography>
                  <IconButton
                    size="small"
                    aria-label={`Increase quantity of ${i.product.name}`}
                    disabled={i.quantity >= i.product.stock}
                    onClick={() =>
                      updateCartItem(i.product._id, i.quantity + 1)
                    }
                  >
                    <Add />
                  </IconButton>
                </Stack>
              </Box>
              <IconButton
                color="error"
                aria-label={`Remove ${i.product.name} from cart`}
                onClick={() => removeFromCart(i.product._id)}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 1,
            height: "fit-content",
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Summary
          </Typography>
          <Stack direction="row" justifyContent="space-between" my={2}>
            <Typography>Items</Typography>
            <Typography>{cart.totalItems}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between" my={2}>
            <Typography variant="h6">Subtotal</Typography>
            <Typography variant="h6">
              ₹{Number(cart.totalPrice || 0).toFixed(2)}
            </Typography>
          </Stack>
          <Button
            fullWidth
            variant="contained"
            onClick={() => nav("/checkout")}
          >
            Checkout
          </Button>
          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};
export default Cart;
