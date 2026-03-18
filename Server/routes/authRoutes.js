const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { registerUser, loginUser, createFaculty, createStudent, resetPassword, getUsers, deleteUser, updateUser } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

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

// User Management Routes (RBAC enforced)
router.post("/create-faculty", 
    protect, 
    authorizeRoles("admin"), 
    createFaculty
);

router.post("/create-student", 
    protect, 
    authorizeRoles("admin", "faculty"), 
    createStudent
);

router.put("/reset-password/:id", 
    protect, 
    authorizeRoles("admin", "faculty"), 
    resetPassword
);

router.get("/users", 
    protect, 
    authorizeRoles("admin"), 
    getUsers
);

router.delete("/user/:id", 
    protect, 
    authorizeRoles("admin"), 
    deleteUser
);

router.put("/user/:id", 
    protect, 
    authorizeRoles("admin"), 
    updateUser
);

module.exports = router;
