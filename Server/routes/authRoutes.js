const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");

// Validation middleware generic handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post("/register", [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })
], validate, registerUser);

router.post("/login", [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], validate, loginUser);

module.exports = router;
