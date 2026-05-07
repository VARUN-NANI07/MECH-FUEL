const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Validate configured expiresIn and return safe value
const resolveExpiresIn = (configured) => {
    if (!configured || typeof configured !== 'string') return '7d';
    const v = configured.trim().toLowerCase();
    if (!v || v === 'undefined' || v === 'null') return '7d';
    // Allow formats like '7d', '24h', '3600' (seconds) or numeric string
    return v;
};

// Generate JWT token
const generateToken = (payload, expiresIn) => {
    const finalExpires = resolveExpiresIn(expiresIn || process.env.JWT_EXPIRES_IN);
    try {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: finalExpires });
    } catch (e) {
        console.error('JWT generation error (expiresIn=', finalExpires, '):', e.message);
        throw e;
    }
};

// Verify JWT token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Hash password
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate random password
const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    generateRandomPassword
};