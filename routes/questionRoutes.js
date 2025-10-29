import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllQuestions,
  getSingleQuestion,
  createQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

// ✅ GET routes (public - no auth needed)
router.get("/", getAllQuestions); // GET /api/question/
router.get("/:question_id", getSingleQuestion); // GET /api/question/123

// ✅ POST route (protected - needs auth)
router.post("/", authenticate, createQuestion); // POST /api/question/

export default router;
