const db = require('../config/db');

// Revenue proxy: $15 per planned km (kept in sync with dashboard KPI logic)
const REVENUE_PER_KM = 15;

const toChart = (label, labels, data, opts = {}) => ({
  labels,
  datasets: [{ label, data, ...opts }]
});

// Fuel Efficiency: km per litre per vehicle (bar)
// Aggregates each child table in a derived subquery first to avoid join fan-out (N x M rows).
const fuelEfficiency = async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      v.registration_number AS label,
      ROUND(t.distance / NULLIF(f.fuel, 0), 2) AS kmpl
    FROM Vehicles v
    LEFT JOIN (SELECT vehicle_id, SUM(actual_distance) AS distance FROM Trips WHERE actual_distance > 0 GROUP BY vehicle_id) t
      ON t.vehicle_id = v.id
    LEFT JOIN (SELECT vehicle_id, SUM(quantity) AS fuel FROM FuelLogs WHERE quantity > 0 GROUP BY vehicle_id) f
      ON f.vehicle_id = v.id
    WHERE t.distance IS NOT NULL AND f.fuel IS NOT NULL
    ORDER BY kmpl DESC
  `);

  res.status(200).json({
    success: true,
    data: toChart('Fuel Efficiency (km/l)', rows.map((r) => r.label), rows.map((r) => r.kmpl))
  });
};

// Fleet Utilization: trips started per month (line)
const fleetUtilization = async (req, res) => {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(start_time, '%Y-%m') AS month, COUNT(*) AS trips
    FROM Trips
    WHERE start_time IS NOT NULL
    GROUP BY month
    ORDER BY month
  `);

  res.status(200).json({
    success: true,
    data: toChart('Trips per Month', rows.map((r) => r.month), rows.map((r) => r.trips))
  });
};

// Vehicle ROI: return % per vehicle (bar)
// Each cost source is pre-aggregated in a derived subquery to avoid Cartesian fan-out.
const vehicleRoi = async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      v.registration_number AS label,
      v.acquisition_cost,
      COALESCE(t.distance, 0)          AS distance,
      COALESCE(f.fuel_cost, 0)         AS fuel_cost,
      COALESCE(m.maintenance_cost, 0)  AS maintenance_cost
    FROM Vehicles v
    LEFT JOIN (SELECT vehicle_id, SUM(planned_distance) AS distance FROM Trips GROUP BY vehicle_id) t
      ON t.vehicle_id = v.id
    LEFT JOIN (SELECT vehicle_id, SUM(cost) AS fuel_cost FROM FuelLogs GROUP BY vehicle_id) f
      ON f.vehicle_id = v.id
    LEFT JOIN (SELECT vehicle_id, SUM(cost) AS maintenance_cost FROM MaintenanceLogs GROUP BY vehicle_id) m
      ON m.vehicle_id = v.id
    ORDER BY label
  `);

  const roi = rows.map((r) => {
    const revenue = Number(r.distance) * REVENUE_PER_KM;
    const cost = Number(r.fuel_cost) + Number(r.maintenance_cost);
    const acq = Number(r.acquisition_cost);
    return acq > 0 ? Number((((revenue - cost) / acq) * 100).toFixed(2)) : null;
  });

  res.status(200).json({
    success: true,
    data: toChart('Vehicle ROI (%)', rows.map((r) => r.label), roi)
  });
};

// Operational Cost: total expense by category (pie)
const operationalCost = async (req, res) => {
  const [rows] = await db.query(`
    SELECT category AS label, SUM(amount) AS total
    FROM Expenses
    GROUP BY category
    ORDER BY total DESC
  `);

  res.status(200).json({
    success: true,
    data: toChart('Operational Cost', rows.map((r) => r.label), rows.map((r) => Number(r.total)))
  });
};

// Expense Summary: monthly expense trend (line)
const expenseSummary = async (req, res) => {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, SUM(amount) AS total
    FROM Expenses
    WHERE expense_date IS NOT NULL
    GROUP BY month
    ORDER BY month
  `);

  res.status(200).json({
    success: true,
    data: toChart('Monthly Expenses', rows.map((r) => r.month), rows.map((r) => Number(r.total)))
  });
};

// Trip Status Distribution: count of trips per status (pie/bar)
const tripStatus = async (req, res) => {
  const [rows] = await db.query(`SELECT status as label, COUNT(*) as total FROM Trips GROUP BY status`);
  const labels = rows.map((r) => r.label);
  const data = rows.map((r) => Number(r.total));
  res.status(200).json({ success: true, data: { labels, datasets: [{ label: 'Trips', data }] } });
};

module.exports = { fuelEfficiency, fleetUtilization, vehicleRoi, operationalCost, expenseSummary, tripStatus };
