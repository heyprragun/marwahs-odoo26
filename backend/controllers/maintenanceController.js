const db = require('../config/db');
const { MAINTENANCE_TYPES } = require('../utils/enums');
const { isValidDate, isInEnum } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

const getAll = async (req, res) => {
  const { vehicle_id, maintenance_type } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = [];
  const params = [];

  if (vehicle_id) {
    conditions.push('vehicle_id = ?');
    params.push(vehicle_id);
  }
  if (maintenance_type) {
    if (!isInEnum(maintenance_type, MAINTENANCE_TYPES)) {
      return res.status(400).json({ success: false, message: `Invalid maintenance_type. Allowed: ${MAINTENANCE_TYPES.join(', ')}` });
    }
    conditions.push('maintenance_type = ?');
    params.push(maintenance_type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT * FROM MaintenanceLogs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM MaintenanceLogs ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const create = async (req, res) => {
  const { vehicle_id, maintenance_type, description, cost, maintenance_date, odometer_reading } = req.body;

  if (!vehicle_id || isNaN(vehicle_id)) {
    return res.status(400).json({ success: false, message: 'vehicle_id is required.' });
  }
  if (!maintenance_type || !MAINTENANCE_TYPES.includes(maintenance_type)) {
    return res.status(400).json({ success: false, message: `maintenance_type is required. Allowed: ${MAINTENANCE_TYPES.join(', ')}` });
  }
  if (!maintenance_date || !isValidDate(maintenance_date)) {
    return res.status(400).json({ success: false, message: 'A valid maintenance_date is required.' });
  }
  if (cost != null && (isNaN(cost) || Number(cost) < 0)) {
    return res.status(400).json({ success: false, message: 'cost must be zero or positive.' });
  }
  if (odometer_reading != null && (isNaN(odometer_reading) || Number(odometer_reading) < 0)) {
    return res.status(400).json({ success: false, message: 'odometer_reading must be zero or positive.' });
  }

  const [vehicles] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [vehicle_id]);
  if (vehicles.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
  if (vehicles[0].status === 'Retired') {
    return res.status(400).json({ success: false, message: 'Cannot create maintenance for a Retired vehicle.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO MaintenanceLogs
         (vehicle_id, maintenance_type, description, cost, maintenance_date, odometer_reading)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        vehicle_id,
        maintenance_type,
        description && description.trim() ? description.trim() : null,
        cost != null ? cost : 0,
        maintenance_date,
        odometer_reading != null ? odometer_reading : null
      ]
    );
    await conn.query("UPDATE Vehicles SET status = 'In Shop' WHERE id = ?", [vehicle_id]);

    await conn.commit();

    const [rows] = await db.query('SELECT * FROM MaintenanceLogs WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Maintenance logged. Vehicle set to In Shop.', data: rows[0] });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const complete = async (req, res) => {
  const { id } = req.params;

  const [logs] = await db.query('SELECT * FROM MaintenanceLogs WHERE id = ?', [id]);
  if (logs.length === 0) {
    return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
  }
  const log = logs[0];

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Only revert if the vehicle is still In Shop for this maintenance
    const [result] = await conn.query(
      "UPDATE Vehicles SET status = 'Available', last_maintenance_date = ? WHERE id = ? AND status = 'In Shop'",
      [log.maintenance_date, log.vehicle_id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'Vehicle is not currently In Shop; cannot complete maintenance.'
      });
    }

    await conn.commit();
    return res.status(200).json({ success: true, message: 'Maintenance completed. Vehicle set to Available.' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { getAll, create, complete };
