const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const tripController = require('../controllers/tripController');

const dispatcher = authorize('Admin', 'Fleet Manager', 'Driver');

router.get('/', protect, asyncHandler(tripController.getAll));
router.post('/', protect, dispatcher, asyncHandler(tripController.create));

router.patch('/:id/dispatch', protect, dispatcher, asyncHandler(tripController.dispatch));
router.patch('/:id/complete', protect, dispatcher, asyncHandler(tripController.complete));
router.patch('/:id/cancel', protect, dispatcher, asyncHandler(tripController.cancel));

module.exports = router;
