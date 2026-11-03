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
a.name AS assignee_name,
(SELECT COUNT(*)
 FROM issue_votes iv
 WHERE iv.issue_id = i.id) AS vote_count
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

router.get("/community", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*,
                u.name AS reporter_name,
                (SELECT COUNT(*)
                 FROM issue_votes iv
                 WHERE iv.issue_id = i.id) AS vote_count,
                EXISTS (
                    SELECT 1
                    FROM issue_votes iv
                    WHERE iv.issue_id = i.id
                    AND iv.user_id = $1
                ) AS has_voted
             FROM issues i
             JOIN users u ON u.id = i.reported_by
             WHERE i.status NOT IN ('RESOLVED', 'CONFIRMED', 'REJECTED')
             ORDER BY i.created_at DESC`,
            [req.user.id]
        );

        res.json({ issues: result.rows });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not retrieve community issues" });
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

        const newIssue = result.rows[0];

// Notify all admins and staff
try {
    await pool.query(
        `INSERT INTO notifications
            (user_id, issue_id, title, message, type)
         SELECT
            id,
            $1,
            'New Complaint Received',
            $2,
            'new_complaint'
         FROM users
         WHERE role IN ('admin', 'staff')`,
        [
            newIssue.id,
            `A new complaint "${newIssue.title}" has been submitted.`
        ]
    );
} catch (notificationError) {
    console.error("Notification creation failed:", notificationError.message);
}

res.status(201).json({
    message: "Issue created",
    issue: newIssue
});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not create issue" });
    }
});

router.post("/:id/vote", async (req, res) => {
    try {
        const issueResult = await pool.query(
            `SELECT id, reported_by, status
             FROM issues
             WHERE id = $1`,
            [req.params.id]
        );

        if (!issueResult.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const issue = issueResult.rows[0];

        if (String(issue.reported_by) === String(req.user.id)) {
            return res.status(403).json({
                message: "You cannot vote for your own complaint"
            });
        }

        if (["RESOLVED", "CONFIRMED", "REJECTED"].includes(issue.status)) {
            return res.status(400).json({
                message: "This complaint is no longer open for votes"
            });
        }

        const voteResult = await pool.query(
            `INSERT INTO issue_votes (issue_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT (issue_id, user_id) DO NOTHING
             RETURNING id`,
            [req.params.id, req.user.id]
        );

        if (!voteResult.rows.length) {
            return res.status(409).json({
                message: "You have already supported this complaint"
            });
        }

        const countResult = await pool.query(
            "SELECT COUNT(*) AS vote_count FROM issue_votes WHERE issue_id = $1",
            [req.params.id]
        );

        res.status(201).json({
            message: "Your support has been recorded",
            vote_count: countResult.rows[0].vote_count
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Could not record your vote" });
    }
});


router.patch("/:id/status", requireRole("staff", "admin"), async (req, res) => {
    try {
        const { status } = req.body;

        if (!statuses.includes(status)) {
            return res.status(400).json({ message: "Invalid issue status" });
        }

        // Find the complaint and its owner
        const existing = await pool.query(
            `SELECT id, reported_by, title, status
             FROM issues
             WHERE id = $1`,
            [req.params.id]
        );

        if (!existing.rows.length) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const oldIssue = existing.rows[0];

        // Update complaint status
        const result = await pool.query(
            `UPDATE issues
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, req.params.id]
        );

        // Create notification only when status actually changes
        if (oldIssue.status !== status) {
            try {
                await pool.query(
                    `INSERT INTO notifications
                        (user_id, issue_id, title, message, type)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        oldIssue.reported_by,
                        oldIssue.id,
                        "Complaint Status Updated",
                        `Your complaint "${oldIssue.title}" is now ${status.replace(/_/g, " ")}.`,
                        "status"
                    ]
                );
            } catch (notificationError) {
                console.error("Notification creation failed:", notificationError.message);
            }
        }

        res.json({
            message: "Status updated",
            issue: result.rows[0]
        });

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