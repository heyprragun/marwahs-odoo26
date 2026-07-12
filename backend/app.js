require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const tripRoutes = require('./routes/tripRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fuelLogRoutes = require('./routes/fuelLogRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- Rate limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);

// Stricter limit on auth endpoints to slow brute-force / abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// --- Health probe (infrastructure only, not a business API) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'TransitOps' });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fuel-logs', fuelLogRoutes);
app.use('/api/expenses', expenseRoutes);

// --- Centralized error handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
