import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

const ErrorMessage = ({
  message = "Something went wrong.",
  severity = "error",
  title,
  onClose,
}) => {
  if (!message) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Collapse in={Boolean(message)}>
        <Alert
          severity={severity}
          onClose={onClose}
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
        >
          <Stack spacing={0.25}>
            {title && (
              <Typography variant="body2" fontWeight={600}>
                {title}
              </Typography>
            )}

            <Typography variant="body2">{message}</Typography>
          </Stack>
        </Alert>
      </Collapse>
    </motion.div>
  );
};

export default ErrorMessage;
