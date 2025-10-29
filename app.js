import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/dbConfig.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORRECTED: Mount routes ONLY ONCE
app.use("/api/user", authRoutes);
app.use("/api/question", questionRoutes); // Remove authenticate from here
app.use("/api/answer", answerRoutes);

// Test DB connection once before starting server
(async () => {
  try {
    const connection = await db.getConnection();
    await connection.query("SELECT 1");
    console.log(" Database connected successfully");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
})();

// Base route
app.get("/", (req, res) => {
  res.json({
    message: "Evangadi Forum API is running...",
    endpoints: {
      auth: "/api/user",
      questions: "/api/question",
      answers: "/api/answer",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: "Connected",
  });
});
// Update your routes to use temporary data if DB fails
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is running!",
    database: "Using temporary storage for now",
  });
});
// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "RouteNotFound",
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "POST /api/user/register",
      "POST /api/user/login",
      "GET /api/user/checkUser",
      "GET /api/question/",
      "POST /api/question/",
      "GET /api/question/:question_id",
      "GET /api/answer/:question_id",
      "POST /api/answer/",
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  // MySQL duplicate entry error
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "DuplicateEntry",
      message: "This record already exists.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "InvalidToken",
      message: "Invalid authentication token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "TokenExpired",
      message: "Authentication token has expired.",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Promise Rejection:", err);
  console.error("At promise:", promise);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

export default app;
