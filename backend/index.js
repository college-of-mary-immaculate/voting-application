//index.js
require("dotenv").config();
const express = require("express");
const asyncHandler = require('./src/utils/asyncHandler');

const VoterController = require("./src/controllers/votersController");
const ElectionsController = require('./src/controllers/electionsController');
const app = express();
app.use(express.json());

// voters endpoints
app.post("/api/voters/register", asyncHandler(VoterController.register));
app.post("/api/voters/login", asyncHandler(VoterController.login));

// election enpoints
app.get('/api/elections', asyncHandler(ElectionsController.getElections));
app.post('/api/elections', asyncHandler(ElectionsController.createElection));

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});