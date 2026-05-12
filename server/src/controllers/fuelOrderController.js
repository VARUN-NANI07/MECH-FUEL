const FuelOrder = require('../models/FuelOrder');

const normalizeId = (value) => (value && value._id ? value._id.toString() : value ? value.toString() : null);

const canManageFuelOrder = (order, user) => {
    const ownerId = normalizeId(order.userId);
    const providerId = normalizeId(order.assignedProvider);
    const currentUserId = normalizeId(user.userId);

    return user.role === 'admin' || ownerId === currentUserId || providerId === currentUserId;
};

// Get all fuel orders (admin)
const getAllFuelOrders = async (req, res) => {
    try {
        const orders = await FuelOrder.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone');

        res.json({
            success: true,
            data: { orders, total: orders.length }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching fuel orders' 
        });
    }
};

// Get fuel orders assigned to the current provider
const getAssignedFuelOrders = async (req, res) => {
    try {
        const orders = await FuelOrder.find({ assignedProvider: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone')
            .populate('assignedProvider', 'username email phone role');

        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching assigned fuel orders'
        });
    }
};

// Create new fuel order
const createFuelOrder = async (req, res) => {
    try {
        const { fuelType, quantity, location, deliveryNotes, pricePerLiter, totalPrice } = req.body;
        
        // Use provided pricePerLiter and totalPrice if available
        const price = pricePerLiter || (fuelType === 'petrol' ? 108.45 : 95.70);
        const total = totalPrice || (quantity * price);

        const fuelOrder = await FuelOrder.create({
            userId: req.user.userId,
            fuelType,
            quantity,
            pricePerLiter: price,
            location,
            deliveryNotes,
            totalAmount: total
        });

        // Populate user details
        await fuelOrder.populate('userId', 'username email phone');

        res.status(201).json({
            success: true,
            message: 'Fuel order created successfully',
            data: { order: fuelOrder }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error creating fuel order' 
        });
    }
};

// Get user's fuel orders
const getUserFuelOrders = async (req, res) => {
    try {
        const orders = await FuelOrder.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username email phone');

        res.json({
            success: true,
            data: { orders }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching fuel orders' 
        });
    }
};

// Get single fuel order
const getFuelOrder = async (req, res) => {
    try {
        const order = await FuelOrder.findOne({
            _id: req.params.id,
            userId: req.user.userId
        }).populate('userId', 'username email phone');

        if (!order) {
            return res.status(404).json({ 
                success: false,
                error: 'Order not found' 
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching order' 
        });
    }
};

// Update fuel order status
const updateFuelOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await FuelOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false,
                error: 'Order not found' 
            });
        }

        if (!canManageFuelOrder(order, req.user)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this order'
            });
        }

        order.status = status;
        await order.save();

        await order.populate('userId', 'username email phone');
        await order.populate('assignedProvider', 'username email phone role');

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error updating order' 
        });
    }
};

// Assign a fuel order to a provider
const assignFuelOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can assign orders'
            });
        }

        const { assignedProvider, status = 'confirmed', estimatedDeliveryTime } = req.body;
        const order = await FuelOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        order.assignedProvider = assignedProvider || null;
        order.status = status;
        if (estimatedDeliveryTime) {
            order.estimatedDeliveryTime = estimatedDeliveryTime;
        }

        await order.save();
        await order.populate('userId', 'username email phone');
        await order.populate('assignedProvider', 'username email phone role');

        res.json({
            success: true,
            message: 'Order assigned successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error assigning order'
        });
    }
};

// Delete fuel order
const deleteFuelOrder = async (req, res) => {
    try {
        const order = await FuelOrder.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!order) {
            return res.status(404).json({ 
                success: false,
                error: 'Order not found' 
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error deleting order' 
        });
    }
};

module.exports = {
    getAllFuelOrders,
    getAssignedFuelOrders,
    createFuelOrder,
    getUserFuelOrders,
    getFuelOrder,
    assignFuelOrder,
    updateFuelOrderStatus,
    deleteFuelOrder
};