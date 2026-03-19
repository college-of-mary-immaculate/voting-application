const express = require("express");
const router = express.Router();

const ElectionsController = require("../controllers/electionsController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.get('/', auth.authMiddleware, asyncHandler(ElectionsController.getElections));
router.post('/', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.createElection));
router.put('/:id', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.updateElection)); 
router.delete('/:id', asyncHandler(ElectionsController.deleteElection));
router.post('/:id/positions', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.addPosition));
router.get('/:id/positions', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.getPositions));
router.get('/:id/results', auth.authMiddleware, asyncHandler(ElectionsController.results));
router.get("/my-election", auth.authMiddleware, asyncHandler(ElectionsController.getMyActiveElection));
module.exports = router;
