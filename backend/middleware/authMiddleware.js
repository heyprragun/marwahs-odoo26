const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }

    const [users] = await db.query(
      'SELECT id, name, email, role, status FROM Users WHERE id = ?',
      [payload.id]
    );
    const user = users[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have the required permissions.'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
