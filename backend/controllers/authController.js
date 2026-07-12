const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['Admin', 'Fleet Manager', 'Driver', 'Dispatcher'];
const SALT_ROUNDS = 10;

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const userRole = role && ALLOWED_ROLES.includes(role) ? role : 'Driver';

    const [existing] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO Users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, userRole, phone || null, 'Active']
    );

    const token = generateToken({ id: result.insertId, email, role: userRole });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: { id: result.insertId, name, email, role: userRole, phone: phone || null }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const [users] = await db.query(
      'SELECT id, name, email, password_hash, role, status FROM Users WHERE email = ?',
      [email]
    );
    const user = users[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is not active.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
