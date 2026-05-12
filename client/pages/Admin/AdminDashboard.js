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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [fuelOrders, setFuelOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [fuelDrafts, setFuelDrafts] = useState({});
  const [serviceDrafts, setServiceDrafts] = useState({});

  useEffect(() => {
    if (!user) return;
    if (user.role === 'service_provider') {
      navigate('/dashboard');
    }
    if (user.role === 'user') {
      navigate('/dashboard');
    }
  }, [navigate, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResponse, fuelResponse, serviceResponse, providersResponse] = await Promise.all([
        userApi.getAllUsers(),
        fuelApi.getAllOrders(),
        mechApi.getAllRequests(),
        userApi.getProviders(),
      ]);

      const userItems = usersResponse?.data?.users || usersResponse?.users || [];
      const fuelItems = fuelResponse?.data?.orders || fuelResponse?.orders || [];
      const serviceItems = serviceResponse?.data?.services || serviceResponse?.services || [];
      const providerItems = providersResponse?.data?.providers || providersResponse?.providers || [];

      setUsers(userItems);
      setFuelOrders(fuelItems);
      setServiceRequests(serviceItems);
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

    return {
      totalUsers: users.length,
      totalFuel: fuelOrders.length,
      totalService: serviceRequests.length,
      pendingWork: fuelPending + servicePending,
      activeProviders: providers.length,
    };
  }, [users, fuelOrders, serviceRequests, providers]);

  const customerName = (item) => item?.userId?.username || item?.userId?.name || 'Customer';
  const customerEmail = (item) => item?.userId?.email || 'Not available';
  const customerPhone = (item) => item?.userId?.phone || 'Not available';

  const assignedName = (item, key) => {
    const assigned = item?.[key];
    return assigned?.username || assigned?.name || assigned?.email || 'Unassigned';
  };

  const renderUsers = () => (
    <Grid container spacing={2}>
      {users.map((account) => (
        <Grid item xs={12} md={6} key={account._id}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{account.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={formatStatus(account.role)}
                    color={account.role === 'admin' ? 'error' : account.role === 'service_provider' ? 'primary' : 'default'}
                  />
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
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                      <Typography variant="h6">Fuel Order</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customerName(order)}
                      </Typography>
                    </Box>
                    <Chip label={formatStatus(order.status)} color={getStatusColor(order.status)} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Customer email: {customerEmail(order)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer phone: {customerPhone(order)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {order.location?.address || order.address || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {assignedName(order, 'assignedProvider')}
                  </Typography>
                  <Divider />
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`fuel-provider-${order._id}`}>Assign provider</InputLabel>
                      <Select
                        labelId={`fuel-provider-${order._id}`}
                        label="Assign provider"
                        value={draft.assignedTo || ''}
                        onChange={(event) => setFuelDrafts((current) => ({
                          ...current,
                          [order._id]: { ...(current[order._id] || {}), assignedTo: event.target.value },
                        }))}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider._id} value={provider._id}>
                            {provider.username || provider.email}
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
                      onChange={(event) => setFuelDrafts((current) => ({
                        ...current,
                        [order._id]: { ...(current[order._id] || {}), status: event.target.value },
                      }))}
                    >
                      {fuelStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {formatStatus(status)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        setSavingId(order._id);
                        setError('');
                        try {
                          await fuelApi.assignOrder(order._id, {
                            assignedProvider: draft.assignedTo || null,
                            status: draft.status || 'pending',
                          });
                          await loadData();
                        } catch (saveError) {
                          setError(saveError?.message || 'Unable to update fuel order');
                        } finally {
                          setSavingId('');
                        }
                      }}
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
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                      <Typography variant="h6">Mechanical Request</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customerName(request)}
                      </Typography>
                    </Box>
                    <Chip label={formatStatus(request.status)} color={getStatusColor(request.status)} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Customer email: {customerEmail(request)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer phone: {customerPhone(request)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {request.location?.address || request.address || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {assignedName(request, 'assignedMechanic')}
                  </Typography>
                  <Divider />
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`service-provider-${request._id}`}>Assign mechanic</InputLabel>
                      <Select
                        labelId={`service-provider-${request._id}`}
                        label="Assign mechanic"
                        value={draft.assignedTo || ''}
                        onChange={(event) => setServiceDrafts((current) => ({
                          ...current,
                          [request._id]: { ...(current[request._id] || {}), assignedTo: event.target.value },
                        }))}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {providers.map((provider) => (
                          <MenuItem key={provider._id} value={provider._id}>
                            {provider.username || provider.email}
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
                      onChange={(event) => setServiceDrafts((current) => ({
                        ...current,
                        [request._id]: { ...(current[request._id] || {}), status: event.target.value },
                      }))}
                    >
                      {serviceStatusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {formatStatus(status)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        setSavingId(request._id);
                        setError('');
                        try {
                          await mechApi.assignRequest(request._id, {
                            assignedMechanic: draft.assignedTo || null,
                            status: draft.status || 'pending',
                          });
                          await loadData();
                        } catch (saveError) {
                          setError(saveError?.message || 'Unable to update service request');
                        } finally {
                          setSavingId('');
                        }
                      }}
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
      <Container maxWidth="xl" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mb: 4 }}>
        <StatCard label="Registered users" value={stats.totalUsers} helper="All accounts in the system" />
        <StatCard label="Fuel orders" value={stats.totalFuel} helper="All fuel requests" />
        <StatCard label="Service requests" value={stats.totalService} helper="All mechanical requests" />
        <StatCard label="Pending work" value={stats.pendingWork} helper="Requests waiting for action" />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)}>
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Fuel Orders (${fuelOrders.length})`} />
          <Tab label={`Service Requests (${serviceRequests.length})`} />
        </Tabs>
      </Box>

      {tab === 0 && renderUsers()}
      {tab === 1 && renderFuelOrders()}
      {tab === 2 && renderServiceRequests()}
    </Container>
  );
}
