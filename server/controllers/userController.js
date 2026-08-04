const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const allowedRoles = ["researcher", "admin"];

// Return the currently logged-in user's profile
const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// Update the currently logged-in user's profile
const updateProfile = async (req, res) => {
  try {
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
      const emailExists = await User.findOne({
        email: req.body.email,
      });

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

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Change the current user's password
const changePassword = async (req, res) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Return all users for admin user management
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({
        lastName: 1,
        firstName: 1,
      });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a user's role from the admin user management screen
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "Admins cannot change their own role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = role;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      labPosition: updatedUser.labPosition,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole,
};
