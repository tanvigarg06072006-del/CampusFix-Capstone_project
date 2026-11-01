const admin = require("../firebaseAdmin");
const pool = require("../db");

async function authenticateToken(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
        ? header.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Firebase token required"
        });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);

        const result = await pool.query(
            `SELECT id, name, email, role
             FROM users
             WHERE firebase_uid = $1`,
            [decoded.uid]
        );

        req.firebaseUser = decoded;
        req.user = result.rows[0] || null;

        next();
    } catch (error) {
        console.error("Firebase authentication error:", error.message);
        res.status(401).json({ message: "Invalid Firebase token" });
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