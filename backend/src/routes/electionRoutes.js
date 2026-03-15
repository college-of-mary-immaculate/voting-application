const express = require("express");
const router = express.Router();

const ElectionsController = require("../controllers/electionsController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.get('/', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.getElections));
router.post('/', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.createElection));
router.put('/:id', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.updateElection)); 
router.delete('/:id', auth.authMiddleware, auth.adminOnly, asyncHandler(ElectionsController.deleteElection));

module.exports = router;
