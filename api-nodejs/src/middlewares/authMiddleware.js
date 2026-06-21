const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
        }

        const token = authorizationHeader.startsWith("Bearer ")
            ? authorizationHeader.substring(7)
            : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Bearer token is required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = {
    authenticateToken
};