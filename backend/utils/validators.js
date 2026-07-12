const isValidDate = (value) => !Number.isNaN(Date.parse(value));

const isExpired = (dateValue) =>
  new Date(dateValue).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

const isInEnum = (value, list) => list.includes(value);

module.exports = { isValidDate, isExpired, isInEnum };
