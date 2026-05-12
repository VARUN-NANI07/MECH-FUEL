import { AppBar, Toolbar, Typography, Button, Container, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LocalGasStation, Handyman } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Mech-Fuel
            </Link>
          </Typography>
          <Button 
            color="inherit" 
            component={Link} 
            to="/fuel"
            startIcon={<LocalGasStation />}
          >
            Fuel
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/mechanical"
            startIcon={<Handyman />}
          >
            Mechanical
          </Button>
          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={handleMenuOpen}>
                {user?.username || 'Account'}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleDashboard}>My Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
            >
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}