import express from "express";
const router = express.Router();
import authController from "./auth.controller.js";
import authValidation from "./auth.validation.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

router.post("/login", authValidation.validateLogin, authController.login);
router.post("/register", authValidation.validateRegister, authController.register);
router.post("/register-mall", authValidation.validateRegisterMall, authController.registerMall);
router.post("/refresh", authController.refreshToken);
router.post("/logout", verifyToken, authController.logout);
router.get("/me", verifyToken, authController.getProfile);
router.put("/me", verifyToken, authController.updateProfile);
router.put("/change-password", verifyToken, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
