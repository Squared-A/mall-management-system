import express from "express";
const router = express.Router();
import staffController from "./staff.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks — any authenticated user could add, edit,
// or remove staff anywhere in the system.

const canManageStaff = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");
const canViewStaff = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");

router.post("/add", canManageStaff, staffController.addStaff);
router.get("/", canViewStaff, staffController.getStaffs);
router.get("/:id", canViewStaff, staffController.getStaff);
router.put("/:id", canManageStaff, staffController.updateStaff);
router.delete("/:id", canManageStaff, staffController.deleteStaff);

export default router;
