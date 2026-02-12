import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Container,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { LocalGasStation, CheckCircle, Payment } from '@mui/icons-material';
import LocationPicker from '../../components/fuel/LocationPicker';
import { fuelApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const steps = ['Select Fuel Type', 'Enter Location', 'Payment Method', 'Confirm Order'];

export default function FuelOrder() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [fuelType, setFuelType] = useState('petrol');
  // location is now an object: { address: string, coordinates: { lat, lng } }
  const [location, setLocation] = useState({ address: '', coordinates: null });
  const [quantity, setQuantity] = useState(5);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState(3.5);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [error, setError] = useState(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrice = (type) => {
    const prices = {
      petrol: 108.45,
      diesel: 95.70
    };
    setPricePerLiter(prices[type]);
  };

  const handleCardDetailChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 0) fetchPrice(fuelType);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  // replaced axios call with fuelApi.createOrder
  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      setError('Please login to place an order');
      navigate('/login');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // prepare payload to match backend expectations
      const payload = {
        fuelType, // "petrol" | "diesel"
        quantity: Number(quantity),
        location: {
          address: location?.address || '',
          coordinates: location?.coordinates || null
        },
        deliveryNotes,
        totalPrice: Number(quantity) * pricePerLiter
      };

      await fuelApi.createOrder(payload);

      setOrderSubmitted(true);
      // Redirect to dashboard after successful order
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { message: 'Fuel order placed successfully!' }
        });
      }, 2000);
      // optionally reset steps or form here
      setActiveStep(0);
      setFuelType('petrol');
      setLocation({ address: '', coordinates: null });
      setQuantity(5);
      setDeliveryNotes('');
    } catch (err) {
      // fuelApi throws Error with message from apiRequest
      setError(err.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  // UI
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={orderSubmitted} autoHideDuration={4000} onClose={() => setOrderSubmitted(false)}>
        <Alert severity="success" onClose={() => setOrderSubmitted(false)}>
          Order successfully submitted!
        </Alert>
      </Snackbar>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 6 }}>
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              Select Your Fuel Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['petrol', 'diesel'].map((type) => (
                <Card
                  key={type}
                  onClick={() => {
                    setFuelType(type);
                    fetchPrice(type);
                  }}
                  sx={{
                    cursor: 'pointer',
                    border: fuelType === type ? '2px solid #1976d2' : '1px solid #ddd',
                    bgcolor: fuelType === type ? '#f0f7ff' : '#fff'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalGasStation sx={{ mr: 2 }} />
                    <Typography variant="h6">{type.charAt(0).toUpperCase() + type.slice(1)}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              Where Do You Need Fuel?
            </Typography>

            {/* LocationPicker should produce { address, coordinates } */}
            <LocationPicker onLocationSelect={setLocation} selectedLocation={location} />

            <TextField
              fullWidth
              label="Quantity (Liters)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              sx={{ mt: 3, mb: 3 }}
              error={quantity <= 0}
              helperText={quantity <= 0 && 'Quantity must be greater than 0'}
            />
            <TextField
              fullWidth
              label="Delivery Notes (Optional)"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <Payment sx={{ mr: 1 }} /> Select Payment Method
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="cash">Cash on Delivery</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === 'card' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Card Details</Typography>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.number}
                  onChange={(e) => handleCardDetailChange('number', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardDetailChange('expiry', e.target.value)}
                    placeholder="MM/YY"
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardDetailChange('cvv', e.target.value)}
                    placeholder="123"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => handleCardDetailChange('name', e.target.value)}
                  placeholder="John Doe"
                />
              </Box>
            )}

            {paymentMethod === 'paypal' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                You will be redirected to PayPal to complete your payment.
              </Alert>
            )}

            {paymentMethod === 'cash' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Please have cash ready when the fuel is delivered.
              </Alert>
            )}
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} /> Confirm Your Order
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Fuel Type:</Typography>
                  <Typography fontWeight="bold">{fuelType}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Quantity:</Typography>
                  <Typography fontWeight="bold">{quantity} liters</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Location:</Typography>
                  <Typography fontWeight="bold">{location?.address || '—'}</Typography>
                </Box>
                {deliveryNotes && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Delivery Notes:</Typography>
                    <Typography fontWeight="bold">{deliveryNotes}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Payment Method:</Typography>
                  <Typography fontWeight="bold">{paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Estimated Total:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{(Number(quantity) * pricePerLiter).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Typography variant="body2" color="text.secondary">
              By placing this order, you agree to our terms of service.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size="large"
          >
            Back
          </Button>

          <Button
            onClick={activeStep === steps.length - 1 ? handleSubmitOrder : handleNext}
            variant="contained"
            size="large"
            disabled={
              // disable Next/Place Order when invalid
              (activeStep === 1 && (!location || !location.address || quantity <= 0)) ||
              (activeStep === 2 && paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) ||
              submitting
            }
          >
            {activeStep === steps.length - 1 ? (submitting ? 'Placing...' : 'Place Order') : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
