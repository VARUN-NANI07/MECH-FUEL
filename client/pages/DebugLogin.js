// src/pages/DebugLogin.js
import { useState } from "react";
import { Container, Box, Typography, TextField, Button, Paper, Stack, Alert } from "@mui/material";
import { authApi } from "../utils/api";

export default function DebugLogin() {
  const [email, setEmail] = useState("2310030341@klh.edu.in");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log("=== STARTING LOGIN DEBUG ===");
      console.log("Email:", email);
      console.log("Password:", password);

      const res = await authApi.login({ email, password });
      
      console.log("=== API RESPONSE ===");
      console.log("Full response:", res);
      console.log("Token:", res.data?.token);
      console.log("User object:", res.data?.user);
      console.log("User role:", res.data?.user?.role);
      
      setResponse(res);

      // Try to store manually
      console.log("=== STORING IN LOCALSTORAGE ===");
      localStorage.setItem("token", res.data?.token);
      localStorage.setItem("user", JSON.stringify(res.data?.user));
      
      console.log("=== STORED DATA ===");
      console.log("localStorage.token:", localStorage.getItem("token") ? "✓ EXISTS" : "✗ MISSING");
      console.log("localStorage.user:", localStorage.getItem("user"));
      
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("Parsed stored user:", storedUser);
      console.log("Stored user role:", storedUser?.role);
      
    } catch (err) {
      console.error("=== LOGIN ERROR ===");
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDatabase = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/debug/user/${email}`);
      const data = await res.json();
      console.log("=== DATABASE CHECK ===");
      console.log(data);
      setResponse({ database: data });
    } catch (err) {
      console.error("Database check error:", err);
      setError(err.message);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    console.log("LocalStorage cleared");
    alert("LocalStorage cleared! Refresh the page.");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Debug Login Flow
      </Typography>

      <Stack spacing={3}>
        {/* Check Database */}
        <Paper sx={{ p: 3, bgcolor: "#e8f4f8" }}>
          <Typography variant="h6" gutterBottom>
            Step 1: Check Database
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Verify what's actually stored in MongoDB
          </Typography>
          <Button variant="contained" onClick={handleCheckDatabase}>
            Check DB User Data
          </Button>
        </Paper>

        {/* Login Form */}
        <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            Step 2: Test Login API
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Logging in..." : "Login & Log Response"}
            </Button>
          </Box>
        </Paper>

        {/* Storage */}
        <Paper sx={{ p: 3, bgcolor: "#fff3cd" }}>
          <Typography variant="h6" gutterBottom>
            Step 3: Clear Storage
          </Typography>
          <Button variant="contained" color="error" onClick={handleClearStorage}>
            Clear All LocalStorage
          </Button>
        </Paper>

        {/* Results */}
        {error && (
          <Alert severity="error">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {response && (
          <Paper sx={{ p: 3, bgcolor: "#d4edda" }}>
            <Typography variant="h6" gutterBottom>
              Response Data (Check Console Too!)
            </Typography>
            <Box component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem", overflow: "auto", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(response, null, 2)}
            </Box>
          </Paper>
        )}

        {/* Instructions */}
        <Paper sx={{ p: 3, bgcolor: "#f0f0f0" }}>
          <Typography variant="h6" gutterBottom>
            Instructions:
          </Typography>
          <ul>
            <li>Open DevTools (F12) → Console tab</li>
            <li>Click "Check DB User Data" and see if role: "admin" exists in database</li>
            <li>Click "Clear All LocalStorage"</li>
            <li>Click "Login & Log Response" and enter password</li>
            <li>Look at console for the "=== API RESPONSE ===" section</li>
            <li>Check if "User role: admin" appears</li>
            <li>Then go to /debug page to see if frontend stores it</li>
          </ul>
        </Paper>
      </Stack>
    </Container>
  );
}
