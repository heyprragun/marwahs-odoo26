const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.get('/kpis', authMiddleware, async (req, res) => {
  try {
    // 1. Core Count Aggregations
    const [counts] = await db.query(`
      SELECT 
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as availableVehicles,
        SUM(CASE WHEN status = 'On Trip' THEN 1 ELSE 0 END) as activeVehicles,
        SUM(CASE WHEN status = 'In Shop' THEN 1 ELSE 0 END) as inMaintenanceVehicles,
        COUNT(*) as totalVehicles
      FROM vehicles
    `);

    const [trips] = await db.query(`
      SELECT 
        SUM(CASE WHEN status = 'Dispatched' THEN 1 ELSE 0 END) as activeTrips,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as pendingTrips
      FROM trips
    `);

    // 2. Complex Formula Calculations (ROI & Cost Profiling per Vehicle)[cite: 1]
    // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost[cite: 1]
    // Assume flat revenue metrics or arbitrary revenue per trip distance for simulation ($15 per km)
    const [roiStats] = await db.query(`
      SELECT 
        v.registration_number,
        v.model,
        IFNULL(SUM(f.cost), 0) as total_fuel_cost,
        IFNULL(SUM(m.cost), 0) as total_maintenance_cost,
        v.acquisition_cost,
        ((IFNULL(SUM(t.planned_distance), 0) * 15) - (IFNULL(SUM(f.cost), 0) + IFNULL(SUM(m.cost), 0))) / v.acquisition_cost * 100 as roi_percentage
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.id = f.vehicle_id
      LEFT JOIN maintenance_logs m ON v.id = m.vehicle_id
      LEFT JOIN trips t ON v.id = t.vehicle_id
      GROUP BY v.id
    `);

    const total = counts[0].totalVehicles || 1;
    const active = counts[0].activeVehicles || 0;
    const fleetUtilization = ((active / total) * 100).toFixed(2);

    res.status(200).json({
      kpis: {
        availableVehicles: counts[0].availableVehicles || 0,
        activeVehicles: active,
        inMaintenanceVehicles: counts[0].inMaintenanceVehicles || 0,
        activeTrips: trips[0].activeTrips || 0,
        pendingTrips: trips[0].pendingTrips || 0,
        fleetUtilization: `${fleetUtilization}%`
      },
      vehicleFinancialMetrics: roiStats
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to aggregate dynamic dashboard KPIs.' });
  }
});

module.exports = router;