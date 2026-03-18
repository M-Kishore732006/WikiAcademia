const express = require("express");
const router = express.Router();
const { createCategory, getCategories } = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorizeRoles("faculty", "admin"), createCategory)
    .get(getCategories);

module.exports = router;
