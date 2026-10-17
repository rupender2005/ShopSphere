import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Remove, ShoppingCart } from "@mui/icons-material";
import productService from "../../services/productService";
import reviewService from "../../services/reviewService";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import AuthRequiredDialog from "../../components/common/AuthRequiredDialog";
import Loader from "../../components/common/Loader";

const ProductDetail = () => {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    Promise.all([
      productService.getProduct(id),
      reviewService.getProductReviews(id),
    ])
      .then(([productResponse, reviewResponse]) => {
        setProduct(productResponse.data);
        setReviews(
          Array.isArray(reviewResponse.data) ? reviewResponse.data : [],
        );
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;

  if (!product) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || "Product not found"}</Alert>
      </Container>
    );
  }

  const price = product.discountPrice ?? product.price;

  const add = async () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setBusy(true);
    setError("");
    setCartNotice("");

    try {
      await addToCart(product._id, quantity);
      setCartNotice(
        quantity === 1 ? "Added to cart." : `${quantity} items added to cart.`,
      );
    } catch (requestError) {
      setError(
        requestError.message || "Unable to add this product to your cart.",
      );
    } finally {
      setBusy(false);
    }
  };

  const addAfterAuthentication = async () => {
    setBusy(true);
    setError("");
    setCartNotice("");

    try {
      await addToCart(product._id, quantity);
      setCartNotice(
        quantity === 1 ? "Added to cart." : `${quantity} items added to cart.`,
      );
    } catch (requestError) {
      setError(
        requestError.message || "Unable to add this product to your cart.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await reviewService.createReview(id, {
        rating,
        comment,
      });
      setReviews((current) => [response.data, ...current]);
      setComment("");
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your review.");
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Box
              component="img"
              src={
                product.thumbnail ||
                product.images?.[0] ||
                "https://placehold.co/700x700?text=ShopSphere"
              }
              alt={product.name}
              sx={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            />
            {product.imageAttributions?.[0] && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Photo by{" "}
                <a href={product.imageAttributions[0].photoUrl} target="_blank" rel="noreferrer">
                  {product.imageAttributions[0].photographer}
                </a>{" "}
                on <a href="https://www.pexels.com" target="_blank" rel="noreferrer">Pexels</a>
              </Typography>
            )}
          </Box>

          <Box>
            {product.brand && (
              <Typography
                color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: ".08em" }}
              >
                {product.brand}
              </Typography>
            )}

            <Typography variant="h3" fontWeight={800} my={1}>
              {product.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Rating
                value={Number(product.rating || 0)}
                precision={0.5}
                readOnly
              />
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews || reviews.length} reviews)
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight={800} my={3}>
              ₹{Number(price).toFixed(2)}
              {product.discountPrice != null && (
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    fontSize: "1rem",
                    ml: 1.5,
                  }}
                >
                  ₹{Number(product.price).toFixed(2)}
                </Typography>
              )}
            </Typography>

            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <IconButton
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => value - 1)}
                aria-label="Decrease quantity"
              >
                <Remove />
              </IconButton>

              <Typography
                sx={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}
              >
                {quantity}
              </Typography>

              <IconButton
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((value) => value + 1)}
                aria-label="Increase quantity"
              >
                <Add />
              </IconButton>

              <Button
                startIcon={<ShoppingCart />}
                variant="contained"
                onClick={add}
                disabled={busy || !product.stock}
                sx={{ ml: 1 }}
              >
                {busy
                  ? "Adding…"
                  : product.stock
                    ? "Add to cart"
                    : "Out of stock"}
              </Button>
            </Stack>

            {!isAuthenticated && (
              <Typography mt={2} variant="body2" color="text.secondary">
                You can browse freely. Sign in when you’re ready to add to your
                cart or post a review.
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 7 }} />

        <Typography variant="h4" fontWeight={800} mb={3}>
          Reviews
        </Typography>

        {isAuthenticated ? (
          <Box
            component="form"
            onSubmit={submitReview}
            sx={{ maxWidth: 650, mb: 5 }}
          >
            <Rating
              value={rating}
              onChange={(_, value) => value && setRating(value)}
            />
            <TextField
              label="Your review"
              multiline
              minRows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              sx={{ my: 2 }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              disabled={comment.trim().length < 5}
            >
              Submit review
            </Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4, maxWidth: 650 }}>
            Please <Link to={`/login?redirect=/products/${id}`}>sign in</Link>{" "}
            to write a review.
          </Alert>
        )}

        {reviews.length === 0 ? (
          <Typography color="text.secondary">
            No reviews yet. Be the first to review this product.
          </Typography>
        ) : (
          reviews.map((review) => (
            <Box
              key={review._id}
              sx={{
                mb: 3,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" gap={2}>
                <Typography fontWeight={700}>
                  {review.user?.name || "Customer"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ""}
                </Typography>
              </Stack>
              <Rating
                value={Number(review.rating || 0)}
                readOnly
                size="small"
              />
              <Typography mt={1}>{review.comment}</Typography>
            </Box>
          ))
        )}
      </Container>

      <Snackbar
        open={Boolean(cartNotice)}
        autoHideDuration={5000}
        onClose={() => setCartNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCartNotice("")}
          action={
            <Button component={Link} to="/cart" color="inherit" size="small">
              View cart
            </Button>
          }
        >
          {cartNotice}
        </Alert>
      </Snackbar>

      <AuthRequiredDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={addAfterAuthentication}
      />
    </>
  );
};

export default ProductDetail;
