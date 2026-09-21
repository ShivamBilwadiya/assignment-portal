const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// POST /assignments - Create a new assignment
app.post("/assignments", async (req, res) => {
    try {
        const { title, deadline } = req.body;
        const query = `
            INSERT INTO assignments (title, deadline)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await pool.query(query, [title, deadline]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /assignments - Return all assignments (or filtered by submitted status)
app.get("/assignments", async (req, res) => {
    try {
        const { submitted } = req.query;

        if (submitted !== undefined) {
            const query = `
                SELECT *
                FROM assignments
                WHERE submitted = $1
                ORDER BY id DESC;
            `;
            const result = await pool.query(query, [submitted]);
            return res.status(200).json(result.rows);
        }

        const query = `
            SELECT *
            FROM assignments
            ORDER BY id DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /assignments/:id - Mark assignment as submitted
app.patch("/assignments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE assignments
            SET submitted = true
            WHERE id = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /assignments/:id - Delete an assignment
app.delete("/assignments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            DELETE FROM assignments
            WHERE id = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.status(200).json({
            message: "Assignment deleted successfully",
            assignment: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
