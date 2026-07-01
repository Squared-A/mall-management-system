import express from "express";
const router = express.Router();
import shopController from "./shop.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks. Any authenticated user — including a
// TENANT — could create, edit, or delete any shop in any mall.

const canManageShops = requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER");
const canViewShops = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT",
  "TENANT"
);

router.post("/register", canManageShops, shopController.registerShop);
router.get("/", canViewShops, shopController.getShops);
router.get("/:id", canViewShops, shopController.getShop);
router.put("/:id", canManageShops, shopController.updateShop);
router.delete("/:id", canManageShops, shopController.deleteShop);

export default router;
