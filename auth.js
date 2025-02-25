const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const sendMail = require("./mailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Store OTPs temporarily (consider using Redis or a database in production)
const otpStore = new Map();

// Request OTP
router.post("/request-otp", async (req, res) => {
    const { email } = req.body;
    console.log("Received OTP request for:", email);

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated OTP:", otp);

      console.log("Attempting to insert OTP into DB...");
      const result = await pool.query("INSERT INTO otps (email, otp) VALUES ($1, $2)", [email, otp]);
      console.log("DB Insert Result:", result);

      console.log("Attempting to send email...");
      await sendMail(email, "Your OTP", `Your OTP is: ${otp}`);
      console.log("Email sent successfully");

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error during OTP request:", error);
      res.status(500).json({ error: "Error sending OTP" });
    }
});


  router.post("/register", async (req, res) => {
    const { email, password, otp } = req.body;
    try {
      const otpResult = await pool.query("SELECT * FROM otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1", [email]);
  
      if (otpResult.rows.length === 0 || otpResult.rows[0].otp !== otp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
  
      await pool.query("DELETE FROM otps WHERE email = $1", [email]);
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (email, password, verified) VALUES ($1, $2, true) RETURNING *",
        [email, hashedPassword]
      );
  
      res.json({ message: "User registered successfully", user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });
      if (!user.rows[0].verified) return res.status(400).json({ error: "User not verified. Please complete OTP verification." });
  
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) return res.status(400).json({ error: "Invalid password" });
  
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
