import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getAnswers, postAnswer } from "../controllers/answerController.js";

const router = express.Router();

router.get("/:question_id", getAnswers);
router.post("/", authenticate, postAnswer);

export default router;
