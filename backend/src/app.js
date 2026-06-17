// Express app setup
import express from "express";
const app = express();
const router = express.Router();

//getting api routes
import authRoutes from "./modules/auth/auth.routes.js";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

// Routes

// Error handling

export default app;
