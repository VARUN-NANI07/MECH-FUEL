// src/pages/Debug.js
import { useAuth } from "../context/AuthContext";
import { Container, Box, Typography, Button, Paper, Stack } from "@mui/material";

export default function DebugPage() {
  const { user, token, isAuthenticated, loading } = useAuth();

  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleShowStorage = () => {
    console.log("=== AUTH DEBUG ===");
    console.log("Token in context:", token);
    console.log("User in context:", user);
    console.log("User role:", user?.role);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Loading:", loading);
    console.log("localStorage token:", localStorage.getItem("token"));
    console.log("localStorage user:", localStorage.getItem("user"));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug Auth State
      </Typography>

      <Stack spacing={3}>
        <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            Current Auth State:
          </Typography>
          <Box component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem", overflow: "auto" }}>
            {JSON.stringify(
              {
                isAuthenticated,
                loading,
                user,
                hasToken: !!token,
              },
              null,
              2
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            LocalStorage Contents:
          </Typography>
          <Box component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem", overflow: "auto" }}>
            {JSON.stringify(
              {
                token: localStorage.getItem("token") ? "EXISTS" : "MISSING",
                user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
              },
              null,
              2
            )}
          </Box>
        </Paper>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleShowStorage}>
            Log to Console
          </Button>
          <Button variant="contained" color="error" onClick={handleClearStorage}>
            Clear All Storage & Reload
          </Button>
        </Stack>

        {user?.role === "admin" && (
          <Paper sx={{ p: 2, bgcolor: "#d4edda", border: "1px solid #28a745" }}>
            <Typography sx={{ color: "green", fontWeight: "bold" }}>
              ✓ Admin role detected!
            </Typography>
          </Paper>
        )}

        {user && user.role !== "admin" && (
          <Paper sx={{ p: 2, bgcolor: "#f8d7da", border: "1px solid #f5c6cb" }}>
            <Typography sx={{ color: "red" }}>
              ✗ User role is: "{user.role}" (not admin)
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
