import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fuelApi, mechApi } from '../utils/api';
import { LocalGasStation, Build, ArrowBack } from '@mui/icons-material';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [fuelOrders, setFuelOrders] = useState([]);
  const [mechRequests, setMechRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    if (user?.role === 'service_provider') {
      navigate('/provider/dashboard');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders...');
      const fuelRes = await fuelApi.getMyOrders();
      console.log('Fuel orders response:', fuelRes);
      const mechRes = await mechApi.getMyServices();
      console.log('Mechanical services response:', mechRes);
      
      setFuelOrders(fuelRes.data?.orders || []);
      setMechRequests(mechRes.data?.services || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, type) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      if (type === 'fuel') {
        await fuelApi.deleteOrder(orderId);
        setFuelOrders(fuelOrders.filter(o => o._id !== orderId));
      } else {
        await mechApi.deleteService(orderId);
        setMechRequests(mechRequests.filter(r => r._id !== orderId));
      }
      setError('Order deleted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      delivered: 'success',
      in_progress: 'info',
      assigned: 'info',
      cancelled: 'error'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  const getStatusLabel = (status) => {
    if (status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'delivered') {
      return 'success';
    }
    return status || 'pending';
  };

  const getServiceName = (serviceId) => {
    const names = {
      'battery_jumpstart': 'Battery Jumpstart',
      'tire_change': 'Tire Change',
      'lockout_service': 'Lockout Service',
      'tow_service': 'Tow Service',
      'fuel_delivery': 'Fuel Delivery',
      'engine_repair': 'Engine Repair',
      'other': 'Other Service'
    };
    return names[serviceId] || serviceId;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>My Dashboard</Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome, {user?.email || 'User'}
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tab} onChange={(e, val) => setTab(val)}>
              <Tab label={`Fuel Orders (${fuelOrders.length})`} icon={<LocalGasStation />} iconPosition="start" />
              <Tab label={`Service Requests (${mechRequests.length})`} icon={<Build />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Fuel Orders Tab */}
          {tab === 0 && (
            <Box>
              {fuelOrders.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <LocalGasStation sx={{ fontSize: 48, color: 'textSecondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>No fuel orders yet</Typography>
                  <Typography color="textSecondary" sx={{ mb: 3 }}>
                    Start by placing your first fuel order
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<LocalGasStation />}
                    onClick={() => navigate('/fuel')}
                  >
                    Order Fuel
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {fuelOrders.map((order) => (
                    <Grid item xs={12} key={order._id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {order.fuelType?.charAt(0).toUpperCase() + order.fuelType?.slice(1)} Order
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Order ID: {order._id?.substring(0, 8)}...
                              </Typography>
                            </Box>
                            <Chip
                              label={getStatusLabel(order.status)}
                              color={getStatusColor(order.status)}
                              variant="outlined"
                            />
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">Quantity</Typography>
                              <Typography variant="body1">{order.quantity} liters</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">Total Price</Typography>
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                ₹{parseFloat(order.totalAmount)?.toFixed(2) || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">Location</Typography>
                              <Typography variant="body1">{order.location?.address}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="textSecondary">Status</Typography>
                              <Chip label={getStatusLabel(order.status)} size="small" />
                            </Grid>
                            {order.deliveryNotes && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">Notes</Typography>
                                <Typography variant="body2">{order.deliveryNotes}</Typography>
                              </Grid>
                            )}
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="textSecondary">
                                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </Typography>
                                {order.status?.toLowerCase() !== 'completed' && order.status?.toLowerCase() !== 'delivered' && (
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteOrder(order._id, 'fuel')}
                                    disabled={loading}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Service Requests Tab */}
          {tab === 1 && (
            <Box>
              {mechRequests.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <Build sx={{ fontSize: 48, color: 'textSecondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>No service requests yet</Typography>
                  <Typography color="textSecondary" sx={{ mb: 3 }}>
                    Need mechanical help? Place a service request now
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Build />}
                    onClick={() => navigate('/mechanical')}
                  >
                    Request Service
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {mechRequests.map((request) => (
                    <Grid item xs={12} key={request._id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Service Request
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Order ID: {request._id?.substring(0, 8)}...
                              </Typography>
                            </Box>
                            <Chip
                              label={getStatusLabel(request.status)}
                              color={getStatusColor(request.status)}
                              variant="outlined"
                            />
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">Services</Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                {request.services?.map((service) => (
                                  <Chip
                                    key={service}
                                    label={getServiceName(service)}
                                    variant="outlined"
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </Grid>
                            {request.vehicleDetails && (
                              <>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="textSecondary">Vehicle</Typography>
                                  <Typography variant="body1">
                                    {request.vehicleDetails.year} {request.vehicleDetails.make} {request.vehicleDetails.model}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" color="textSecondary">License Plate</Typography>
                                  <Typography variant="body1">{request.vehicleDetails.licensePlate}</Typography>
                                </Grid>
                              </>
                            )}
                            {request.location && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">Location</Typography>
                                <Typography variant="body1">{request.location?.address}</Typography>
                              </Grid>
                            )}
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="textSecondary">
                                  Placed on {new Date(request.createdAt).toLocaleDateString()}
                                </Typography>
                                {request.status?.toLowerCase() !== 'completed' && request.status?.toLowerCase() !== 'delivered' && (
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteOrder(request._id, 'mechanical')}
                                    disabled={loading}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
