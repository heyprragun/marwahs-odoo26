// Shared pagination parser for list endpoints.
// Returns safe 1-based page, clamped limit (1..100), and SQL offset.
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = { parsePagination };
