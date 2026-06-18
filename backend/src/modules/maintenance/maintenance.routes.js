import express from "express";
const router = express.Router();
import maintenanceController from "./maintenance.controller.js";

router.post("/add", maintenanceController.addMaintenance);
router.get("/", maintenanceController.getMaintenances);
router.get("/:id", maintenanceController.getMaintenance);
router.put("/:id", maintenanceController.updateMaintenance);
router.delete("/:id", maintenanceController.deleteMaintenance);

export default router;
