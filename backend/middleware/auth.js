
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

    // Step 1: Verify Firebase login
    let decoded;

    try {
        decoded = await auth.verifyIdToken(token);
    } catch (error) {
        console.error("Firebase authentication error:", error.message);
        return res.status(401).json({
            message: "Invalid Firebase token"
        });
    }

    if (!decoded.email) {
        return res.status(400).json({
            message: "Firebase account must have an email"
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        // Prevent simultaneous requests creating duplicate users
        await client.query(
            "SELECT pg_advisory_xact_lock(hashtext($1))",
            [decoded.email.toLowerCase()]
        );

        // Step 2: Look for existing Firebase UID
        let result = await client.query(
            `SELECT id, name, email, role, firebase_uid
             FROM public.users
             WHERE firebase_uid = $1`,
            [decoded.uid]
        );

        // Step 3: If not found, check whether the email already exists
        if (!result.rows.length) {
            result = await client.query(
                `SELECT id, name, email, role, firebase_uid
                 FROM public.users
                 WHERE LOWER(email) = LOWER($1)
                 LIMIT 1
                 FOR UPDATE`,
                [decoded.email]
            );

            if (result.rows.length) {
                const existingUser = result.rows[0];

                // Never attach another Firebase account to this record
                if (
                    existingUser.firebase_uid &&
                    existingUser.firebase_uid !== decoded.uid
                ) {
                    await client.query("ROLLBACK");
                    return res.status(409).json({
                        message: "This email is linked to another account"
                    });
                }

                // Link the existing database record to Firebase
                result = await client.query(
                    `UPDATE public.users
                     SET firebase_uid = $1
                     WHERE id = $2
                     RETURNING id, name, email, role`,
                    [decoded.uid, existingUser.id]
                );
            } else {
                // Step 4: Create a new student record automatically
                result = await client.query(
                    `INSERT INTO public.users
                        (name, email, role, firebase_uid)
                     VALUES ($1, $2, 'student', $3)
                     RETURNING id, name, email, role`,
                    [
                        decoded.name || decoded.email.split("@")[0],
                        decoded.email,
                        decoded.uid
                    ]
                );
            }
        }

        await client.query("COMMIT");

        req.firebaseUser = decoded;
        req.user = result.rows[0];

        return next();

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK").catch(() => {});
        }

        console.error("Database user sync error:", error.message);

        return res.status(500).json({
            message: "Could not synchronise user with database"
        });

    } finally {
        if (client) {
            client.release();
        }
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
