const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../models/user.model");

// Middleware setup
const app = express();
app.use(cookieParser());
app.use(express.json());

// ---------------- REGISTER ----------------
module.exports.userRegister = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 5);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (error) {
    console.error("❌ Error in userRegister:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- LOGIN ----------------
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    // Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // console.log("Generated token:", token);

    // ✅ Return token to frontend instead of storing in cookie
    res.status(200).json({
      message: "Login successful ✅",
      token, // send the token in JSON response
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports.logout = (req,res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set true if using HTTPS
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully ✅" });
  } catch (error) {
    console.log("you are n still login not logout", error)
    return res.status(500).json({ message: "error in logout" })
  }
}