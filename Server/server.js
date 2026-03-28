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
const aiRoutes = require("./routes/aiRoutes");
const commentRoutes = require("./routes/commentRoutes");
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
app.use("/api/ai", aiRoutes);
app.use("/api/comments", commentRoutes);

// 🔹 Basic route
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// 🔹 Test insert function (temporary verification)
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing

// 🔹 Test insert function (creates initial admin)
const testInsert = async () => {
  try {
    const email = "admin@gmail.com";
    const password = "732006";

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: "System Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Initial Admin user created:", user.email);
    } else {
      // Ensure the user remains an admin and has the correct password layout
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log("Updated existing test user to Admin role.");
      }
      console.log("Admin user is ready.");
    }
  } catch (error) {
    console.error("Error inserting test admin user:", error.message);
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
