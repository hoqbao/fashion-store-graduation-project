const express = require("express");

const {
    createOrder,
    getMyOrders,
    getMyOrderDetail
} = require("../controllers/orderController");

const {
    authenticateToken
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createOrder);

router.get(
    "/my-orders",
    authenticateToken,
    getMyOrders
);

router.get(
    "/my-orders/:orderCode",
    authenticateToken,
    getMyOrderDetail
);

module.exports = router;