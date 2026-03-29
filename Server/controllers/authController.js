const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h"
  });
};

// 🔹 Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Public registration is ALWAYS student — admin creates faculty via Manage Users
    const role = "student";

    // Security: Prevent self-registration as admin (redundant but kept for safety)
    // role is already forced to student above

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Create Faculty (Admin Only)
exports.createFaculty = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name || "Faculty Member",
      email,
      password: hashedPassword,
      role: "faculty"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Create Student (Admin or Faculty)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name || "Student",
      email,
      password: hashedPassword,
      role: "student"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const targetUserId = req.params.id;
    const caller = req.user;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent any admin from resetting another admin's password
    if (targetUser.role === "admin" && caller._id.toString() !== targetUserId) {
      return res.status(403).json({ message: "Cannot reset another admin's password" });
    }

    // Faculty can only reset student passwords
    if (caller.role === "faculty" && targetUser.role !== "student") {
      return res.status(403).json({ message: "Faculty can only reset student passwords" });
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(password, salt);
    await targetUser.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get All Users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Delete A User
exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const caller = req.user;
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admins from deleting other admins
    if (user.role === "admin" && caller._id.toString() !== targetUserId) {
      return res.status(403).json({ message: "Cannot delete another admin account" });
    }

    await User.findByIdAndDelete(targetUserId);
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update A User
exports.updateUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { name, email, role } = req.body;

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();
    
    // Return the user object without the password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
