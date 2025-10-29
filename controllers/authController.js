import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";
// Register Controller (Simplified - matches your database)
export const register = async (req, res) => {
  try {
    console.log("📨 Register request body:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    // Check if user exists
    const [userExists] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (userExists.length > 0) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (only fields that exist in your table)
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    console.log("✅ User registered successfully:", username);
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("❌ Register error details:", err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};
// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user || user.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const existingUser = user[0];
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email }, // ✅ Use 'id' not 'user_id'
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: existingUser.id, // ✅ Use 'id' as 'user_id' for frontend
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check User Controller
export const checkUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db.query(
      "SELECT id, username, email FROM users WHERE id = ?", // ✅ Use 'id' not 'user_id'
      [userId]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ message: "User authenticated", user: user[0] });
  } catch (err) {
    console.error("CheckUser error:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
};
