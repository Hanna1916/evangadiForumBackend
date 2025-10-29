import db from "../config/dbConfig.js";
import { StatusCodes } from "http-status-codes";

// Get All Questions
export const getAllQuestions = async (req, res) => {
  try {
    const [questions] = await db.query(
      `SELECT q.question_id, q.title, q.description, q.tag, q.created_at, q.updated_at, 
              u.username, u.email 
       FROM questions q 
       JOIN users u ON q.user_id = u.id 
       ORDER BY q.created_at DESC`
    );

    res.status(200).json({ message: "All questions retrieved", questions });
  } catch (err) {
    console.error("Get All Questions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single Question
// Get Single Question
export const getSingleQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    console.log("🔄 Fetching single question:", question_id);

    const [question] = await db.query(
      `SELECT q.question_id, q.title, q.description, q.tag, q.created_at, q.updated_at,
              u.username, u.email
       FROM questions q
       JOIN users u ON q.user_id = u.id
       WHERE q.question_id = ?`,
      [question_id]
    );

    console.log("✅ Query result length:", question.length);

    if (question.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ question: question[0] });
  } catch (err) {
    console.error("❌ Get Single Question Error:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Could not retrieve question",
    });
  }
};
// Create Question (REPLACE THIS FUNCTION)
export const createQuestion = async (req, res) => {
  try {
    console.log("🔄 createQuestion called");
    console.log("📦 Request body:", req.body);
    console.log("👤 Authenticated user:", req.user);

    const { title, description, tag } = req.body;

    if (!title || !description) {
      console.log("❌ Missing title or description");
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Get user ID from authenticated user
    const user_id = req.user.id;
    console.log("👤 Using user_id:", user_id);

    if (!user_id) {
      console.log("❌ No user_id found");
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    console.log("🗄️ Inserting into database...");

    // Insert the question
    const [result] = await db.query(
      "INSERT INTO questions (title, description, tag, user_id) VALUES (?, ?, ?, ?)",
      [title, description, tag || null, user_id]
    );

    console.log("✅ Database insert successful, ID:", result.insertId);

    // Get the newly created question
    const [newQuestion] = await db.query(
      `SELECT q.question_id, q.title, q.description, q.tag, q.created_at, q.updated_at,
              u.username, u.email
       FROM questions q
       JOIN users u ON q.user_id = u.id
       WHERE q.question_id = ?`,
      [result.insertId]
    );

    console.log("✅ Question created successfully:", newQuestion[0]);
    res.status(201).json(newQuestion[0]);
  } catch (err) {
    console.error("❌ Create question error details:");
    console.error("   Error message:", err.message);
    console.error("   Error code:", err.code);
    console.error("   SQL message:", err.sqlMessage);

    res.status(500).json({
      error: "Internal Server Error",
      message: "Could not create question",
    });
  }
};
