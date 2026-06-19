import express from "express";
const router = express.Router();
import reportController from "./report.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks on any report route (platformReport had an
// inline check in the controller, but nothing else did — an ACCOUNTANT or
// TENANT could call /reports/expense or /reports/occupancy for any mall).

const allRoles = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT"
);
const managementOnly = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT"
);
const adminOnly = requireRole("SUPER_ADMIN");

router.get("/dashboard/stats", allRoles, reportController.dashboardStats);
router.get("/platform", adminOnly, reportController.platformReport);
router.get("/revenue", managementOnly, reportController.revenueChart);
router.get("/activities", allRoles, reportController.recentActivities);
router.get("/occupancy", managementOnly, reportController.occupancyReport);
router.get("/expense", managementOnly, reportController.expenseReport);
router.get("/:type/export", managementOnly, reportController.exportReport);

export default router;
