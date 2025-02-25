const express = require("express");
const pool = require("./db");

const router = express.Router();

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, id]);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
