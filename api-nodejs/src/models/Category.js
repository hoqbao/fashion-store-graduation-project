const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
    "Category",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "HIDDEN"),
            allowNull: false,
            defaultValue: "ACTIVE"
        }
    },
    {
        tableName: "categories",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);
const Product = require("./Product");

Category.hasMany(Product, {
    foreignKey: "category_id",
    as: "products"
});

Product.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
});
module.exports = Category;