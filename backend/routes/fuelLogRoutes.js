const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const fuelLogController = require('../controllers/fuelLogController');

const fuelAnalyst = authorize('Admin', 'Fleet Manager', 'Financial Analyst');

router.get('/', protect, asyncHandler(fuelLogController.getAll));
router.get('/:id', protect, asyncHandler(fuelLogController.getById));

router.post('/', protect, fuelAnalyst, asyncHandler(fuelLogController.create));
router.put('/:id', protect, fuelAnalyst, asyncHandler(fuelLogController.update));
router.delete('/:id', protect, fuelAnalyst, asyncHandler(fuelLogController.remove));

module.exports = router;
