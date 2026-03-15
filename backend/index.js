require("dotenv").config();

const express = require("express");
const cors = require("cors");

const adminRoutes = require("./src/routes/adminRoutes");
const voterRoutes = require("./src/routes/voterRoutes");
const electionRoutes = require("./src/routes/electionRoutes");
const candidateRoutes = require("./src/routes/candidateRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const accountRoutes = require("./src/routes/accountRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admins", adminRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", accountRoutes);

// Global error handler
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