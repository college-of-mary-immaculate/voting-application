require("dotenv").config();
const express = require("express");
const asyncHandler = require('./src/utils/asyncHandler');

const VoterController = require("./src/controllers/votersController");
const ElectionsController = require('./src/controllers/electionsController');
const CandidatesController = require('./src/controllers/candidatesController');

const app = express();
app.use(express.json());

// voters endpoints
app.post("/api/voters/register", asyncHandler(VoterController.register));
app.post("/api/voters/login", asyncHandler(VoterController.login));

// election enpoints
app.get('/api/elections', asyncHandler(ElectionsController.getElections));
app.post('/api/elections', asyncHandler(ElectionsController.createElection));

// candidates endpoints
app.get('/api/candidates', CandidatesController.getAll);
app.post('/api/candidates', CandidatesController.create);

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