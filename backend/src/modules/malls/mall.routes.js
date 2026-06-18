import express from "express";
const router = express.Router();
import mallController from "./mall.controller.js";

router.post("/register", mallController.registerMall);
router.get("/", mallController.getMalls);
router.get("/:id", mallController.getMall);
router.put("/:id", mallController.updateMall);
router.delete("/:id", mallController.deleteMall);

export default router;
