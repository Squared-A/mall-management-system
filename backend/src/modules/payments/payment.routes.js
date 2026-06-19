import express from "express";
const router = express.Router();
import paymentController from "./payment.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks — any authenticated user, including a
// TENANT, could create or delete ANY payment record in the system.
// Per the system design: only SUPER_ADMIN, MALL_OWNER, MALL_MANAGER, and
// ACCOUNTANT may create/edit/delete payments. TENANT may only view their
// own (enforced inside the service).

const canManagePayments = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT"
);
const canViewPayments = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT"
);

router.post("/add", canManagePayments, paymentController.addPayment);
router.get("/", canViewPayments, paymentController.getPayments);
router.get("/:id", canViewPayments, paymentController.getPayment);
router.put("/:id", canManagePayments, paymentController.updatePayment);
router.delete("/:id", canManagePayments, paymentController.deletePayment);

export default router;
