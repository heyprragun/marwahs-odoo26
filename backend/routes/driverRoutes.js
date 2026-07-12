const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const driverController = require('../controllers/driverController');

router.get('/', protect, asyncHandler(driverController.getAll));
router.get('/:id', protect, asyncHandler(driverController.getById));

router.post('/', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(driverController.create));
router.put('/:id', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(driverController.update));
router.delete('/:id', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(driverController.remove));

module.exports = router;
