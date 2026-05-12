const express = require('express');
const { body } = require('express-validator');
const {
    getAllServiceRequests,
    getAssignedServiceRequests,
    createServiceRequest,
    getUserServiceRequests,
    getServiceRequest,
    assignServiceRequest,
    updateServiceStatus,
    getServiceTypes,
    deleteServiceRequest
} = require('../controllers/mechanicalServiceController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validation rules
const serviceRequestValidation = [
    body('services')
        .isArray({ min: 1 })
        .withMessage('At least one service must be selected'),
    
    body('services.*')
        .isIn([
            'battery_jumpstart',
            'tire_change',
            'lockout_service',
            'tow_service',
            'fuel_delivery',
            'engine_repair',
            'other'
        ])
        .withMessage('Invalid service type'),
    
    body('location.address')
        .notEmpty()
        .withMessage('Location address is required'),
    
    body('location.coordinates.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),
    
    body('location.coordinates.lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),
    
    body('problemDescription')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Problem description cannot exceed 1000 characters')
];

const statusValidation = [
    body('status')
        .isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status')
];

// Public route (no auth required)
router.get('/types', optionalAuth, getServiceTypes);

// Protected routes
router.use(authenticate);

// Admin route to get all requests
router.get('/admin/all', getAllServiceRequests);
router.get('/assigned/me', getAssignedServiceRequests);

// User routes with file upload support
router.post(
    '/',
    upload.array('images', 5),
    serviceRequestValidation,
    handleUploadError,
    handleValidationErrors,
    createServiceRequest
);

router.get('/', getUserServiceRequests);
router.get('/:id', getServiceRequest);
router.patch('/:id/assign', assignServiceRequest);
router.patch('/:id/status', statusValidation, handleValidationErrors, updateServiceStatus);
router.delete('/:id', deleteServiceRequest);

module.exports = router;