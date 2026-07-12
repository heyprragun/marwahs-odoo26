const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Route Imports
const tripRoutes = require('./routes/tripRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

dotenv.config();
const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API Placements
app.use('/api/trips', tripRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback Global Error Catching Route
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke globally inside the server!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TransitOps server securely firing on port ${PORT}`);
});