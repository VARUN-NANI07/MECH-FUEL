const express = require('express');
const { body } = require('express-validator');
const {
    getAllFuelOrders,
    getAssignedFuelOrders,
    createFuelOrder,
    getUserFuelOrders,
    getFuelOrder,
    assignFuelOrder,
    updateFuelOrderStatus,
    deleteFuelOrder
} = require('../controllers/fuelOrderController');
const { authenticate } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

// Validation rules
const fuelOrderValidation = [
    body('fuelType')
        .isIn(['petrol', 'diesel'])
        .withMessage('Fuel type must be petrol or diesel'),
    
    body('quantity')
        .isFloat({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100 liters'),
    
    body('location.address')
        .notEmpty()
        .withMessage('Location address is required'),
    
    body('location.coordinates.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),
    
    body('location.coordinates.lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),
    
    body('deliveryNotes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Delivery notes cannot exceed 500 characters')
];

const statusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
        .withMessage('Invalid status')
];

// All routes require authentication
router.use(authenticate);

// Admin route to get all orders
router.get('/admin/all', getAllFuelOrders);
router.get('/assigned/me', getAssignedFuelOrders);

// User routes
router.post('/', fuelOrderValidation, handleValidationErrors, createFuelOrder);
router.get('/', getUserFuelOrders);
router.get('/:id', getFuelOrder);
router.patch('/:id/assign', assignFuelOrder);
router.patch('/:id/status', statusValidation, handleValidationErrors, updateFuelOrderStatus);
router.delete('/:id', deleteFuelOrder);

module.exports = router;