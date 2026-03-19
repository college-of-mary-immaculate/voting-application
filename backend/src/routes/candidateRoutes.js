const express = require("express");
const router = express.Router();

const CandidatesController = require("../controllers/candidatesController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.post('/', auth.authMiddleware, auth.adminOnly, CandidatesController.create);
router.get('/', auth.authMiddleware, CandidatesController.getAll);
router.put('/:id', auth.authMiddleware, auth.adminOnly, CandidatesController.update);
router.delete('/:id', auth.authMiddleware, auth.adminOnly, CandidatesController.delete);
router.get('/position/:positionId', auth.authMiddleware, asyncHandler(CandidatesController.getByPosition));

module.exports = router;