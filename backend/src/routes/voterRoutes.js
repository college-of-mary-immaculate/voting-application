const express = require("express");
const router = express.Router();

const VoterController = require("../controllers/votersController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.post("/register", asyncHandler(VoterController.register));
router.post("/login", asyncHandler(VoterController.login));
router.post("/vote", auth.authMiddleware, asyncHandler(VoterController.vote));

router.get("/", auth.authMiddleware, auth.adminOnly, asyncHandler(VoterController.getAll));
router.get("/:id", auth.authMiddleware, auth.adminOnly, asyncHandler(VoterController.getById));
router.put("/:id", auth.authMiddleware, auth.adminOnly, asyncHandler(VoterController.update));
router.delete("/:id", auth.authMiddleware, auth.adminOnly, asyncHandler(VoterController.delete));


router.get("/election/:id/voters", asyncHandler(VoterController.getNotRegistered));
module.exports = router;