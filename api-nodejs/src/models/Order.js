const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
    "Order",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        order_code: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        momo_request_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true
        },
        momo_trans_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        momo_result_code: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        paid_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        receiver_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        receiver_phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        receiver_address: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        note: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        payment_method: {
            type: DataTypes.ENUM("COD", "VNPAY", "MOMO"),
            allowNull: false,
            defaultValue: "COD"
        },
        payment_status: {
            type: DataTypes.ENUM("UNPAID", "PAID", "FAILED"),
            allowNull: false,
            defaultValue: "UNPAID"
        },
        order_status: {
            type: DataTypes.ENUM(
                "PENDING_PAYMENT",
                "PENDING",
                "CONFIRMED",
                "SHIPPING",
                "COMPLETED",
                "CANCELLED"
            ),
            allowNull: false,
            defaultValue: "PENDING"
        }
    },
    {
        tableName: "orders",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = Order;