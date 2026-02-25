// 🔹 Force Node to use reliable DNS (fixes SRV resolution issue)
const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const connectDB = require("./config/db");
require("dotenv").config();

const fixPassword = async (email, newPassword) => {
    try {
        await connectDB();
        const user = await User.findOne({ email });
        if (user) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            console.log(`Password for ${email} updated successfully to: ${newPassword}`);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (error) {
        console.error("Error updating password:", error.message);
    }
    process.exit();
};

const email = process.argv[2];
const password = process.argv[3] || "123456";

if (!email) {
    console.log("Usage: node fix_password.js <email> [new_password]");
    console.log("Example: node fix_password.js m.kishore732006mahes@gmail.com 123456");
    process.exit(1);
}

fixPassword(email, password);
