import express from "express";
const router = express.Router();
import auditLogController from "./auditLog.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Audit logs are sensitive (who did what) — restricted to owners and
// platform admins.
router.get(
  "/",
  requireRole("SUPER_ADMIN", "MALL_OWNER"),
  auditLogController.getLogs
);

export default router;
