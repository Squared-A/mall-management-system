import express from "express";
const router = express.Router();
import paymentController from "./payment.controller.js";

router.post("/add", paymentController.addPayment);
router.get("/", paymentController.getPayments);
router.get("/:id", paymentController.getPayment);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

export default router;
