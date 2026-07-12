const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/', protect, asyncHandler(dashboardController.getDashboard));

module.exports = router;
