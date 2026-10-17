import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Rating,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import AuthRequiredDialog from "../common/AuthRequiredDialog";

const ProductCard = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);

  const addToCart = useCartStore((state) => state.addToCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const addItemToCart = async () => {
    setLoading(true);
    setCartFeedback(null);
    try {
      await addToCart(data._id, 1);
      setCartFeedback({ severity: "success", message: "Added to cart." });
    } catch (error) {
      setCartFeedback({
        severity: "error",
        message: error?.message || "Unable to add this product to your cart.",
      });
    } finally {
      setLoading(false);
    }
  };

  const price = data?.discountPrice ?? data?.price ?? 0;
  const hasDiscount = data?.discountPrice != null && Number(data.discountPrice) < Number(data.price);
  const image = data?.thumbnail || data?.images?.[0] || "https://placehold.co/800x700?text=ShopSphere";
  const imageCredit = data?.imageAttributions?.find((credit) => credit.imageNumber === 1);

  const add = async () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    await addItemToCart();
  };

  const addAfterAuthentication = addItemToCart;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(15,23,42,.08)",
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "#fff",
          transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            borderColor: "rgba(15,23,42,.14)",
            boxShadow: "0 18px 44px rgba(15,23,42,.11)",
            "& .product-media": { transform: "scale(1.045)" },
          },
        }}
      >
        <Box sx={{ position: "relative", bgcolor: "#f8fafc", overflow: "hidden" }}>
          <Link to={`/products/${data._id}`}>
            <CardMedia
              className="product-media"
              component="img"
              image={image}
              alt={data?.name || "Product"}
              sx={{
                aspectRatio: "1 / 1",
                objectFit: "cover",
                transition: "transform .28s ease",
              }}
            />
          </Link>

          {imageCredit && (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                right: 0,
                bottom: 0,
                left: 0,
                px: 1,
                py: 0.35,
                color: "#fff",
                bgcolor: "rgba(15, 23, 42, 0.72)",
                textAlign: "center",
                fontSize: "0.65rem",
              }}
            >
              Photo by{" "}
              <a
                href={imageCredit.photoUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {imageCredit.photographer}
              </a>{" "}
              on <a href="https://www.pexels.com" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>Pexels</a>
            </Typography>
          )}

          {hasDiscount && (
            <Chip
              label={`${Math.round((1 - Number(data.discountPrice) / Number(data.price)) * 100)}% OFF`}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: "#111827",
                color: "#fff",
                fontWeight: 800,
              }}
            />
          )}

          {data?.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                bgcolor: "rgba(255,255,255,.92)",
                backdropFilter: "blur(8px)",
                fontWeight: 800,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.35, flex: 1, p: 2.25 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}
            >
              {data?.brand || "ShopSphere"}
            </Typography>

            {data?.stock && data.stock <= 5 && (
              <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 800 }}>
                Only {data.stock} left
              </Typography>
            )}
          </Stack>

          <Typography
            component={Link}
            to={`/products/${data._id}`}
            variant="h6"
            fontWeight={800}
            sx={{
              color: "text.primary",
              fontSize: "1rem",
              lineHeight: 1.35,
              minHeight: 43,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              "&:hover": { color: "primary.main" },
            }}
          >
            {data?.name}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Rating value={Number(data?.rating || 0)} precision={0.5} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {Number(data?.rating || 0).toFixed(1)} ({data?.numReviews || 0})
            </Typography>
          </Stack>

          <Divider sx={{ my: 0.25 }} />

          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: "auto" }}>
            <Typography variant="h6" fontWeight={900}>
              ₹{Number(price).toLocaleString("en-IN")}
            </Typography>
            {hasDiscount && (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                ₹{Number(data.price).toLocaleString("en-IN")}
              </Typography>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={add}
            disabled={loading || !data?.stock}
            sx={{ mt: 0.5, borderRadius: 2.5, py: 1.1, fontWeight: 800 }}
          >
            {loading ? "Adding…" : data?.stock ? "Add to cart" : "Out of stock"}
          </Button>
        </CardContent>
      </Card>

      <AuthRequiredDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={addAfterAuthentication}
      />

      <Snackbar
        open={Boolean(cartFeedback)}
        autoHideDuration={5000}
        onClose={() => setCartFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={cartFeedback?.severity || "success"}
          variant="filled"
          onClose={() => setCartFeedback(null)}
          action={
            cartFeedback?.severity === "success" ? (
              <Button component={Link} to="/cart" color="inherit" size="small">
                View cart
              </Button>
            ) : undefined
          }
        >
          {cartFeedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
