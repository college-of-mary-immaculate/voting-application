const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth.authMiddleware, auth.adminOnly, AdminController.getAll);
router.get("/:id", auth.authMiddleware, auth.adminOnly, AdminController.getById);
router.post("/create",  AdminController.create);
router.put("/:id", auth.authMiddleware, auth.adminOnly,AdminController.update);
router.delete("/:id", auth.authMiddleware, auth.adminOnly, AdminController.delete)
router.post("/election/:id/assign-voter",  AdminController.assignVoter);
router.post("/election/:electionId/assign-voters", AdminController.bulkAssignVoters);
module.exports = router;