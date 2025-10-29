import db from "../config/dbConfig.js";

// Get Answers Controller
export const getAnswers = async (req, res) => {
  const { question_id } = req.params;
  try {
    console.log("🔄 Fetching answers for question:", question_id);

    const [answers] = await db.query(
      `SELECT a.answer_id, a.answer, u.username AS user_name, a.created_at
       FROM answers a 
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ? 
       ORDER BY a.created_at ASC`,
      [question_id]
    );

    console.log("✅ Answers found:", answers.length);
    res.status(200).json({ answers: answers || [] });
  } catch (err) {
    console.error("❌ Get Answers Error:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Could not retrieve answers",
    });
  }
};

// Post Answer Controller
export const postAnswer = async (req, res) => {
  try {
    const { question_id, answer } = req.body;
    const user_id = req.user.id; // ✅ Get from authenticated user

    console.log("🔄 Posting answer:", { question_id, answer, user_id });

    if (!question_id || !answer) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Please provide question_id and answer",
      });
    }

    await db.query(
      "INSERT INTO answers (question_id, answer, user_id) VALUES (?, ?, ?)",
      [question_id, answer, user_id]
    );

    res.status(201).json({ message: "Answer posted successfully" });
  } catch (err) {
    console.error("❌ Post Answer Error:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Could not post answer",
    });
  }
};
