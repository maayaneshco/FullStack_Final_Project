const app = require("./app");
const connectDB = require("./config/db");

// Connect to MongoDB before starting the server
connectDB();

const PORT = process.env.PORT || 5000;

// Start Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

