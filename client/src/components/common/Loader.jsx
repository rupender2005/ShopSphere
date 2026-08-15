import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

const Loader = ({ size = 32, text = "Loading...", fullScreen = false }) => {
  const loader = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Stack alignItems="center" justifyContent="center" spacing={1.5}>
        <CircularProgress size={size} />

        {text && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
      </Stack>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {loader}
      </Stack>
    );
  }

  return loader;
};

export default Loader;
