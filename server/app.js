// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Security middleware - adds secure HTTP headers
app.use(helmet());

// Allow requests from the frontend application
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.send("Kehat Lab API is running");
});

module.exports = app;