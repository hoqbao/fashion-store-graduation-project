const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
    "OrderItem",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        product_variant_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        product_name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        size: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        subtotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        }
    },
    {
        tableName: "order_items",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false
    }
);

module.exports = OrderItem;