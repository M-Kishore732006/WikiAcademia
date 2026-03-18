// 🔹 Force Node to use reliable DNS (fixes SRV resolution issue)
const dns = require("dns");
dns.setServers(["1.1.1.1"]);

// 🔹 Core imports
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const User = require("./models/user");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const documentRoutes = require("./routes/documentRoutes");
const helmet = require("helmet");
const morgan = require("morgan");

// 🔹 Create Express app
const app = express();

// 🔹 Middleware
app.use(helmet());

// 🔹 CORS Security: Configure so Render only accepts requests from your Vercel URL
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true,
}));
app.use(express.json());

// 🔹 Setup logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Also log to console

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/documents", documentRoutes);


// 🔹 Basic route
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// 🔹 Test insert function (temporary verification)
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing

// 🔹 Test insert function (temporary verification)
const testInsert = async () => {
  try {
    const email = "test@example.com";
    const password = "123456";

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: "Test User",
        email,
        password: hashedPassword,
        role: "student"
      });

      console.log("Test user created:", user.email);
    } else {
      // Check if password is valid (hashed)
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        console.log("Updating test user password to be hashed...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        existingUser.password = hashedPassword;
        await existingUser.save();
        console.log("Test user password updated.");
      } else {
        console.log("Test user already exists and password is valid.");
      }
    }
  } catch (error) {
    console.error("Error inserting test user:", error.message);
  }
};

// 🔹 Connect DB first, then start server
const startServer = async () => {
  await connectDB();

  // Run test insert only after DB connection
  await testInsert();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
