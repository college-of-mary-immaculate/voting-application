//index.js
require("dotenv").config();
const express = require("express");
const VoterController = require("./src/controllers/votersController");

const app = express();
app.use(express.json());

app.post("/voters/register", VoterController.register);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});