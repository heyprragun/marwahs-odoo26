const db = require('../config/db');
const { TRIP_STATUSES } = require('../utils/enums');
const { isExpired, isInEnum } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

const getAll = async (req, res) => {
  const { status, vehicle_id, driver_id } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = [];
  const params = [];

  if (status) {
    if (!isInEnum(status, TRIP_STATUSES)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${TRIP_STATUSES.join(', ')}` });
    }
    conditions.push('status = ?');
    params.push(status);
  }
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
    `SELECT * FROM Trips ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM Trips ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const create = async (req, res) => {
  const { vehicle_id, driver_id, source, destination, cargo_weight, planned_distance } = req.body;

  if (!vehicle_id || isNaN(vehicle_id)) {
    return res.status(400).json({ success: false, message: 'vehicle_id is required.' });
  }
  if (!driver_id || isNaN(driver_id)) {
    return res.status(400).json({ success: false, message: 'driver_id is required.' });
  }
  if (!source || !source.trim() || !destination || !destination.trim()) {
    return res.status(400).json({ success: false, message: 'source and destination are required.' });
  }
  if (cargo_weight == null || isNaN(cargo_weight) || Number(cargo_weight) <= 0) {
    return res.status(400).json({ success: false, message: 'cargo_weight must be a positive number.' });
  }
  if (planned_distance == null || isNaN(planned_distance) || Number(planned_distance) <= 0) {
    return res.status(400).json({ success: false, message: 'planned_distance must be a positive number.' });
  }

  const [vehicles] = await db.query('SELECT id FROM Vehicles WHERE id = ?', [vehicle_id]);
  if (vehicles.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
  const [drivers] = await db.query('SELECT id FROM Drivers WHERE id = ?', [driver_id]);
  if (drivers.length === 0) {
    return res.status(404).json({ success: false, message: 'Driver not found.' });
  }

  const [result] = await db.query(
    `INSERT INTO Trips
       (vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Draft')`,
    [vehicle_id, driver_id, source.trim(), destination.trim(), cargo_weight, planned_distance]
  );

  const [rows] = await db.query('SELECT * FROM Trips WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Trip created as draft.', data: rows[0] });
};

const dispatch = async (req, res) => {
  const { id } = req.params;

  const [trips] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  if (trips.length === 0) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const trip = trips[0];
  if (trip.status !== 'Draft') {
    return res.status(409).json({ success: false, message: `Trip can only be dispatched from Draft (current: ${trip.status}).` });
  }

  const [vehicles] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [trip.vehicle_id]);
  const [drivers] = await db.query('SELECT * FROM Drivers WHERE id = ?', [trip.driver_id]);
  const vehicle = vehicles[0];
  const driver = drivers[0];

  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });

  if (Number(trip.cargo_weight) > Number(vehicle.max_load_capacity)) {
    return res.status(400).json({
      success: false,
      message: `Cargo weight (${trip.cargo_weight}) exceeds vehicle capacity (${vehicle.max_load_capacity}).`
    });
  }
  if (vehicle.status !== 'Available') {
    return res.status(400).json({ success: false, message: `Vehicle is not Available (current: ${vehicle.status}).` });
  }
  if (driver.status !== 'Available') {
    return res.status(400).json({ success: false, message: `Driver is not Available (current: ${driver.status}).` });
  }
  if (isExpired(driver.license_expiry_date)) {
    return res.status(400).json({ success: false, message: 'Driver license is expired.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE Trips SET status = 'Dispatched', start_time = NOW() WHERE id = ?",
      [id]
    );
    await conn.query("UPDATE Vehicles SET status = 'On Trip' WHERE id = ?", [trip.vehicle_id]);
    await conn.query("UPDATE Drivers SET status = 'On Trip' WHERE id = ?", [trip.driver_id]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Trip dispatched.', data: rows[0] });
};

const complete = async (req, res) => {
  const { id } = req.params;

  const [trips] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  if (trips.length === 0) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const trip = trips[0];
  if (!['Dispatched', 'In Transit'].includes(trip.status)) {
    return res.status(409).json({ success: false, message: `Trip can only be completed from Dispatched/In Transit (current: ${trip.status}).` });
  }

  const { actual_distance } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE Trips SET status = 'Completed', end_time = NOW(), actual_distance = ? WHERE id = ?",
      [actual_distance != null ? actual_distance : trip.actual_distance, id]
    );
    // Only revert if this trip still holds them On Trip (guards against clobbering other assignments)
    await conn.query("UPDATE Vehicles SET status = 'Available' WHERE id = ? AND status = 'On Trip'", [trip.vehicle_id]);
    await conn.query("UPDATE Drivers SET status = 'Available' WHERE id = ? AND status = 'On Trip'", [trip.driver_id]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Trip completed.', data: rows[0] });
};

const cancel = async (req, res) => {
  const { id } = req.params;

  const [trips] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  if (trips.length === 0) {
    return res.status(404).json({ success: false, message: 'Trip not found.' });
  }
  const trip = trips[0];
  if (['Completed', 'Cancelled'].includes(trip.status)) {
    return res.status(409).json({ success: false, message: `Trip cannot be cancelled (current: ${trip.status}).` });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE Trips SET status = 'Cancelled', end_time = NOW() WHERE id = ?",
      [id]
    );
    await conn.query("UPDATE Vehicles SET status = 'Available' WHERE id = ? AND status = 'On Trip'", [trip.vehicle_id]);
    await conn.query("UPDATE Drivers SET status = 'Available' WHERE id = ? AND status = 'On Trip'", [trip.driver_id]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const [rows] = await db.query('SELECT * FROM Trips WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Trip cancelled.', data: rows[0] });
};

module.exports = { getAll, create, dispatch, complete, cancel };
