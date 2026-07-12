const db = require('../config/db');
const { VEHICLE_TYPES, FUEL_TYPES, VEHICLE_STATUSES: STATUSES } = require('../utils/enums');
const { isValidDate, isInEnum } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

const currentYear = () => new Date().getFullYear();

const getAll = async (req, res) => {
  const { status, vehicle_type } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = [];
  const params = [];

  if (status) {
    if (!isInEnum(status, STATUSES)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${STATUSES.join(', ')}` });
    }
    conditions.push('status = ?');
    params.push(status);
  }
  if (vehicle_type) {
    if (!isInEnum(vehicle_type, VEHICLE_TYPES)) {
      return res.status(400).json({ success: false, message: `Invalid vehicle_type. Allowed: ${VEHICLE_TYPES.join(', ')}` });
    }
    conditions.push('vehicle_type = ?');
    params.push(vehicle_type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT * FROM Vehicles ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM Vehicles ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
  res.status(200).json({ success: true, data: rows[0] });
};

const create = async (req, res) => {
  const {
    registration_number, make, model, year, vehicle_type,
    max_load_capacity, fuel_type = 'Diesel', acquisition_cost,
    status = 'Available', last_maintenance_date
  } = req.body;

  if (!registration_number || !registration_number.trim()) {
    return res.status(400).json({ success: false, message: 'registration_number is required.' });
  }
  if (!vehicle_type || !VEHICLE_TYPES.includes(vehicle_type)) {
    return res.status(400).json({ success: false, message: `vehicle_type is required. Allowed: ${VEHICLE_TYPES.join(', ')}` });
  }
  if (max_load_capacity == null || isNaN(max_load_capacity) || Number(max_load_capacity) <= 0) {
    return res.status(400).json({ success: false, message: 'max_load_capacity must be a positive number.' });
  }
  if (fuel_type && !FUEL_TYPES.includes(fuel_type)) {
    return res.status(400).json({ success: false, message: `Invalid fuel_type. Allowed: ${FUEL_TYPES.join(', ')}` });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${STATUSES.join(', ')}` });
  }
  if (year != null && (isNaN(year) || year < 1900 || year > currentYear() + 1)) {
    return res.status(400).json({ success: false, message: 'Invalid year.' });
  }
  if (last_maintenance_date != null && !isValidDate(last_maintenance_date)) {
    return res.status(400).json({ success: false, message: 'Invalid last_maintenance_date.' });
  }
  if (acquisition_cost != null && (isNaN(acquisition_cost) || Number(acquisition_cost) < 0)) {
    return res.status(400).json({ success: false, message: 'acquisition_cost must be zero or positive.' });
  }

  const reg = registration_number.trim();
  const [existing] = await db.query('SELECT id FROM Vehicles WHERE registration_number = ?', [reg]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'Registration number already exists.' });
  }

  const [result] = await db.query(
    `INSERT INTO Vehicles
       (registration_number, make, model, year, vehicle_type, max_load_capacity, fuel_type, acquisition_cost, status, last_maintenance_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reg,
      make && make.trim() ? make.trim() : null,
      model && model.trim() ? model.trim() : null,
      year != null ? year : null,
      vehicle_type,
      max_load_capacity,
      fuel_type,
      acquisition_cost != null ? acquisition_cost : null,
      status,
      last_maintenance_date || null
    ]
  );

  const [rows] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Vehicle created.', data: rows[0] });
};

const update = async (req, res) => {
  const { id } = req.params;
  const {
    registration_number, make, model, year, vehicle_type,
    max_load_capacity, fuel_type, acquisition_cost, status, last_maintenance_date
  } = req.body;

  const [existing] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
  const cur = existing[0];

  const newReg = registration_number != null ? registration_number.trim() : cur.registration_number;
  const newType = vehicle_type != null ? vehicle_type : cur.vehicle_type;
  const newFuel = fuel_type != null ? fuel_type : cur.fuel_type;
  const newStatus = status != null ? status : cur.status;

  if (!newReg) {
    return res.status(400).json({ success: false, message: 'registration_number cannot be empty.' });
  }
  if (!VEHICLE_TYPES.includes(newType)) {
    return res.status(400).json({ success: false, message: `Invalid vehicle_type. Allowed: ${VEHICLE_TYPES.join(', ')}` });
  }
  if (!FUEL_TYPES.includes(newFuel)) {
    return res.status(400).json({ success: false, message: `Invalid fuel_type. Allowed: ${FUEL_TYPES.join(', ')}` });
  }
  if (!STATUSES.includes(newStatus)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${STATUSES.join(', ')}` });
  }
  if (max_load_capacity != null && (isNaN(max_load_capacity) || Number(max_load_capacity) <= 0)) {
    return res.status(400).json({ success: false, message: 'max_load_capacity must be a positive number.' });
  }
  if (year != null && (isNaN(year) || year < 1900 || year > currentYear() + 1)) {
    return res.status(400).json({ success: false, message: 'Invalid year.' });
  }
  if (last_maintenance_date != null && !isValidDate(last_maintenance_date)) {
    return res.status(400).json({ success: false, message: 'Invalid last_maintenance_date.' });
  }
  if (acquisition_cost != null && (isNaN(acquisition_cost) || Number(acquisition_cost) < 0)) {
    return res.status(400).json({ success: false, message: 'acquisition_cost must be zero or positive.' });
  }

  if (registration_number != null && newReg !== cur.registration_number) {
    const [dup] = await db.query('SELECT id FROM Vehicles WHERE registration_number = ? AND id <> ?', [newReg, id]);
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: 'Registration number already exists.' });
    }
  }

  await db.query(
    `UPDATE Vehicles SET
       registration_number = ?, make = ?, model = ?, year = ?, vehicle_type = ?,
       max_load_capacity = ?, fuel_type = ?, acquisition_cost = ?, status = ?, last_maintenance_date = ?
     WHERE id = ?`,
    [
      newReg,
      make != null ? (make.trim() || null) : cur.make,
      model != null ? (model.trim() || null) : cur.model,
      year != null ? year : cur.year,
      newType,
      max_load_capacity != null ? max_load_capacity : cur.max_load_capacity,
      newFuel,
      acquisition_cost != null ? acquisition_cost : cur.acquisition_cost,
      newStatus,
      last_maintenance_date != null ? last_maintenance_date : cur.last_maintenance_date,
      id
    ]
  );

  const [rows] = await db.query('SELECT * FROM Vehicles WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Vehicle updated.', data: rows[0] });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query('SELECT id FROM Vehicles WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
  try {
    await db.query('DELETE FROM Vehicles WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete vehicle because it has associated trips or records.'
      });
    }
    throw err;
  }
  res.status(200).json({ success: true, message: 'Vehicle deleted.' });
};

module.exports = { getAll, getById, create, update, remove };
