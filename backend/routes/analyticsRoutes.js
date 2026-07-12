const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get('/fuel-efficiency', protect, asyncHandler(analyticsController.fuelEfficiency));
router.get('/fleet-utilization', protect, asyncHandler(analyticsController.fleetUtilization));
router.get('/vehicle-roi', protect, asyncHandler(analyticsController.vehicleRoi));
router.get('/operational-cost', protect, asyncHandler(analyticsController.operationalCost));
router.get('/expense-summary', protect, asyncHandler(analyticsController.expenseSummary));
router.get('/trip-status', protect, asyncHandler(analyticsController.tripStatus));

module.exports = router;
