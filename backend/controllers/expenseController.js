const db = require('../config/db');
const { parsePagination } = require('../utils/pagination');
const { isValidDate } = require('../utils/validators');

const getAll = async (req, res) => {
  const { category, vehicle_id, trip_id } = req.query;
  const { page, limit, offset } = parsePagination(req.query);
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (vehicle_id) {
    conditions.push('vehicle_id = ?');
    params.push(vehicle_id);
  }
  if (trip_id) {
    conditions.push('trip_id = ?');
    params.push(trip_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT * FROM Expenses ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM Expenses ${where}`, params);
  const total = countRows[0].total;

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getById = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Expenses WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Expense not found.' });
  }
  res.status(200).json({ success: true, data: rows[0] });
};

const create = async (req, res) => {
  const { trip_id, vehicle_id, category, amount, expense_date, note } = req.body;

  if (!category) {
    return res.status(400).json({ success: false, message: 'category is required.' });
  }
  if (!['Fuel','Maintenance','Repairs','Insurance','Toll','Taxes','Misc'].includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid category. Allowed: Fuel, Maintenance, Repairs, Insurance, Toll, Taxes, Misc' });
  }
  if (amount == null || isNaN(amount) || Number(amount) < 0) {
    return res.status(400).json({ success: false, message: 'amount must be zero or positive.' });
  }
  if (!expense_date || !isValidDate(expense_date)) {
    return res.status(400).json({ success: false, message: 'A valid expense_date is required.' });
  }

  const [result] = await db.query(
    `INSERT INTO Expenses (trip_id, vehicle_id, category, amount, expense_date, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      trip_id != null ? trip_id : null,
      vehicle_id != null ? vehicle_id : null,
      category,
      amount,
      expense_date,
      note && note.trim() ? note.trim() : null
    ]
  );

  const [rows] = await db.query('SELECT * FROM Expenses WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Expense created.', data: rows[0] });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { trip_id, vehicle_id, category, amount, expense_date, note } = req.body;

  const [existing] = await db.query('SELECT * FROM Expenses WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Expense not found.' });
  }
  const cur = existing[0];

  const newCategory = category != null ? category : cur.category;
  const newAmount = amount != null ? amount : cur.amount;
  const newDate = expense_date != null ? expense_date : cur.expense_date;

  if (!['Fuel','Maintenance','Repairs','Insurance','Toll','Taxes','Misc'].includes(newCategory)) {
    return res.status(400).json({ success: false, message: 'Invalid category.' });
  }
  if (newAmount == null || isNaN(newAmount) || Number(newAmount) < 0) {
    return res.status(400).json({ success: false, message: 'amount must be zero or positive.' });
  }
  if (!newDate || !isValidDate(newDate)) {
    return res.status(400).json({ success: false, message: 'A valid expense_date is required.' });
  }

  await db.query(
    `UPDATE Expenses SET trip_id = ?, vehicle_id = ?, category = ?, amount = ?, expense_date = ?, note = ? WHERE id = ?`,
    [
      trip_id != null ? trip_id : cur.trip_id,
      vehicle_id != null ? vehicle_id : cur.vehicle_id,
      newCategory,
      newAmount,
      newDate,
      note != null ? (note.trim() || null) : cur.note,
      id
    ]
  );

  const [rows] = await db.query('SELECT * FROM Expenses WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Expense updated.', data: rows[0] });
};

const remove = async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query('SELECT id FROM Expenses WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Expense not found.' });
  }
  await db.query('DELETE FROM Expenses WHERE id = ?', [id]);
  res.status(200).json({ success: true, message: 'Expense deleted.' });
};

module.exports = { getAll, getById, create, update, remove };
