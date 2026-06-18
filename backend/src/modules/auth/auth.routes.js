import express from "express";
const router = express.Router();
import authController from "./auth.controller.js";
import authValidation from "./auth.validation.js";

router.post("/login", authController.login);
router.post("/register", authController.register);

export default router;
