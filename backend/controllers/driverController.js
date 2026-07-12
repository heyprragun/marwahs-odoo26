const db = require('../config/db');
const { DRIVER_STATUSES: STATUSES, DRIVER_ASSIGNABLE: ASSIGNABLE_STATUSES } = require('../utils/enums');
const { isValidDate, isExpired, isInEnum } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

const getAll = async (req, res) => {
  const { status } = req.query;
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

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT * FROM Drivers ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM Drivers ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Drivers WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Driver not found.' });
  }
  res.status(200).json({ success: true, data: rows[0] });
};

const create = async (req, res) => {
  const { name, license_number, license_expiry_date, phone, status = 'Available' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'name is required.' });
  }
  if (!license_number || !license_number.trim()) {
    return res.status(400).json({ success: false, message: 'license_number is required.' });
  }
  if (!license_expiry_date || !isValidDate(license_expiry_date)) {
    return res.status(400).json({ success: false, message: 'A valid license_expiry_date is required.' });
  }
  if (isExpired(license_expiry_date)) {
    return res.status(400).json({ success: false, message: 'Cannot register a driver with an expired license.' });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${STATUSES.join(', ')}` });
  }
  if (phone != null && phone.trim() && !/^[0-9+\-()\s]{6,20}$/.test(phone.trim())) {
    return res.status(400).json({ success: false, message: 'Invalid phone number.' });
  }

  const lic = license_number.trim();
  const [existing] = await db.query('SELECT id FROM Drivers WHERE license_number = ?', [lic]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'License number already exists.' });
  }

  const [result] = await db.query(
    `INSERT INTO Drivers (name, license_number, license_expiry_date, phone, status)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), lic, license_expiry_date, phone && phone.trim() ? phone.trim() : null, status]
  );

  const [rows] = await db.query('SELECT * FROM Drivers WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Driver created.', data: rows[0] });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, license_number, license_expiry_date, phone, status } = req.body;

  const [existing] = await db.query('SELECT * FROM Drivers WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Driver not found.' });
  }
  const cur = existing[0];

  const newLic = license_number != null ? license_number.trim() : cur.license_number;
  const newExpiry = license_expiry_date != null ? license_expiry_date : cur.license_expiry_date;
  const newStatus = status != null ? status : cur.status;

  if (!newLic) {
    return res.status(400).json({ success: false, message: 'license_number cannot be empty.' });
  }
  if (!STATUSES.includes(newStatus)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${STATUSES.join(', ')}` });
  }
  if (license_expiry_date != null && !isValidDate(license_expiry_date)) {
    return res.status(400).json({ success: false, message: 'Invalid license_expiry_date.' });
  }
  if (phone != null && phone.trim() && !/^[0-9+\-()\s]{6,20}$/.test(phone.trim())) {
    return res.status(400).json({ success: false, message: 'Invalid phone number.' });
  }

  // Business rule: expired or suspended drivers cannot be assigned (set to an assignable status)
  if (ASSIGNABLE_STATUSES.includes(newStatus) && isExpired(newExpiry)) {
    return res.status(400).json({ success: false, message: 'Cannot assign a driver with an expired license.' });
  }

  if (license_number != null && newLic !== cur.license_number) {
    const [dup] = await db.query('SELECT id FROM Drivers WHERE license_number = ? AND id <> ?', [newLic, id]);
    if (dup.length > 0) {
      return res.status(409).json({ success: false, message: 'License number already exists.' });
    }
  }

  await db.query(
    `UPDATE Drivers SET name = ?, license_number = ?, license_expiry_date = ?, phone = ?, status = ? WHERE id = ?`,
    [
      name != null ? (name.trim() || cur.name) : cur.name,
      newLic,
      newExpiry,
      phone != null ? (phone.trim() || null) : cur.phone,
      newStatus,
      id
    ]
  );

  const [rows] = await db.query('SELECT * FROM Drivers WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Driver updated.', data: rows[0] });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query('SELECT id FROM Drivers WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Driver not found.' });
  }
  try {
    await db.query('DELETE FROM Drivers WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete driver because they have associated trips or fuel logs.'
      });
    }
    throw err;
  }
  res.status(200).json({ success: true, message: 'Driver deleted.' });
};

module.exports = { getAll, getById, create, update, remove };
