const express = require("express");

const {
    getCart,
    addCartItem,
    updateCartItem,
    deleteCartItem
} = require("../controllers/cartController");

const {
    authenticateToken
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getCart);
router.post("/items", authenticateToken, addCartItem);
router.put("/items/:id", authenticateToken, updateCartItem);
router.delete("/items/:id", authenticateToken, deleteCartItem);

module.exports = router;