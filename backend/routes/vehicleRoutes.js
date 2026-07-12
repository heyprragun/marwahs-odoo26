const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

router.get('/', protect, asyncHandler(vehicleController.getAll));
router.get('/:id', protect, asyncHandler(vehicleController.getById));

router.post('/', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(vehicleController.create));
router.put('/:id', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(vehicleController.update));
router.delete('/:id', protect, authorize('Admin', 'Fleet Manager'), asyncHandler(vehicleController.remove));

module.exports = router;
