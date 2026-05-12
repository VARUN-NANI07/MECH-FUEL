import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fuelApi, mechApi } from '../../utils/api';

const formatStatus = (status) =>
  String(status || 'pending')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'delivered':
      return 'success';
    case 'assigned':
    case 'confirmed':
      return 'primary';
    case 'in_progress':
    case 'dispatched':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const StatCard = ({ label, value, helper }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {helper}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [fuelOrders, setFuelOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    }
    if (user.role === 'user') {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fuelResponse, serviceResponse] = await Promise.all([
        fuelApi.getAssignedOrders(),
        mechApi.getAssignedRequests(),
      ]);

      setFuelOrders(fuelResponse?.data?.orders || fuelResponse?.orders || []);
      setServiceRequests(serviceResponse?.data?.services || serviceResponse?.services || []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load assigned work');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const fuelInProgress = fuelOrders.filter((item) => item.status !== 'delivered').length;
    const serviceInProgress = serviceRequests.filter((item) => item.status !== 'completed').length;

    return {
      fuelInProgress,
      serviceInProgress,
      totalAssigned: fuelOrders.length + serviceRequests.length,
      completed: fuelOrders.filter((item) => item.status === 'delivered').length + serviceRequests.filter((item) => item.status === 'completed').length,
    };
  }, [fuelOrders, serviceRequests]);

  const updateFuelStatus = async (orderId, status) => {
    setSavingId(orderId);
    setError('');
    try {
      await fuelApi.updateOrderStatus(orderId, { status });
      await loadData();
    } catch (updateError) {
      setError(updateError?.message || 'Unable to update fuel order');
    } finally {
      setSavingId('');
    }
  };

  const updateServiceStatus = async (requestId, status) => {
    setSavingId(requestId);
    setError('');
    try {
      await mechApi.updateRequestStatus(requestId, { status });
      await loadData();
    } catch (updateError) {
      setError(updateError?.message || 'Unable to update service request');
    } finally {
      setSavingId('');
    }
  };

  const renderFuelOrders = () => (
    <Grid container spacing={2}>
      {fuelOrders.map((order) => (
        <Grid item xs={12} md={6} key={order._id}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">Fuel Delivery</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customerName || order.name || 'Customer'}
                    </Typography>
                  </Box>
                  <Chip label={formatStatus(order.status)} color={getStatusColor(order.status)} />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Location: {order.location?.address || order.address || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notes: {order.notes || 'No additional instructions'}
                </Typography>
                <Divider />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" size="small" onClick={() => updateFuelStatus(order._id, 'confirmed')} disabled={savingId === order._id}>
                    Confirm
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => updateFuelStatus(order._id, 'dispatched')} disabled={savingId === order._id}>
                    Dispatched
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => updateFuelStatus(order._id, 'delivered')} disabled={savingId === order._id}>
                    Delivered
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderServiceRequests = () => (
    <Grid container spacing={2}>
      {serviceRequests.map((request) => (
        <Grid item xs={12} md={6} key={request._id}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">Mechanical Service</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {request.customerName || request.name || 'Customer'}
                    </Typography>
                  </Box>
                  <Chip label={formatStatus(request.status)} color={getStatusColor(request.status)} />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Location: {request.location?.address || request.address || 'Not provided'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Service: {request.serviceType || request.serviceName || 'General service'}
                </Typography>
                <Divider />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" size="small" onClick={() => updateServiceStatus(request._id, 'in_progress')} disabled={savingId === request._id}>
                    Start work
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => updateServiceStatus(request._id, 'completed')} disabled={savingId === request._id}>
                    Complete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Order Receiver Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Manage the work assigned to you and update each job as you move through it.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Assigned jobs" value={stats.totalAssigned} helper="Fuel and mechanical requests assigned to you" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Fuel active" value={stats.fuelInProgress} helper="Fuel orders still moving" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Service active" value={stats.serviceInProgress} helper="Mechanical jobs still open" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Completed" value={stats.completed} helper="Jobs already finished" />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)}>
                  <Tab label={`Fuel Work (${fuelOrders.length})`} />
                  <Tab label={`Service Work (${serviceRequests.length})`} />
                </Tabs>
                <Button variant="outlined" onClick={loadData}>
                  Refresh
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {tab === 0 ? renderFuelOrders() : renderServiceRequests()}
        </Stack>
      </Container>
    </Box>
  );
};

export default ProviderDashboard;
