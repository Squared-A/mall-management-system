import express from "express";
const router = express.Router();
import tenantController from "./tenant.controller.js";

router.post("/register", tenantController.registerTenant);
router.get("/", tenantController.getTenants);
router.get("/:id", tenantController.getTenant);
router.put("/:id", tenantController.updateTenant);
router.delete("/:id", tenantController.deleteTenant);

export default router;
