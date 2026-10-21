const jwt = require("jsonwebtoken");
const pool = require("../db");

async function authenticateToken(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
            "SELECT id, name, email, role FROM users WHERE id = $1",
            [decoded.id]
        );

        if (!result.rows.length) {
            return res.status(401).json({ message: "Invalid user" });
        }

        req.user = result.rows[0];
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole };