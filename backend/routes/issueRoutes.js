const express = require("express");
const pool = require("../supabase");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

const statuses = [
    "PENDING", "REVIEWED", "ASSIGNED",
    "IN_PROGRESS", "RESOLVED", "CONFIRMED", "REJECTED"
];

const categories = [
    "Electrical", "Plumbing", "Furniture", "Cleanliness",
    "Internet", "Classroom Equipment", "Laboratory Equipment",
    "Hostel", "Security", "Other"
];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

router.use(authenticateToken);

router.get("/", async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));

        const result = await pool.query(
            `SELECT i.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        a.name AS assignee_name
             FROM issues i
             JOIN users u ON u.id = i.reported_by
             LEFT JOIN users a ON a.id = i.assigned_to
             WHERE ($1::text IS NULL OR i.status = $1)
  AND ($2::text IS NULL OR i.category = $2)
  AND (
      $3::text IN ('staff', 'admin')
      OR i.reported_by = $4
  )
             ORDER BY i.created_at DESC
             LIMIT $5 OFFSET $6`,
            [
    req.query.status || null,
    req.query.category || null,
    req.user.role,
    req.user.id,
    limit,
    (page - 1) * limit
]
        );

        res.json({ page, limit, issues: result.rows });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not retrieve issues" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        a.name AS assignee_name
             FROM issues i
             JOIN users u ON u.id = i.reported_by
             LEFT JOIN users a ON a.id = i.assigned_to
             WHERE i.id = $1`,
            [req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json({ issue: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not retrieve issue" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { title, description, category, priority, location, image } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof description !== "string" ||
            typeof location !== "string" || !location.trim()
        ) {
            return res.status(400).json({
                message: "Title, description and location are required"
            });
        }

        if (category && !categories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        if (priority && !priorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        const result = await pool.query(
            `INSERT INTO issues
                (title, description, category, priority, location, image, status, reported_by)
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
             RETURNING *`,
            [
                title.trim(),
                description.trim(),
                category || "Other",
                priority || "MEDIUM",
                location.trim(),
                image || null,
                req.user.id
            ]
        );

        res.status(201).json({ message: "Issue created", issue: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not create issue" });
    }
});

router.patch("/:id/status", requireRole("staff", "admin"), async (req, res) => {
    try {
        const { status } = req.body;

        if (!statuses.includes(status)) {
            return res.status(400).json({ message: "Invalid issue status" });
        }

        const result = await pool.query(
            `UPDATE issues
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json({ message: "Status updated", issue: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not update status" });
    }
});

router.patch("/:id/assign", requireRole("staff", "admin"), async (req, res) => {
    try {
        const { assigned_to } = req.body;

        if (assigned_to !== null && assigned_to !== undefined) {
            const staff = await pool.query(
                "SELECT id FROM users WHERE id = $1 AND role IN ('staff', 'admin')",
                [assigned_to]
            );

            if (!staff.rows.length) {
                return res.status(400).json({ message: "Assignee must be staff or admin" });
            }
        }

        const result = await pool.query(
            `UPDATE issues
             SET assigned_to = $1, status = 'ASSIGNED', updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [assigned_to ?? null, req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json({ message: "Issue assignment updated", issue: result.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not assign issue" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const existing = await pool.query(
            "SELECT id, reported_by, status FROM issues WHERE id = $1",
            [req.params.id]
        );

        if (!existing.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const issue = existing.rows[0];
        const privileged = ["staff", "admin"].includes(req.user.role);
        const owner = String(issue.reported_by) === String(req.user.id);

        if (!privileged && !(owner && issue.status === "PENDING")) {
            return res.status(403).json({ message: "You cannot delete this issue" });
        }

        await pool.query("DELETE FROM issues WHERE id = $1", [req.params.id]);

        res.json({ message: "Issue deleted" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not delete issue" });
    }
});

module.exports = router;