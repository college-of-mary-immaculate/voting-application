const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth.authMiddleware, auth.adminOnly, AdminController.getAllAdmins);
router.get("/:id", auth.authMiddleware, auth.adminOnly, AdminController.getAdminById);
router.post("/create",  AdminController.createAdmin);
router.put("/:id", auth.authMiddleware, auth.adminOnly,AdminController.updateAdmin);
router.delete("/:id", auth.authMiddleware, auth.adminOnly, AdminController.deleteAdmin);

module.exports = router;