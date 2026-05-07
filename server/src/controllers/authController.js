const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
const register = async (req, res) => {
    try {
        // Accept either `username` or `name` from the client
        const username = req.body.username || req.body.name;
        const { email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }

        // Hash password (use a safe default if env var is missing)
        const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(password, rounds);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone
        });

        // Generate token (use safe default for expiresIn)
        const configuredExpires = process.env.JWT_EXPIRES_IN;
        const expiresIn = (typeof configuredExpires === 'string' && configuredExpires.trim() && configuredExpires.trim().toLowerCase() !== 'undefined' && configuredExpires.trim().toLowerCase() !== 'null')
            ? configuredExpires.trim()
            : '7d';
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Server error during registration' 
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Generate token (use safe default for expiresIn)
        const configuredExpiresLogin = process.env.JWT_EXPIRES_IN;
        const expiresInLogin = (typeof configuredExpiresLogin === 'string' && configuredExpiresLogin.trim() && configuredExpiresLogin.trim().toLowerCase() !== 'undefined' && configuredExpiresLogin.trim().toLowerCase() !== 'null')
            ? configuredExpiresLogin.trim()
            : '7d';
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: expiresInLogin }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Server error during login' 
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching profile' 
        });
    }
};

module.exports = {
    register,
    login,
    getProfile
};