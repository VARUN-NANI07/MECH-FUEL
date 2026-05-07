require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/utils/database');

const PORT = process.env.PORT || 5000;

// Basic environment validation to avoid runtime exceptions
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET is not set. Authentication tokens will fail. Set JWT_SECRET in your environment.');
}

if (process.env.JWT_EXPIRES_IN) {
    const v = String(process.env.JWT_EXPIRES_IN).trim().toLowerCase();
    if (!v || v === 'undefined' || v === 'null') {
        console.warn('⚠️  Warning: JWT_EXPIRES_IN appears invalid; using default value internally.');
    }
}

if (process.env.BCRYPT_ROUNDS && isNaN(parseInt(process.env.BCRYPT_ROUNDS, 10))) {
    console.warn('⚠️  Warning: BCRYPT_ROUNDS is not a number; using defaults');
}

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
