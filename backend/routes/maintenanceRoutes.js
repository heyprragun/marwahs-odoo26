const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const maintenanceController = require('../controllers/maintenanceController');

const maintainer = authorize('Admin', 'Fleet Manager');

router.get('/', protect, asyncHandler(maintenanceController.getAll));
router.post('/', protect, maintainer, asyncHandler(maintenanceController.create));
router.patch('/:id/complete', protect, maintainer, asyncHandler(maintenanceController.complete));

module.exports = router;
