import express from "express";
const router = express.Router();
import maintenanceController from "./maintenance.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks. Tenants may file/view their own tickets;
// only staff roles may manage (update status/assignment) or delete tickets.

const canFileOrView = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT"
);
const canManage = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");

router.post("/add", canFileOrView, maintenanceController.addMaintenance);
router.get("/", canFileOrView, maintenanceController.getMaintenances);
router.get("/:id", canFileOrView, maintenanceController.getMaintenance);
router.put("/:id", canFileOrView, maintenanceController.updateMaintenance);
router.delete("/:id", canManage, maintenanceController.deleteMaintenance);

export default router;
