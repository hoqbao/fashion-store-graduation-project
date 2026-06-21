const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING(220),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        base_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        thumbnail: {
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
        tableName: "products",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = Product;