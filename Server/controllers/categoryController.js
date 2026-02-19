const Category = require("../models/Category");

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Faculty/Admin)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await Category.create({
            name,
            description
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCategory, getCategories };
