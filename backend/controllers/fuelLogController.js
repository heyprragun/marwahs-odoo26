const db = require('../config/db');
const { parsePagination } = require('../utils/pagination');

const getAll = async (req, res) => {
  const { vehicle_id, driver_id } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = [];
  const params = [];

  if (vehicle_id) {
    conditions.push('vehicle_id = ?');
    params.push(vehicle_id);
  }
  if (driver_id) {
    conditions.push('driver_id = ?');
    params.push(driver_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT * FROM FuelLogs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM FuelLogs ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM FuelLogs WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Fuel log not found.' });
  }
  res.status(200).json({ success: true, data: rows[0] });
};

const create = async (req, res) => {
  const { vehicle_id, driver_id, quantity, cost, fuel_date, odometer_reading } = req.body;

  if (!vehicle_id || isNaN(vehicle_id)) {
    return res.status(400).json({ success: false, message: 'vehicle_id is required.' });
  }
  if (quantity == null || isNaN(quantity) || Number(quantity) <= 0) {
    return res.status(400).json({ success: false, message: 'quantity must be a positive number.' });
  }
  if (cost == null || isNaN(cost) || Number(cost) < 0) {
    return res.status(400).json({ success: false, message: 'cost must be zero or positive.' });
  }
  if (!fuel_date || !isValidDate(fuel_date)) {
    return res.status(400).json({ success: false, message: 'A valid fuel_date is required.' });
  }
  if (odometer_reading != null && (isNaN(odometer_reading) || Number(odometer_reading) < 0)) {
    return res.status(400).json({ success: false, message: 'odometer_reading must be zero or positive.' });
  }

  const [vehicles] = await db.query('SELECT id FROM Vehicles WHERE id = ?', [vehicle_id]);
  if (vehicles.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }

  const [result] = await db.query(
    `INSERT INTO FuelLogs (vehicle_id, driver_id, quantity, cost, fuel_date, odometer_reading)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      vehicle_id,
      driver_id != null ? driver_id : null,
      quantity,
      cost != null ? cost : 0,
      fuel_date,
      odometer_reading != null ? odometer_reading : null
    ]
  );

  const [rows] = await db.query('SELECT * FROM FuelLogs WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Fuel log created.', data: rows[0] });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { vehicle_id, driver_id, quantity, cost, fuel_date, odometer_reading } = req.body;

  const [existing] = await db.query('SELECT * FROM FuelLogs WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Fuel log not found.' });
  }
  const cur = existing[0];

  const newVehicleId = vehicle_id != null ? vehicle_id : cur.vehicle_id;
  const newQuantity = quantity != null ? quantity : cur.quantity;
  const newCost = cost != null ? cost : cur.cost;
  const newFuelDate = fuel_date != null ? fuel_date : cur.fuel_date;
  const newOdometer = odometer_reading != null ? odometer_reading : cur.odometer_reading;

  if (isNaN(newVehicleId)) {
    return res.status(400).json({ success: false, message: 'Invalid vehicle_id.' });
  }
  if (newQuantity == null || isNaN(newQuantity) || Number(newQuantity) <= 0) {
    return res.status(400).json({ success: false, message: 'quantity must be a positive number.' });
  }
  if (newCost == null || isNaN(newCost) || Number(newCost) < 0) {
    return res.status(400).json({ success: false, message: 'cost must be zero or positive.' });
  }
  if (!newFuelDate || !isValidDate(newFuelDate)) {
    return res.status(400).json({ success: false, message: 'A valid fuel_date is required.' });
  }
  if (newOdometer != null && (isNaN(newOdometer) || Number(newOdometer) < 0)) {
    return res.status(400).json({ success: false, message: 'odometer_reading must be zero or positive.' });
  }

  const [vehicles] = await db.query('SELECT id FROM Vehicles WHERE id = ?', [newVehicleId]);
  if (vehicles.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }

  await db.query(
    `UPDATE FuelLogs SET vehicle_id = ?, driver_id = ?, quantity = ?, cost = ?, fuel_date = ?, odometer_reading = ? WHERE id = ?`,
    [newVehicleId, driver_id != null ? driver_id : cur.driver_id, newQuantity, newCost, newFuelDate, newOdometer, id]
  );

  const [rows] = await db.query('SELECT * FROM FuelLogs WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Fuel log updated.', data: rows[0] });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query('SELECT id FROM FuelLogs WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Fuel log not found.' });
  }
  await db.query('DELETE FROM FuelLogs WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Fuel log deleted.' });
};

module.exports = { getAll, getById, create, update, remove };
