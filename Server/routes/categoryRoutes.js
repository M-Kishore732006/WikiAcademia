const express = require("express");
const router = express.Router();
const { createCategory, getCategories } = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorize("faculty", "admin"), createCategory)
    .get(getCategories);

module.exports = router;
