const app = require('./app');
const db = require('./config/db');
const PORT = process.env.PORT || 5000;

// Fail fast on misconfiguration rather than surfacing errors on first request.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('FATAL: JWT_SECRET is missing or too short (min 16 chars). Set it in .env.');
  process.exit(1);
}

const start = async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connection OK');
  } catch (err) {
    console.error('FATAL: Cannot connect to the database:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`TransitOps server running on port ${PORT}`);
  });
};

start();
