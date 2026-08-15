import { useEffect, useState } from "react";
import {
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
const Users = () => {
  const [u, setU] = useState([]);
  const load = () =>
    adminService
      .getUsers()
      .then((r) => setU(Array.isArray(r.data) ? r.data : []));
  useEffect(() => {
    load();
  }, []);
  const role = async (id, r) => {
    await adminService.updateUserRole(id, r);
    load();
  };
  const del = async (id) => {
    if (confirm("Delete this user?")) {
      await adminService.deleteUser(id);
      load();
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Users
      </Typography>
      {u.map((x) => (
        <Paper key={x._id} sx={{ p: 3, mb: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography fontWeight={800}>{x.name || "Unnamed"}</Typography>
              <Typography color="text.secondary">{x.email}</Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Select
                size="small"
                value={x.role}
                onChange={(e) => role(x._id, e.target.value)}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
              {x.role !== "Admin" && (
                <Button color="error" onClick={() => del(x._id)}>
                  Delete
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Container>
  );
};
export default Users;
