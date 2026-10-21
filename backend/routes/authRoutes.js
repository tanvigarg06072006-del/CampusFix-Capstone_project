const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" ||
            typeof password !== "string" || password.length < 8
        ) {
            return res.status(400).json({
                message: "Name, valid email and password of at least 8 characters are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
             VALUES ($1, $2, $3, 'student')
             RETURNING id, name, email, role`,
            [name.trim(), email.trim().toLowerCase(), hashedPassword]
        );

        const user = result.rows[0];

        res.status(201).json({
            message: "Registration successful",
            user,
            token: createToken(user)
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Email already registered" });
        }

        console.error(error.message);
        res.status(500).json({ message: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await pool.query(
            "SELECT id, name, email, password, role FROM users WHERE email = $1",
            [email.trim().toLowerCase()]
        );

        if (
            !result.rows.length ||
            !(await bcrypt.compare(password, result.rows[0].password))
        ) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { password: ignored, ...user } = result.rows[0];

        res.json({
            message: "Login successful",
            user,
            token: createToken(user)
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Login failed" });
    }
});

router.get("/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;