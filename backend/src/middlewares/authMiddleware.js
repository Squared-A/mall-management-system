import jwt from "jsonwebtoken";
import env from "../config/env.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // Reject refresh tokens presented as access tokens.
    if (decoded.purpose === "refresh") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Token expired." : "Invalid token.";
    return res.status(401).json({ success: false, message });
  }
};

export { verifyToken };
