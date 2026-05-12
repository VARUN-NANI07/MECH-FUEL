// src/routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ⚠️ REMOVE THIS IN PRODUCTION
router.get('/debug/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            debug: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;
