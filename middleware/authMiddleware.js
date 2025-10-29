import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔐 Auth middleware - Headers:", req.headers);
  console.log("🔐 Auth header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No or invalid auth header");
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authorization header missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔐 Token received:", token.substring(0, 20) + "...");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token valid, user:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Token invalid:", err.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired token",
    });
  }
};
