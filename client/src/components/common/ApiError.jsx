import { Alert, Button } from "@mui/material";

const ApiError = ({ message, onRetry }) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    }
  >
    {message || "We couldn’t load this information. Please try again."}
  </Alert>
);

export default ApiError;
