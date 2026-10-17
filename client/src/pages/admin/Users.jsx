import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import adminService from "../../services/adminService";
import Loader from "../../components/common/Loader";
import ApiError from "../../components/common/ApiError";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load users.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load, reloadKey]);

  const changeRole = async (userId, role) => {
    setBusyUserId(userId);
    setError("");
    setSuccess("");
    try {
      await adminService.updateUserRole(userId, role);
      await load();
      setSuccess(`User role updated to ${role}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to update this user’s role.");
    } finally {
      setBusyUserId("");
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.name || user.email}?`)) return;
    setBusyUserId(user._id);
    setError("");
    setSuccess("");
    try {
      await adminService.deleteUser(user._id);
      await load();
      setSuccess(`${user.name || "User"} was deleted.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this user.");
    } finally {
      setBusyUserId("");
    }
  };

  if (loading) return <Loader />;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Users
      </Typography>
      {error ? (
        <ApiError
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : (
        <>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
          {users.length === 0 ? (
            <Typography color="text.secondary">There are no users yet.</Typography>
          ) : (
            users.map((user) => (
              <Paper key={user._id} sx={{ p: 3, mb: 2 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  gap={2}
                >
                  <Box>
                    <Typography fontWeight={800}>
                      {user.name || "Unnamed"}
                    </Typography>
                    <Typography color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1}>
                    <Select
                      size="small"
                      aria-label={`Role for ${user.name || user.email}`}
                      value={user.role}
                      disabled={busyUserId === user._id}
                      onChange={(event) =>
                        changeRole(user._id, event.target.value)
                      }
                    >
                      <MenuItem value="User">User</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                    </Select>
                    {busyUserId === user._id && (
                      <Typography variant="body2" color="text.secondary" alignSelf="center">
                        Saving…
                      </Typography>
                    )}
                    {user.role !== "Admin" && (
                      <Button
                        color="error"
                        disabled={busyUserId === user._id}
                        onClick={() => removeUser(user)}
                      >
                        {busyUserId === user._id ? "Deleting…" : "Delete"}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}
        </>
      )}
    </Container>
  );
};

export default Users;
