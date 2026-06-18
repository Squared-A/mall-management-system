import express from "express";
const router = express.Router();
import shopController from "./shop.controller.js";

router.post("/register", shopController.registerShop);
router.get("/", shopController.getShops);
router.get("/:id", shopController.getShop);
router.put("/:id", shopController.updateShop);
router.delete("/:id", shopController.deleteShop);

export default router;
