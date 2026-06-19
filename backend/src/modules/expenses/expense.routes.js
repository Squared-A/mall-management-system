import express from "express";
const router = express.Router();
import expenseController from "./expense.controller.js";

router.post("/add", expenseController.addExpense);
router.get("/", expenseController.getExpenses);
router.get("/:id", expenseController.getExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

export default router;
