require("dotenv").config();
const http = require("http"); 
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const path = require("path");

const adminRoutes = require("./src/routes/adminRoutes");
const voterRoutes = require("./src/routes/voterRoutes");
const electionRoutes = require("./src/routes/electionRoutes");
const candidateRoutes = require("./src/routes/candidateRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const accountRoutes = require("./src/routes/accountRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const positionsRoute = require("./src/routes/positionsRoute");
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

io.on("connection", (socket) => {

  socket.on("joinElection", (electionId) => {
    socket.join(`election_${electionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api/admins", adminRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/positions", positionsRoute);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", accountRoutes);
app.use("/api", uploadRoutes); // Add upload routes

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload/photo`);
  console.log(`Static files served from: http://localhost:${PORT}/uploads/`);
});