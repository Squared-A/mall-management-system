import express from "express";
const router = express.Router();
import mallController from "./mall.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Note: verifyToken is already applied globally to "/api/malls" in app.js.
// Previously this router had NO role checks at all — any authenticated
// user, including a TENANT, could register/update/delete a mall.

router.post(
  "/register",
  requireRole("MALL_OWNER", "SUPER_ADMIN"),
  mallController.registerMall
);
router.get(
  "/",
  requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"),
  mallController.getMalls
);
router.get(
  "/:id",
  requireRole("SUPER_ADMIN", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"),
  mallController.getMall
);
router.put(
  "/:id",
  requireRole("MALL_OWNER", "SUPER_ADMIN"),
  mallController.updateMall
);
router.delete(
  "/:id",
  requireRole("MALL_OWNER", "SUPER_ADMIN"),
  mallController.deleteMall
);

export default router;
