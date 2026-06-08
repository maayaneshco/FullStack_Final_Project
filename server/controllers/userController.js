const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Return the currently logged-in user's profile
const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// Update the currently logged-in user's profile
const updateProfile = async (req, res) => {
  // Get the current user from MongoDB using the ID from req.user
  const user = await User.findById(req.user._id);

  // Safety check in case the user no longer exists
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // If the email was changed, check that no other user already uses it
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
  }

  // Update fields only if new values were sent in the request body
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;

  // Save changes to MongoDB
  const updatedUser = await user.save();

  // Return the updated user to the client
  res.status(200).json(updatedUser);
};

// Change the current user's password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field included
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  // Set the new password
  user.password = newPassword;

  // Save user and trigger pre("save") password hashing
  await user.save();

  // Generate a new JWT token
  const token = generateToken(user._id);

  res.status(200).json({
    message: "Password updated successfully",
    token,
  });
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};