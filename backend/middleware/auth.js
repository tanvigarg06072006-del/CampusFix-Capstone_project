
const { auth } = require("../firebaseAdmin");
const pool = require("../supabase");

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
        const decoded = await auth.verifyIdToken(token);

        const result = await pool.query(
            `SELECT id, name, email, role
             FROM public.users
             WHERE firebase_uid = $1`,
            [decoded.uid]
        );

        if (!result.rows.length) {
            return res.status(404).json({
                message: "User not found in database"
            });
        }

        req.firebaseUser = decoded;
        req.user = result.rows[0];

        next();
    } catch (error) {
        console.error("Firebase authentication error:", error.message);
        return res.status(401).json({
            message: "Invalid Firebase token"
        });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole };
