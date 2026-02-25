// 🔹 Force Node to use reliable DNS (fixes SRV resolution issue)
const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const connectDB = require("./config/db");
require("dotenv").config();

const checkUser = async (email, passwordToTest) => {
    try {
        await connectDB();
        const user = await User.findOne({ email });
        if (user) {
            console.log("User found:");
            console.log("ID:", user._id);
            console.log("Name:", user.name);
            console.log("Email:", user.email);
            console.log("Role:", user.role);
            console.log("Hashed Password:", user.password);

            // Check if password looks like a bcrypt hash (starts with $2a$ or $2b$)
            const isBcrypt = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$");
            console.log("Is Bcrypt Hash:", isBcrypt);

            if (passwordToTest && isBcrypt) {
                const isMatch = await bcrypt.compare(passwordToTest, user.password);
                console.log(`Does password "${passwordToTest}" match?`, isMatch);
            }
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (error) {
        console.error("Error checking user:", error.message);
    }
    process.exit();
};

const email = process.argv[2] || "kishore.ad23@bitsathy.ac.in";
const password = process.argv[3] || "1234";
checkUser(email, password);
