import express from "express";
const router = express.Router();
import expenseController from "./expense.controller.js";
import { requireRole } from "../../middlewares/roleMiddleware.js";

// Previously: zero role checks — any authenticated user, including a
// TENANT, could create/view/delete a mall's expense records.

const canManageExpenses = requireRole(
  "SUPER_ADMIN",
  "MALL_OWNER",
  "MALL_MANAGER",
  "ACCOUNTANT"
);

router.post("/add", canManageExpenses, expenseController.addExpense);
router.get("/", canManageExpenses, expenseController.getExpenses);
router.get("/:id", canManageExpenses, expenseController.getExpense);
router.put("/:id", canManageExpenses, expenseController.updateExpense);
router.delete("/:id", canManageExpenses, expenseController.deleteExpense);

export default router;
