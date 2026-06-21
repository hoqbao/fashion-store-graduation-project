const sequelize = require("../config/database");

const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const ProductImage = require("../models/ProductImage");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const generateOrderCode = () => {
    const timestamp = Date.now().toString().slice(-10);
    const randomNumber = Math.floor(Math.random() * 900 + 100);

    return `ORD${timestamp}${randomNumber}`;
};

const createOrder = async (req, res) => {
    let transaction = null;

    try {
        const {
            receiverName,
            receiverPhone,
            receiverAddress,
            note
        } = req.body;

        if (
            !receiverName?.trim() ||
            !receiverPhone?.trim() ||
            !receiverAddress?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Receiver name, phone and address are required"
            });
        }

        transaction = await sequelize.transaction();

        const cart = await Cart.findOne({
            where: {
                user_id: req.user.id
            },
            transaction
        });

        if (!cart) {
            await transaction.rollback();
            transaction = null;

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart.id
            },
            transaction
        });

        if (cartItems.length === 0) {
            await transaction.rollback();
            transaction = null;

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const cartItem of cartItems) {
            const quantity = Number(cartItem.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                await transaction.rollback();
                transaction = null;

                return res.status(400).json({
                    success: false,
                    message: "Product quantity is invalid"
                });
            }

            const variant = await ProductVariant.findOne({
                where: {
                    id: cartItem.product_variant_id,
                    status: "ACTIVE"
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!variant) {
                await transaction.rollback();
                transaction = null;

                return res.status(404).json({
                    success: false,
                    message: "Product variant not found or inactive"
                });
            }

            const stock = Number(variant.stock);

            if (quantity > stock) {
                await transaction.rollback();
                transaction = null;

                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${variant.sku}`
                });
            }

            const product = await Product.findByPk(variant.product_id, {
                transaction
            });

            if (!product) {
                await transaction.rollback();
                transaction = null;

                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const price = Number(variant.price);
            const subtotal = price * quantity;

            totalAmount += subtotal;

            orderItemsData.push({
                productVariantId: variant.id,
                productName: product.name,
                size: variant.size,
                color: variant.color,
                price,
                quantity,
                subtotal,
                variant
            });
        }

        const order = await Order.create(
            {
                user_id: req.user.id,
                order_code: generateOrderCode(),
                receiver_name: receiverName.trim(),
                receiver_phone: receiverPhone.trim(),
                receiver_address: receiverAddress.trim(),
                note: note?.trim() || null,
                total_amount: totalAmount,
                payment_method: "COD",
                payment_status: "UNPAID",
                order_status: "PENDING"
            },
            {
                transaction
            }
        );

        for (const item of orderItemsData) {
            await OrderItem.create(
                {
                    order_id: order.id,
                    product_variant_id: item.productVariantId,
                    product_name: item.productName,
                    size: item.size,
                    color: item.color,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                },
                {
                    transaction
                }
            );

            item.variant.stock =
                Number(item.variant.stock) - item.quantity;

            await item.variant.save({
                transaction
            });
        }

        await CartItem.destroy({
            where: {
                cart_id: cart.id
            },
            transaction
        });

        await transaction.commit();
        transaction = null;

        return res.status(201).json({
            success: true,
            message: "Create order successfully",
            data: {
                id: order.id,
                orderCode: order.order_code,
                totalAmount: Number(order.total_amount),
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                orderStatus: order.order_status,
                createdAt: order.created_at
            }
        });
    } catch (error) {
        console.error("Create order error:", error);

        if (transaction) {
            await transaction.rollback();
        }

        return res.status(500).json({
            success: false,
            message: "Cannot create order",
            error: error.message
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                user_id: req.user.id
            },
            order: [
                ["created_at", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Get orders successfully",
            data: orders.map((order) => ({
                id: order.id,
                orderCode: order.order_code,
                receiverName: order.receiver_name,
                receiverPhone: order.receiver_phone,
                receiverAddress: order.receiver_address,
                totalAmount: Number(order.total_amount),
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                orderStatus: order.order_status,
                createdAt: order.created_at
            }))
        });
    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Cannot get orders",
            error: error.message
        });
    }
};

const getMyOrderDetail = async (req, res) => {
    try {
        const { orderCode } = req.params;

        const order = await Order.findOne({
            where: {
                order_code: orderCode,
                user_id: req.user.id
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const orderItems = await OrderItem.findAll({
            where: {
                order_id: order.id
            },
            order: [["id", "ASC"]]
        });

        const items = [];

        for (const item of orderItems) {
            let image = "https://placehold.co/100x130?text=No+Image";

            if (item.product_variant_id) {
                const variant = await ProductVariant.findByPk(
                    item.product_variant_id
                );

                if (variant) {
                    const productImage = await ProductImage.findOne({
                        where: {
                            product_id: variant.product_id
                        },
                        order: [["id", "ASC"]]
                    });

                    if (productImage?.image_url) {
                        image = productImage.image_url;
                    }
                }
            }

            items.push({
                id: item.id,
                productVariantId: item.product_variant_id,
                productName: item.product_name,
                size: item.size,
                color: item.color,
                price: Number(item.price),
                quantity: Number(item.quantity),
                subtotal: Number(item.subtotal),
                image
            });
        }

        return res.status(200).json({
            success: true,
            message: "Get order detail successfully",
            data: {
                id: order.id,
                orderCode: order.order_code,
                receiverName: order.receiver_name,
                receiverPhone: order.receiver_phone,
                receiverAddress: order.receiver_address,
                note: order.note,
                totalAmount: Number(order.total_amount),
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                orderStatus: order.order_status,
                createdAt: order.created_at,
                items
            }
        });
    } catch (error) {
        console.error("Get order detail error:", error);

        return res.status(500).json({
            success: false,
            message: "Cannot get order detail",
            error: error.message
        });
    }
};
module.exports = {
    createOrder,
    getMyOrders,
    getMyOrderDetail
};
