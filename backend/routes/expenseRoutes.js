const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const expenseController = require('../controllers/expenseController');

const expenseAnalyst = authorize('Admin', 'Fleet Manager', 'Financial Analyst');

router.get('/', protect, asyncHandler(expenseController.getAll));
router.get('/:id', protect, asyncHandler(expenseController.getById));

router.post('/', protect, expenseAnalyst, asyncHandler(expenseController.create));
router.put('/:id', protect, expenseAnalyst, asyncHandler(expenseController.update));
router.delete('/:id', protect, expenseAnalyst, asyncHandler(expenseController.remove));

module.exports = router;
