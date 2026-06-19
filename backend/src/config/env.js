import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Previously: `dotenv.config({ path: "../.env" })` resolves relative to
// process.cwd() (wherever `node` was invoked from), not relative to this
// file. That meant the .env file was only found by accident, depending on
// which directory the server happened to be started from — running
// `node src/server.js` from the backend/ folder vs. the repo root would
// load (or silently fail to load) different things.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // Previously a missing JWT_SECRET would silently flow into
  // `jwt.sign(payload, undefined, ...)`, which either throws a cryptic
  // low-level error far from its real cause, or in some jsonwebtoken
  // versions produces a token signed with the literal string "undefined"
  // — a real, exploitable secret. Fail loudly and immediately instead.
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "Create a .env file in the backend/ directory (see .env.example)."
  );
  process.exit(1);
}

const env = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export default env;
