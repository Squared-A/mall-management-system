import express from "express";
const router = express.Router();
import announcementController from "./announcement.controller.js";

router.post("/add", announcementController.addAnnouncement);
router.get("/", announcementController.getAnnouncements);
router.get("/:id", announcementController.getAnnouncement);
router.put("/:id", announcementController.updateAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);

export default router;
