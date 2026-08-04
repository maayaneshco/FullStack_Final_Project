// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const responsibilityRoutes = require("./routes/responsibilityRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const protocolRoutes = require("./routes/protocolRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const defaultClientUrls = [
  "http://localhost:5173",
];

const allowedOrigins = [
  ...defaultClientUrls,
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

// Security middleware - adds secure HTTP headers
app.use(helmet());

// Allow requests from the frontend application
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Public health check for deployment platforms
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Projects routes
app.use("/api/projects", projectRoutes);

// Tasks routes
app.use("/api/tasks", taskRoutes);

// Responsibilities routes
app.use("/api/responsibilities", responsibilityRoutes);

// Inventory routes
app.use("/api/inventory", inventoryRoutes);

// Equipment routes
app.use("/api/equipment", equipmentRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Protocols routes
app.use("/api/protocols", protocolRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("Kehat Lab API is running");
});

module.exports = app;
