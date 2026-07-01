import express from "express";
const router = express.Router();
import tenantController from "./tenant.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks — any authenticated user (including a
// TENANT) could register, edit, or delete any tenant in any mall.

const canManageTenants = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");
const canViewTenants = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT"
);

router.post("/register", canManageTenants, tenantController.registerTenant);
router.get("/", canViewTenants, tenantController.getTenants);
router.get("/:id", canViewTenants, tenantController.getTenant);
router.put("/:id", canManageTenants, tenantController.updateTenant);
router.delete("/:id", canManageTenants, tenantController.deleteTenant);

export default router;
