require("dotenv").config();
const express = require("express");
const cors = require('cors'); // <-- oo eto dinagdag ko
const asyncHandler = require('./src/utils/asyncHandler');
const authMiddleware = require('./src/middleware/authMiddleware');
const VoterController = require("./src/controllers/votersController");
const ElectionsController = require('./src/controllers/electionsController');
const CandidatesController = require('./src/controllers/candidatesController');
const DashboardController = require("./src/controllers/dashboardController");
const AdminController = require('./src/controllers/adminController');

const app = express();
app.use(cors()); // <-- tsaka to 
app.use(express.json());

// Admin endpoints
app.get('/api/admins', asyncHandler(AdminController.getAllAdmins));
app.get('/api/admins/:id', asyncHandler(AdminController.getAdminById));
app.post('/api/admins', asyncHandler(AdminController.createAdmin));
app.put('/api/admins/:id', asyncHandler(AdminController.updateAdmin));
app.delete('/api/admins/:id', asyncHandler(AdminController.deleteAdmin));

// Dashboard endpoint 
app.get("/api/dashboard/stats", asyncHandler(DashboardController.getStats));

// Voters endpoints
app.post("/api/voters/register", asyncHandler(VoterController.register));
app.post("/api/voters/login", asyncHandler(VoterController.login));
app.post("/api/voters/vote", authMiddleware, asyncHandler(VoterController.vote));
app.get("/api/voters", asyncHandler(VoterController.getAll)); // inadd ko to
app.get('/api/voters/:id', asyncHandler(VoterController.getById)); // inadd ko to
app.post('/api/voters', asyncHandler(VoterController.register)); // inadd ko to
app.put('/api/voters/:id', asyncHandler(VoterController.update)); // inadd ko to
app.delete('/api/voters/:id', asyncHandler(VoterController.delete)); // inadd ko to

// Elections endpoints
app.get('/api/elections', asyncHandler(ElectionsController.getElections));
app.post('/api/elections', asyncHandler(ElectionsController.createElection));
app.put('/api/elections/:id', asyncHandler(ElectionsController.updateElection)); // inadd ko to
app.delete('/api/elections/:id', asyncHandler(ElectionsController.deleteElection)); // inadd ko to

// Candidates endpoints
app.get('/api/candidates', CandidatesController.getAll);
app.post('/api/candidates', CandidatesController.create);
app.put('/api/candidates/:id', CandidatesController.update); // inadd ko to
app.delete('/api/candidates/:id', CandidatesController.delete); // inadd ko to

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});