const dns = require("dns");
dns.setServers(["1.1.1.1"]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

const createFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/digital_academic_repo");
        const email = "faculty@example.com";
        const password = "password123";

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({
                name: "Test Faculty",
                email,
                password: hashedPassword,
                role: "faculty"
            });
            console.log("Faculty user created successfully.");
        } else {
            console.log("Faculty user already exists.");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
createFaculty();
