import { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import adminService from "../../services/adminService";
import Loader from "../../components/common/Loader";
const Dashboard = () => {
  const [s, setS] = useState(null);
  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((r) => setS(r.data))
      .catch(() => {});
  }, []);
  if (!s) return <Loader />;
  const cards = [
    ["Users", s.totalUsers],
    ["Products", s.totalProducts],
    ["Categories", s.totalCategories],
    ["Orders", s.totalOrders],
    ["Revenue", `₹${Number(s.totalRevenue || 0).toFixed(2)}`],
    ["Pending", s.pendingOrders],
  ];
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Store overview
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 3,
        }}
      >
        {cards.map(([k, v]) => (
          <Paper key={k} sx={{ p: 3 }}>
            <Typography color="text.secondary">{k}</Typography>
            <Typography variant="h4" fontWeight={800} mt={1}>
              {v}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};
export default Dashboard;
