import { Box, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const tones = [
  { bg: "#eff6ff", accent: "#2563eb" },
  { bg: "#f5f3ff", accent: "#7c3aed" },
  { bg: "#ecfdf5", accent: "#059669" },
  { bg: "#fff7ed", accent: "#ea580c" },
  { bg: "#fef2f2", accent: "#dc2626" },
  { bg: "#f0fdfa", accent: "#0f766e" },
];

const CategoryCard = ({ category, index = 0 }) => {
  const tone = tones[index % tones.length];
  const name = category?.name || "Category";
  const description = category?.description || "Explore products in this category.";

  return (
    <Card
      component={Link}
      to={`/categories/${category?._id}`}
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 168,
        border: "1px solid",
        borderColor: "rgba(15,23,42,.08)",
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(145deg, #fff 0%, #fafafa 100%)",
        transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
        "&::after": {
          content: '""',
          position: "absolute",
          width: 88,
          height: 88,
          right: -26,
          top: -26,
          borderRadius: "50%",
          backgroundColor: tone.bg,
        },
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: "rgba(15,23,42,.14)",
          boxShadow: "0 18px 40px rgba(15,23,42,.10)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            bgcolor: tone.bg,
            color: tone.accent,
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            mb: 2,
            border: `1px solid ${tone.accent}22`,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Box>

        <Typography
          variant="h6"
          sx={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.25, mb: 0.75 }}
        >
          {name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        <Typography
          sx={{ mt: 1.8, fontSize: ".82rem", fontWeight: 800, color: tone.accent }}
        >
          Explore category →
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
