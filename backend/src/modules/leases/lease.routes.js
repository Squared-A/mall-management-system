import express from "express";
const router = express.Router();
import leaseController from "./lease.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks on any lease route.

const canManageLeases = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");
const canViewLeases = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT" // tenants may view their own leases (enforced in the service)
);

router.post("/add", canManageLeases, leaseController.addLease);
router.get("/", canViewLeases, leaseController.getLeases);
router.get("/:id", canViewLeases, leaseController.getLease);
router.put("/:id", canManageLeases, leaseController.updateLease);
router.post("/:id/terminate", canManageLeases, leaseController.terminateLease);
router.post("/:id/expire", canManageLeases, leaseController.expireLease);
router.post("/:id/renew", canManageLeases, leaseController.renewLease);
router.delete("/:id", canManageLeases, leaseController.deleteLease);

export default router;
