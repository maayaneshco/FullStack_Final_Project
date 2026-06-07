const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token and decode payload
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // NEW: Find user by decoded id
      req.user = await User.findById(decoded.id).select("-password");

      // NEW: Continue to next middleware/controller
      return next();
    }

    return res.status(401).json({
      message: "No token provided"
    });

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized"
    });
  }
};

module.exports = {
  protect
};