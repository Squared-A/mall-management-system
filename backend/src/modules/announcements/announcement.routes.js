import express from "express";
const router = express.Router();
import announcementController from "./announcement.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks (moot in practice since the broken service
// always returned an empty list, but writes were still wide open to any
// authenticated user).

const canManage = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");
const canView = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT"
);

router.post("/add", canManage, announcementController.addAnnouncement);
router.get("/", canView, announcementController.getAnnouncements);
router.get("/:id", canView, announcementController.getAnnouncement);
router.put("/:id", canManage, announcementController.updateAnnouncement);
router.delete("/:id", canManage, announcementController.deleteAnnouncement);

export default router;
