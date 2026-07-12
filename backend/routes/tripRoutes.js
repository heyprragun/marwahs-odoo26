const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// CREATE & DISPATCH TRIP WITH MANDATORY BUSINESS VALIDATIONS
router.post('/', authMiddleware, roleMiddleware(['Fleet Manager', 'Driver']), async (req, res) => {
  const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance } = req.body;

  // 1. Basic input validation
  if (!source || !destination || !vehicle_id || !driver_id || !cargo_weight || !planned_distance) {
    return res.status(400).json({ error: 'Missing mandatory trip creation fields.' });
  }

  try {
    // 2. Fetch vehicle details to run rules
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicle_id]);
    if (vehicles.length === 0) return res.status(404).json({ error: 'Vehicle not found.' });
    const vehicle = vehicles[0];

    // Business Rule Check: Retired or In Shop vehicles cannot take trips
    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop' || vehicle.status === 'On Trip') {
      return res.status(400).json({ error: `Vehicle is currently unavailable (Status: ${vehicle.status}).` });
    }

    // Business Rule Check: Weight must not exceed capacity[cite: 1]
    if (cargo_weight > vehicle.max_load_capacity) {
      return res.status(400).json({ error: `Cargo weight exceeds vehicle max load capacity of ${vehicle.max_load_capacity} kg.` });
    }

    // 3. Fetch driver details to run rules
    const [drivers] = await db.query('SELECT * FROM drivers WHERE id = ?', [driver_id]);
    if (drivers.length === 0) return res.status(404).json({ error: 'Driver not found.' });
    const driver = drivers[0];

    // Business Rule Check: Status checks[cite: 1]
    if (driver.status === 'Suspended' || driver.status === 'On Trip' || driver.status === 'Off Duty') {
      return res.status(400).json({ error: `Driver is currently unavailable (Status: ${driver.status}).` });
    }

    // Business Rule Check: Expired license validation[cite: 1]
    const today = new Date();
    const expiryDate = new Date(driver.license_expiry_date);
    if (expiryDate < today) {
      return res.status(400).json({ error: 'Cannot assign driver. Driving license has expired.' });
    }

    // 4. ATOMIC DATABASE OPERATION (Transaction setup for status shifting)[cite: 1]
    await db.query('START TRANSACTION');

    // Create the trip row
    const [tripResult] = await db.query(
      'INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status) VALUES (?, ?, ?, ?, ?, ?, "Dispatched")',
      [source, destination, vehicle_id, driver_id, cargo_weight, planned_distance]
    );

    // Automatically transition vehicle and driver to 'On Trip'[cite: 1]
    await db.query('UPDATE vehicles SET status = "On Trip" WHERE id = ?', [vehicle_id]);
    await db.query('UPDATE drivers SET status = "On Trip" WHERE id = ?', [driver_id]);

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Trip successfully dispatched.',
      tripId: tripResult.insertId
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error during trip creation.' });
  }
});

module.exports = router;