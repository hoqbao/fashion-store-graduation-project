const Category = require("../models/Category");

const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                status: "ACTIVE"
            },
            order: [["id", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Get categories successfully",
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cannot get categories",
            error: error.message
        });
    }
};

module.exports = {
    getCategories
};