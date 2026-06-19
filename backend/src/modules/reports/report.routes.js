import express from "express";
const router = express.Router();
import reportController from "./report.controller.js";

router.get("/dashboard", reportController.dashboardStats);
router.get("/revenue", reportController.revenueChart);

export default router;
