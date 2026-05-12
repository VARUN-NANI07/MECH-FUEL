import { AppBar, Toolbar, Typography, Button, Container, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LocalGasStation, Handyman, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    if (user?.role === 'service_provider') {
      navigate('/provider/dashboard');
      return;
    }

    navigate('/dashboard');
    handleMenuClose();
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
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={<AccountCircle />}
              >
                {user?.username || user?.email?.split('@')[0] || 'Account'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
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