const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const ProductImage = require("../models/ProductImage");

const getOrCreateCart = async (userId) => {
    const [cart] = await Cart.findOrCreate({
        where: {
            user_id: userId
        },
        defaults: {
            user_id: userId
        }
    });

    return cart;
};

const buildCartResponse = async (userId) => {
    const cart = await getOrCreateCart(userId);

    const cartItems = await CartItem.findAll({
        where: {
            cart_id: cart.id
        },
        order: [["id", "ASC"]]
    });

    const items = await Promise.all(
        cartItems.map(async (cartItem) => {
            const variant = await ProductVariant.findByPk(
                cartItem.product_variant_id
            );

            if (!variant) {
                return null;
            }

            const product = await Product.findByPk(variant.product_id);

            const price = Number(variant.price);
            const quantity = Number(cartItem.quantity);

            return {
                id: cartItem.id,
                quantity,
                subtotal: price * quantity,
                product: {
                    id: product?.id || null,
                    name: product?.name || "Sản phẩm không tồn tại",
                    slug: product?.slug || null,
                    thumbnail: product?.thumbnail || null
                },
                variant: {
                    id: variant.id,
                    sku: variant.sku,
                    size: variant.size,
                    color: variant.color,
                    price,
                    stock: variant.stock,
                    image: variant.image
                }
            };
        })
    );

    const validItems = items.filter((item) => item !== null);

    const totalQuantity = validItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalAmount = validItems.reduce(
        (total, item) => total + item.subtotal,
        0
    );

    return {
        cartId: cart.id,
        items: validItems,
        totalQuantity,
        totalAmount
    };
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            where: {
                user_id: req.user.id
            }
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Get cart successfully",
                data: {
                    id: null,
                    items: [],
                    totalQuantity: 0,
                    totalAmount: 0
                }
            });
        }

        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart.id
            },
            order: [["id", "DESC"]]
        });

        const items = [];
        let totalQuantity = 0;
        let totalAmount = 0;

        for (const cartItem of cartItems) {
            const variant = await ProductVariant.findByPk(
                cartItem.product_variant_id
            );

            if (!variant) {
                continue;
            }

            const product = await Product.findByPk(variant.product_id);

            if (!product) {
                continue;
            }

            const productImage = await ProductImage.findOne({
                where: {
                    product_id: product.id
                },
                order: [["id", "ASC"]]
            });

            const quantity = Number(cartItem.quantity);
            const price = Number(variant.price);
            const subtotal = price * quantity;

            totalQuantity += quantity;
            totalAmount += subtotal;

            items.push({
                id: cartItem.id,
                quantity,
                subtotal,
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    basePrice: Number(product.base_price),
                    base_price: Number(product.base_price),
                    thumbnail:
                        productImage?.image_url ||
                        "https://placehold.co/100x130?text=No+Image"
                },
                variant: {
                    id: variant.id,
                    sku: variant.sku,
                    size: variant.size,
                    color: variant.color,
                    price,
                    stock: Number(variant.stock),
                    status: variant.status,
                    image:
                        productImage?.image_url ||
                        "https://placehold.co/100x130?text=No+Image"
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Get cart successfully",
            data: {
                id: cart.id,
                items,
                totalQuantity,
                totalAmount
            }
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Cannot get cart",
            error: error.message
        });
    }
};

const addCartItem = async (req, res) => {
    try {
        const variantId = Number(req.body.productVariantId);
        const quantity = Number(req.body.quantity || 1);

        if (!Number.isInteger(variantId) || variantId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product variant id is invalid"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const variant = await ProductVariant.findOne({
            where: {
                id: variantId,
                status: "ACTIVE"
            }
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }

        const cart = await getOrCreateCart(req.user.id);

        const existingItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_variant_id: variantId
            }
        });

        const newQuantity = existingItem
            ? Number(existingItem.quantity) + quantity
            : quantity;

        if (newQuantity > Number(variant.stock)) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock"
            });
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
            await existingItem.save();
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_variant_id: variantId,
                quantity
            });
        }

        const data = await buildCartResponse(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Add product to cart successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cannot add product to cart",
            error: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Cart item id is invalid"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const cart = await getOrCreateCart(req.user.id);

        const cartItem = await CartItem.findOne({
            where: {
                id: cartItemId,
                cart_id: cart.id
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        const variant = await ProductVariant.findByPk(
            cartItem.product_variant_id
        );

        if (!variant || variant.status !== "ACTIVE") {
            return res.status(404).json({
                success: false,
                message: "Product variant not found"
            });
        }

        if (quantity > Number(variant.stock)) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock"
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        const data = await buildCartResponse(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Update cart successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cannot update cart",
            error: error.message
        });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const cartItemId = Number(req.params.id);

        if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Cart item id is invalid"
            });
        }

        const cart = await getOrCreateCart(req.user.id);

        const deletedCount = await CartItem.destroy({
            where: {
                id: cartItemId,
                cart_id: cart.id
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        const data = await buildCartResponse(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Delete cart item successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cannot delete cart item",
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem
};