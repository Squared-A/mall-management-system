import express from "express";
const router = express.Router();
import authController from "./auth.controller.js";
import authValidation from "./auth.validation.js";

router.post("/login", authValidation.validateLogin, authController.login);

export default router;
