const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const {
  protect
} = require("../middleware/authMiddleware");

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Protected route - current logged in user
router.get("/me", protect, getMe);

module.exports = router;