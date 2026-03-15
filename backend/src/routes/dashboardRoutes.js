
const express = require("express");
const router = express.Router();

const DashboardController = require("../controllers/dashboardController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.get("/stats", auth.authMiddleware, auth.adminOnly ,asyncHandler(DashboardController.getStats));
module.exports = router;
