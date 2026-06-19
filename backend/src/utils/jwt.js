import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Access tokens: short-lived, carry full authorization context (role +
// mall scope) so every request can be authorized without a DB lookup.
const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

// Refresh tokens: long-lived, intentionally minimal payload (just the user
// id) and tagged with a `purpose` claim so an access token can never be
// replayed as a refresh token or vice versa. The original implementation
// had no separate refresh-token generation at all — login() never issued
// one, and refreshToken() just re-signed whatever was handed to it without
// verification, which made the "refresh" endpoint a way to mint a valid
// access token from arbitrary input.
const generateRefreshToken = (payload) => {
  return jwt.sign({ id: payload.id, purpose: "refresh" }, env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (decoded.purpose !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return decoded;
};

export default generateToken;
export { generateToken, generateRefreshToken, verifyRefreshToken };
