const db = require('../config/db');

const getDashboard = async (req, res) => {
  // Frontend filter params: vehicle_type, status, trip_status, region, date_from, date_to.
  // `region` has no matching column in the schema yet, so it is accepted but ignored.
  const { vehicle_type, status, trip_status, date_from, date_to } = req.query;

  // ---- Vehicle aggregates (filtered by type/status) ----
  const vehicleConds = [];
  const vehicleParams = [];
  if (vehicle_type) { vehicleConds.push('vehicle_type = ?'); vehicleParams.push(vehicle_type); }
  if (status) { vehicleConds.push('status = ?'); vehicleParams.push(status); }
  const vehicleWhere = vehicleConds.length ? `WHERE ${vehicleConds.join(' AND ')}` : '';

  const [vehicleRows] = await db.query(`
    SELECT
      COUNT(*)                  AS totalVehicles,
      SUM(status = 'Available') AS availableVehicles,
      SUM(status = 'On Trip')   AS activeVehicles,
      SUM(status = 'In Shop')   AS vehiclesInMaintenance,
      SUM(status = 'Retired')   AS retiredVehicles
    FROM Vehicles
    ${vehicleWhere}
  `, vehicleParams);

  // ---- Trip aggregates (filtered by trip status / date range on start_time) ----
  const tripConds = [];
  const tripParams = [];
  if (trip_status) { tripConds.push('status = ?'); tripParams.push(trip_status); }
  if (date_from) { tripConds.push('start_time >= ?'); tripParams.push(date_from); }
  if (date_to) { tripConds.push('start_time <= ?'); tripParams.push(`${date_to} 23:59:59`); }
  const tripWhere = tripConds.length ? `WHERE ${tripConds.join(' AND ')}` : '';

  const [tripRows] = await db.query(`
    SELECT
      SUM(status = 'Dispatched') AS activeTrips,
      SUM(status = 'In Transit') AS inTransitTrips,
      SUM(status = 'Draft')      AS pendingTrips
    FROM Trips
    ${tripWhere}
  `, tripParams);

  const [driverRows] = await db.query(`
    SELECT COUNT(*) AS driversOnDuty
    FROM Drivers
    WHERE status = 'On Trip'
  `);

  // ---- Total fuel cost (filtered by date range on fuel_date) ----
  const fuelConds = [];
  const fuelParams = [];
  if (date_from) { fuelConds.push('fuel_date >= ?'); fuelParams.push(date_from); }
  if (date_to) { fuelConds.push('fuel_date <= ?'); fuelParams.push(date_to); }
  const fuelWhere = fuelConds.length ? `WHERE ${fuelConds.join(' AND ')}` : '';
  const [fuelRows] = await db.query(`
    SELECT COALESCE(SUM(cost), 0) AS totalFuelCost
    FROM FuelLogs
    ${fuelWhere}
  `, fuelParams);

  // ---- Total operational cost (Expenses, filtered by date range on expense_date) ----
  const expConds = [];
  const expParams = [];
  if (date_from) { expConds.push('expense_date >= ?'); expParams.push(date_from); }
  if (date_to) { expConds.push('expense_date <= ?'); expParams.push(date_to); }
  const expWhere = expConds.length ? `WHERE ${expConds.join(' AND ')}` : '';
  const [expenseRows] = await db.query(`
    SELECT COALESCE(SUM(amount), 0) AS totalOperationalCost
    FROM Expenses
    ${expWhere}
  `, expParams);

  // ---- Monthly expenses (current calendar month, independent of filters) ----
  const [monthRows] = await db.query(`
    SELECT COALESCE(SUM(amount), 0) AS monthlyExpenses
    FROM Expenses
    WHERE YEAR(expense_date) = YEAR(CURDATE())
      AND MONTH(expense_date) = MONTH(CURDATE())
  `);

  const v = vehicleRows[0] || {};
  const t = tripRows[0] || {};
  const d = driverRows[0] || {};

  const totalVehicles = Number(v.totalVehicles) || 0;
  const activeVehicles = Number(v.activeVehicles) || 0;
  const fleetUtilization = totalVehicles > 0
    ? ((activeVehicles / totalVehicles) * 100).toFixed(2)
    : '0.00';

  res.status(200).json({
    success: true,
    data: {
      activeVehicles,
      availableVehicles: Number(v.availableVehicles) || 0,
      vehiclesInMaintenance: Number(v.vehiclesInMaintenance) || 0,
      totalVehicles,
      activeTrips: Number(t.activeTrips) || 0,
      pendingTrips: Number(t.pendingTrips) || 0,
      driversOnDuty: Number(d.driversOnDuty) || 0,
      fleetUtilization: `${fleetUtilization}%`,
      totalFuelCost: Number(fuelRows[0].totalFuelCost) || 0,
      totalOperationalCost: Number(expenseRows[0].totalOperationalCost) || 0,
      monthlyExpenses: Number(monthRows[0].monthlyExpenses) || 0
    }
  });
};

module.exports = { getDashboard };
