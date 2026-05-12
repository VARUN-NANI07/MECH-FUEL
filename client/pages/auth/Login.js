import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { authApi } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.login({ email, password });
      
      console.log("LOGIN RESPONSE:", res); // Debug log
      console.log("User data:", res.data?.user); // Debug log

      // backend returns: { success, data: { token, user } }
      const token = res.data?.token;
      const user = res.data?.user;
      
      console.log("Extracted token:", token); // Debug log
      console.log("Extracted user:", user); // Debug log
      console.log("User role:", user?.role); // Debug log

      if (token && user) {
        login(user, token);
        console.log("Login context updated"); // Debug log
      } else if (token) {
        localStorage.setItem("token", token);
      }

      if (user?.role === 'admin') {
        console.log("Navigating to admin dashboard"); // Debug log
        navigate('/admin/dashboard');
      } else if (user?.role === 'service_provider') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      setError(err.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Login to Mech-Fuel
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >
          Login
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </Typography>
      </Box>
    </Container>
  );
}
