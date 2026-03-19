const express = require("express");
const router = express.Router();
const PositionsController = require("../controllers/positionsController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

// Get all positions (optional)
router.get('/', auth.authMiddleware, asyncHandler(PositionsController.getAll));

// Get positions by election ID
router.get('/election/:electionId', auth.authMiddleware, asyncHandler(PositionsController.getByElection));

// Get single position
router.get('/:id', auth.authMiddleware, asyncHandler(PositionsController.getById));

// Create position (attached to election)
router.post('/', auth.authMiddleware, auth.adminOnly, asyncHandler(PositionsController.create));

// Update position
router.put('/:id', auth.authMiddleware, auth.adminOnly, asyncHandler(PositionsController.update));

// Delete position
router.delete('/:id', auth.authMiddleware, auth.adminOnly, asyncHandler(PositionsController.delete));

module.exports = router;