const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token for authenticated users
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    res.status(200).json({
      message: "Register route is working"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser
};