const User = require('../models/User');
const FuelOrder = require('../models/FuelOrder');
const MechanicalService = require('../models/MechanicalService');

// Get user dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get counts for different statuses
        const [fuelOrders, mechanicalServices, user] = await Promise.all([
            FuelOrder.find({ userId }),
            MechanicalService.find({ userId }),
            User.findById(userId)
        ]);

        const stats = {
            user: {
                username: user.username,
                email: user.email,
                memberSince: user.createdAt
            },
            fuelOrders: {
                total: fuelOrders.length,
                pending: fuelOrders.filter(order => order.status === 'pending').length,
                delivered: fuelOrders.filter(order => order.status === 'delivered').length
            },
            mechanicalServices: {
                total: mechanicalServices.length,
                pending: mechanicalServices.filter(service => service.status === 'pending').length,
                completed: mechanicalServices.filter(service => service.status === 'completed').length
            },
            recentActivity: {
                fuelOrders: fuelOrders.slice(0, 5).map(order => ({
                    id: order._id,
                    type: 'fuel',
                    status: order.status,
                    date: order.createdAt,
                    amount: order.totalAmount
                })),
                services: mechanicalServices.slice(0, 5).map(service => ({
                    id: service._id,
                    type: 'service',
                    status: service.status,
                    date: service.createdAt,
                    amount: service.totalAmount
                }))
            }
        };

        // Sort recent activity by date
        stats.recentActivity.all = [...stats.recentActivity.fuelOrders, ...stats.recentActivity.services]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching dashboard statistics'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { phone, vehicleInfo } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { phone, vehicleInfo },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error updating profile'
        });
    }
};

// Get user's order history
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, type } = req.query;

        let query = { userId };
        if (type === 'fuel') {
            query = { userId, _id: { $exists: true } }; // Fuel orders
        }

        const [fuelOrders, mechanicalServices] = await Promise.all([
            type !== 'service' ? FuelOrder.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('userId', 'username email') : [],
            
            type !== 'fuel' ? MechanicalService.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('userId', 'username email') : []
        ]);

        // Combine and sort all orders
        const allOrders = [
            ...fuelOrders.map(order => ({ ...order.toObject(), orderType: 'fuel' })),
            ...mechanicalServices.map(service => ({ ...service.toObject(), orderType: 'service' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: {
                orders: allOrders,
                currentPage: page,
                totalPages: Math.ceil(allOrders.length / limit),
                totalOrders: allOrders.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching order history'
        });
    }
};

// Get active service providers for admin assignment dropdowns
const getServiceProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'service_provider', isActive: true })
            .select('username email phone role createdAt')
            .sort({ username: 1 });

        res.json({
            success: true,
            data: { providers }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching service providers'
        });
    }
};

// Get all users for admin dashboard
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('username email phone role isActive createdAt updatedAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching users'
        });
    }
};

module.exports = {
    getDashboardStats,
    updateProfile,
    getOrderHistory,
    getServiceProviders,
    getAllUsers
};