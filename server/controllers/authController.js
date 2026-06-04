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
    const {
      firstName,
      lastName,
      email,
      password,
      labPosition,
      labAccessCode
    } = req.body;

    // Verify lab access code
    if (labAccessCode !== process.env.LAB_ACCESS_CODE) {
      return res.status(401).json({
        message: "Invalid lab access code"
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Create a new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      labPosition
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      labPosition: user.labPosition,
      token: generateToken(user._id)
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