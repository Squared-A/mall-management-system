import express from "express";
const router = express.Router();
import staffController from "./staff.controller.js";

router.post("/add", staffController.addStaff);
router.get("/", staffController.getStaffs);
router.get("/:id", staffController.getStaff);
router.put("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);

export default router;
