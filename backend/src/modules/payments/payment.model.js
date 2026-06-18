import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    amount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["bank", "cash"],
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    invoiceNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
