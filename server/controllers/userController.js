const User = require("../models/User");

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

module.exports = {
  getProfile,
  updateProfile,
};