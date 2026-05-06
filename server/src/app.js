const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

const defaultOrigins = [
    'http://localhost:3000',
    'https://mechfuel.me',
    'https://www.mechfuel.me',
];

const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
};

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per IP
});
app.use(limiter);

// CORS
app.use(cors(corsOptions));

// Ensure single-value ACAO header: override any comma-list coming from proxies
app.use((req, res, next) => {
    try {
        const reqOrigin = req.get('origin');
        if (reqOrigin && allowedOrigins.has(reqOrigin)) {
            // force a single matching origin value
            res.setHeader('Access-Control-Allow-Origin', reqOrigin);
        }
    } catch (e) {
        // swallow errors and continue
    }
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving (for uploads/images)
app.use('/public', express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', routes);

// Root health endpoint for platforms that probe '/'
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Mech-Fuel API running',
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
