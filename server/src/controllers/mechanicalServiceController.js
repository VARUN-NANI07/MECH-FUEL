const MechanicalService = require('../models/MechanicalService');

const normalizeId = (value) => (value && value._id ? value._id.toString() : value ? value.toString() : null);

const canManageServiceRequest = (service, user) => {
    const ownerId = normalizeId(service.userId);
    const mechanicId = normalizeId(service.assignedMechanic);
    const currentUserId = normalizeId(user.userId);

    return user.role === 'admin' || ownerId === currentUserId || mechanicId === currentUserId;
};

// Service pricing configuration (in INR)
const SERVICE_PRICES = {
    'battery_jumpstart': 2075,      // 25 USD
    'tire_change': 3320,             // 40 USD
    'lockout_service': 2490,         // 30 USD
    'tow_service': 6225,             // 75 USD
    'fuel_delivery': 1245,           // 15 USD
    'engine_repair': 8300,           // 100 USD
    'other': 4150                    // 50 USD
};

// Get all service requests (admin)
const getAllServiceRequests = async (req, res) => {
    try {
        const services = await MechanicalService.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone')
            .populate('assignedMechanic', 'username email phone');

        res.json({
            success: true,
            data: { services, total: services.length }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching service requests'
        });
    }
};

// Get service requests assigned to the current mechanic/provider
const getAssignedServiceRequests = async (req, res) => {
    try {
        const services = await MechanicalService.find({ assignedMechanic: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone')
            .populate('assignedMechanic', 'username email phone role');

        res.json({
            success: true,
            data: { services }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching assigned service requests'
        });
    }
};

// Create new mechanical service request
const createServiceRequest = async (req, res) => {
    try {
        const { services, vehicleDetails, location, problemDescription } = req.body;
        
        // Validate services array
        if (!services || !Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one service must be selected'
            });
        }

        // Calculate total amount
        const totalAmount = services.reduce((total, service) => {
            return total + (SERVICE_PRICES[service] || 0);
        }, 0);

        const mechanicalService = await MechanicalService.create({
            userId: req.user.userId,
            services,
            vehicleDetails,
            location,
            problemDescription,
            totalAmount
        });

        // Populate user details
        await mechanicalService.populate('userId', 'username email phone');

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: { service: mechanicalService }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creating service request'
        });
    }
};

// Get user's service requests
const getUserServiceRequests = async (req, res) => {
    try {
        const services = await MechanicalService.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone')
            .populate('assignedMechanic', 'username email phone');

        res.json({
            success: true,
            data: { services }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching service requests'
        });
    }
};

// Get single service request
const getServiceRequest = async (req, res) => {
    try {
        const service = await MechanicalService.findOne({
            _id: req.params.id,
            userId: req.user.userId
        })
        .populate('userId', 'username email phone')
        .populate('assignedMechanic', 'username email phone');

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        res.json({
            success: true,
            data: { service }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching service request'
        });
    }
};

// Update service request status
const updateServiceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const service = await MechanicalService.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        if (!canManageServiceRequest(service, req.user)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this service request'
            });
        }

        service.status = status;
        await service.save();

        await service.populate('userId', 'username email phone');
        await service.populate('assignedMechanic', 'username email phone role');

        res.json({
            success: true,
            message: 'Service status updated successfully',
            data: { service }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error updating service request'
        });
    }
};

// Assign a service request to a mechanic/provider
const assignServiceRequest = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can assign service requests'
            });
        }

        const { assignedMechanic, status = 'assigned', estimatedCompletionTime } = req.body;
        const service = await MechanicalService.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        service.assignedMechanic = assignedMechanic || null;
        service.status = status;
        if (estimatedCompletionTime) {
            service.estimatedCompletionTime = estimatedCompletionTime;
        }

        await service.save();
        await service.populate('userId', 'username email phone');
        await service.populate('assignedMechanic', 'username email phone role');

        res.json({
            success: true,
            message: 'Service request assigned successfully',
            data: { service }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error assigning service request'
        });
    }
};

// Get available service types and prices
const getServiceTypes = async (req, res) => {
    try {
        const serviceTypes = Object.entries(SERVICE_PRICES).map(([service, price]) => ({
            service,
            name: formatServiceName(service),
            price
        }));

        res.json({
            success: true,
            data: { serviceTypes }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching service types'
        });
    }
};

// Delete service request
const deleteServiceRequest = async (req, res) => {
    try {
        const service = await MechanicalService.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        res.json({
            success: true,
            message: 'Service request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error deleting service request'
        });
    }
};

// Helper function to format service names
const formatServiceName = (service) => {
    const nameMap = {
        'battery_jumpstart': 'Battery Jumpstart',
        'tire_change': 'Tire Change',
        'lockout_service': 'Lockout Service',
        'tow_service': 'Tow Service',
        'fuel_delivery': 'Fuel Delivery',
        'engine_repair': 'Engine Repair',
        'other': 'Other Service'
    };
    return nameMap[service] || service;
};

module.exports = {
    getAllServiceRequests,
    getAssignedServiceRequests,
    createServiceRequest,
    getUserServiceRequests,
    getServiceRequest,
    assignServiceRequest,
    updateServiceStatus,
    getServiceTypes,
    deleteServiceRequest
};