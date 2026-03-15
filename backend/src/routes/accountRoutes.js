
const express = require("express");
const router = express.Router();

const AccountController = require("../controllers/accountController");
const asyncHandler = require("../utils/asyncHandler");
const auth = require("../middleware/authMiddleware");

router.post("/login", asyncHandler(AccountController.login));
router.post("/register", asyncHandler(AccountController.register));

module.exports = router;
