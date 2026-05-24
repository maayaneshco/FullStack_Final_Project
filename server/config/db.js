const mongoose = require("mongoose");

// Connect the backend application to MongoDB
const connectDB = async () => {
  try {

    // Create connection to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Print successful connection message
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {

    // Print database connection errors
    console.error(`Database connection error: ${error.message}`);

    // Stop the server if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;




