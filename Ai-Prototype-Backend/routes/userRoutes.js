// routes/userRoutes.js
const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during signup" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login =>", email, password )

    // Find user
    const user = await User.findOne({ email });
    console.log("user =>", user )
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
