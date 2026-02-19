// 🔹 Force Node to use reliable DNS (fixes SRV resolution issue)
const dns = require("dns");
dns.setServers(["1.1.1.1"]);

// 🔹 Core imports
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const connectDB = require("./config/db");
const User = require("./models/user");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const documentRoutes = require("./routes/documentRoutes");

// 🔹 Create Express app
const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/documents", documentRoutes);


// 🔹 Basic route
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// 🔹 Test insert function (temporary verification)
const testInsert = async () => {
  try {
    const existingUser = await User.findOne({ email: "test@example.com" });

    if (!existingUser) {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      });

      console.log("Test user inserted:", user.email);
    } else {
      console.log("Test user already exists");
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
