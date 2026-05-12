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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fuelApi, mechApi, userApi } from '../../utils/api';

const fuelStatusOptions = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
const serviceStatusOptions = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [fuelOrders, setFuelOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [fuelDrafts, setFuelDrafts] = useState({});
  const [serviceDrafts, setServiceDrafts] = useState({});

  useEffect(() => {
    if (!user) return;
    if (user.role === 'service_provider') {
      navigate('/provider/dashboard');
    }
    if (user.role === 'user') {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fuelResponse, serviceResponse, providersResponse] = await Promise.all([
        fuelApi.getAllOrders(),
        mechApi.getAllRequests(),
        userApi.getProviders(),
      ]);

      const usersResponse = await userApi.getAllUsers();

      const fuelItems = fuelResponse?.data?.orders || fuelResponse?.orders || [];
      const serviceItems = serviceResponse?.data?.services || serviceResponse?.services || [];
      const providerItems = providersResponse?.data?.providers || providersResponse?.providers || [];
      const userItems = usersResponse?.data?.users || usersResponse?.users || [];

      setFuelOrders(fuelItems);
      setServiceRequests(serviceItems);
      setUsers(userItems);
      setProviders(providerItems);

      setFuelDrafts(
        fuelItems.reduce((accumulator, item) => {
          accumulator[item._id] = {
            assignedTo: item.assignedProvider?._id || '',
            status: item.status || 'pending',
          };
          return accumulator;
        }, {}),
      );

      setServiceDrafts(
        serviceItems.reduce((accumulator, item) => {
          accumulator[item._id] = {
            assignedTo: item.assignedMechanic?._id || '',
            status: item.status || 'pending',
          };
          return accumulator;
        }, {}),
      );
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const fuelPending = fuelOrders.filter((item) => item.status === 'pending').length;
    const servicePending = serviceRequests.filter((item) => item.status === 'pending').length;
    const activeProviders = providers.length;

    return {
      totalFuel: fuelOrders.length,
      totalService: serviceRequests.length,
      totalUsers: users.length,
      pendingWork: fuelPending + servicePending,
      activeProviders,
    };
  }, [fuelOrders, providers, serviceRequests, users]);

  const updateFuelDraft = (id, field, value) => {
    setFuelDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        [field]: value,
      },
    }));
  };

  const updateServiceDraft = (id, field, value) => {
    setServiceDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        [field]: value,
      },
    }));
  };

  const saveFuelOrder = async (orderId) => {
    const draft = fuelDrafts[orderId];
    setSavingId(orderId);
    setError('');
    try {
      await fuelApi.assignOrder(orderId, {
        assignedProvider: draft?.assignedTo || null,
        status: draft?.status || 'pending',
      });
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to update fuel order');
    } finally {
      setSavingId('');
    }
  };

  const saveServiceRequest = async (requestId) => {
    const draft = serviceDrafts[requestId];
    setSavingId(requestId);
    setError('');
    try {
      await mechApi.assignRequest(requestId, {
        assignedMechanic: draft?.assignedTo || null,
        status: draft?.status || 'pending',
      });
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'Unable to update service request');
    } finally {
      setSavingId('');
    }
  };

  const assignedName = (item, roleKey) => {
    const assigned = item?.[roleKey];
    if (!assigned) return 'Unassigned';
    return assigned.username || assigned.name || assigned.email || 'Assigned';
  };

  const customerName = (item) => item?.userId?.username || item?.userId?.name || item?.customerName || item?.name || 'Customer';

  const customerEmail = (item) => item?.userId?.email || item?.email || '';

  const customerPhone = (item) => item?.userId?.phone || item?.phone || '';

  const renderUsers = () => (
    <Grid container spacing={2}>
      {users.map((account) => (
        <Grid item xs={12} md={6} key={account._id}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="h6">{account.username || 'User'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.email}
                    </Typography>
                  </Box>
                  <Chip label={formatStatus(account.role)} color={account.role === 'admin' ? 'error' : account.role === 'service_provider' ? 'primary' : 'default'} />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Phone: {account.phone || 'Not available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active: {account.isActive ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Joined: {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'Unknown'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderFuelOrders = () => (
    <Grid container spacing={2}>
      {fuelOrders.map((order) => {
        const draft = fuelDrafts[order._id] || {};
        return (
          <Grid item xs={12} md={6} key={order._id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">Fuel Order</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customerName(order)}
                      </Typography>
                    </Box>
                    <Chip label={formatStatus(order.status)} color={getStatusColor(order.status)} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Customer email: {customerEmail(order) || 'Not available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer phone: {customerPhone(order) || 'Not available'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Location: {order.location?.address || order.address || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {assignedName(order, 'assignedProvider')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuel type: {order.fuelType || order.type || 'Standard'}
                  </Typography>

                  <Divider />

                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`fuel-provider-${order._id}`}>Assign provider</InputLabel>
                      <Select
                        labelId={`fuel-provider-${order._id}`}
                        label="Assign provider"
                        value={draft.assignedTo || ''}
                        onChange={(event) => updateFuelDraft(order._id, 'assignedTo', event.target.value)}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider._id} value={provider._id}>
                            {provider.username || provider.name || provider.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Status"
                      value={draft.status || order.status || 'pending'}
                      onChange={(event) => updateFuelDraft(order._id, 'status', event.target.value)}
                    >
                      {fuelStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {formatStatus(status)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="contained"
                      onClick={() => saveFuelOrder(order._id)}
                      disabled={savingId === order._id}
                    >
                      {savingId === order._id ? 'Saving...' : 'Save update'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  const renderServiceRequests = () => (
    <Grid container spacing={2}>
      {serviceRequests.map((request) => {
        const draft = serviceDrafts[request._id] || {};
        return (
          <Grid item xs={12} md={6} key={request._id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">Mechanical Request</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customerName(request)}
                      </Typography>
                    </Box>
                    <Chip label={formatStatus(request.status)} color={getStatusColor(request.status)} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Customer email: {customerEmail(request) || 'Not available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer phone: {customerPhone(request) || 'Not available'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Location: {request.location?.address || request.address || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {assignedName(request, 'assignedMechanic')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Service: {request.serviceType || request.serviceName || 'General service'}
                  </Typography>

                  <Divider />

                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`service-provider-${request._id}`}>Assign mechanic</InputLabel>
                      <Select
                        labelId={`service-provider-${request._id}`}
                        label="Assign mechanic"
                        value={draft.assignedTo || ''}
                        onChange={(event) => updateServiceDraft(request._id, 'assignedTo', event.target.value)}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider._id} value={provider._id}>
                            {provider.username || provider.name || provider.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Status"
                      value={draft.status || request.status || 'pending'}
                      onChange={(event) => updateServiceDraft(request._id, 'status', event.target.value)}
                    >
                      {serviceStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {formatStatus(status)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      variant="contained"
                      onClick={() => saveServiceRequest(request._id)}
                      disabled={savingId === request._id}
                    >
                      {savingId === request._id ? 'Saving...' : 'Save update'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
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
              Admin Operations Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Assign jobs, track progress, and manage both fuel and mechanical requests from one screen.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Fuel orders" value={stats.totalFuel} helper="All fuel requests in the system" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Mechanical requests" value={stats.totalService} helper="All repair and service requests" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Registered users" value={stats.totalUsers} helper="All user accounts in the system" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Pending work" value={stats.pendingWork} helper="Requests still waiting on action" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Active providers" value={stats.activeProviders} helper="Available staff to assign" />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)}>
                  <Tab label={`Users (${users.length})`} />
                  <Tab label={`Fuel Orders (${fuelOrders.length})`} />
                  <Tab label={`Mechanical Requests (${serviceRequests.length})`} />
                </Tabs>
                <Button variant="outlined" onClick={loadData}>
                  Refresh
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {tab === 0 ? renderUsers() : tab === 1 ? renderFuelOrders() : renderServiceRequests()}
        </Stack>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
