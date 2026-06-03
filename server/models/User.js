const mongoose = require("mongoose"); //ייבוא של ספריית מונגוס
const bcrypt = require("bcrypt"); //ייבוא של ספריית בכרויפט שמשמשת להצפנה HASH

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
      unique: true, // לא יכולות להיות שתי סיסמאות זהות
      lowercase: true, //אם סיסמה נכתבת עם אותיות גדולות באנגלית הכול הופך לאותיות קטנות
      trim: true
    },

    // Hashed user password
    password: {
      type: String,
      required: true,
      minlength: 6, //אורך הסיסמה המינימלי הוא 6 תווים
      select: false //כאשר נשלוף ממסד הנתונים משתמשים, הסיסמה לא תחזור אוטומטית לכל שליפה
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
// לפני שמירת הסיסמה במסד הנתונים, יש לבצע פעולת הצפנה
userSchema.pre("save", async function (next) {
  // Only hash the password if it was created or modified
  if (!this.isModified("password")) { 
    return next();
  }

  // Generate salt and hash the passwordתהליך הצפנה  
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