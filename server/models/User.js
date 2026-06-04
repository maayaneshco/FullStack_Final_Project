const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 

// Define the structure of a user document
const userSchema = new mongoose.Schema( 
  {
    // User first name
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    // User last name
    lastName: {
      type: String,
      required: true,
      trim: true
    },

    // User email address - used for login and must be unique
    email: {
      type: String,
      required: true,
      unique: true, 
      lowercase: true, 
      trim: true
    },

    // Hashed user password
    password: {
      type: String,
      required: true,
      minlength: 6, 
      select: false 
    },

    // User role inside the lab system
    role: {
      type: String,
      enum: ["researcher", "admin"], 
      default: "researcher"
    },

    // User professional position in the lab
    labPosition: {
      type: String,
      enum: [
        "principal_investigator",
        "lab_manager",
        "md_phd_student",
        "md_student",
        "undergraduate_research_assistant",
        "researcher",
        "lab_technician",
        "other"],
      required: true
    }
  },

  {
    // Automatically create createdAt and updatedAt fields
    timestamps: true
  }
);

// Hash password before saving the 
userSchema.pre("save", async function (next) {
  // Only hash the password if it was created or modified
  if (!this.isModified("password")) { 
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create User model from schema
const User = mongoose.model("User", userSchema);

module.exports = User;