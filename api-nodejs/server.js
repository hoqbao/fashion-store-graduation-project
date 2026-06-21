require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");

const categoryRoutes = require("./src/routes/categoryRoutes");
const productRoutes = require("./src/routes/productRoutes");
const authRoutes = require("./src/routes/authRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Fashion Store API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await sequelize.authenticate();

        res.json({
            success: true,
            message: "Connected to MySQL successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Cannot connect to MySQL",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`API is running at http://localhost:${PORT}`);
});