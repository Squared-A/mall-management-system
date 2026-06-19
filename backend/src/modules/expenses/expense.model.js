import mongoose from "mongoose";

const expenseSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    category: {
      type: String,
      enum: [
        "UTILITY",
        "SECURITY",
        "CLEANING",
        "SALARY",
        "MAINTENANCE",
        "MARKETING",
        "REPAIR",
        "OTHER",
      ],
      default: "UTILITY",
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
    },
    vendor: {
      type: String,
    },
    receipt: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
