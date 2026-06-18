import express from "express";
const router = express.Router();
import leaseController from "./lease.controller.js";

router.post("/add", leaseController.addLease);
router.get("/", leaseController.getLeases);
router.get("/:id", leaseController.getLease);
router.put("/:id", leaseController.updateLease);
router.delete("/:id", leaseController.deleteLease);

export default router;
