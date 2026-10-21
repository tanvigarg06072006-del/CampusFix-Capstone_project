const express = require("express");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/issue/:issueId", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.issue_id, c.user_id, c.comment,
                    c.created_at, c.updated_at, u.name AS user_name
             FROM comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.issue_id = $1
             ORDER BY c.created_at ASC`,
            [req.params.issueId]
        );

        res.json({ comments: result.rows });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not retrieve comments" });
    }
});

router.post("/issue/:issueId", async (req, res) => {
    try {
        const { comment } = req.body;

        if (typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }

        const issue = await pool.query(
            "SELECT id FROM issues WHERE id = $1",
            [req.params.issueId]
        );

        if (!issue.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const result = await pool.query(
            `INSERT INTO comments (issue_id, user_id, comment)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.params.issueId, req.user.id, comment.trim()]
        );

        res.status(201).json({ comment: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not add comment" });
    }
});

module.exports = router;