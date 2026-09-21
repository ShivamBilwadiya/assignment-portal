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

// GET /assignments - Return all assignments (newest first)
app.get("/assignments", async (req, res) => {
    try {
        const query = `
            SELECT * FROM assignments
            ORDER BY id DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
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
