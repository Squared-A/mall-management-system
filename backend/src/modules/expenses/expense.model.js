import mongoose from "mongoose";

const expenseSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true,
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
      required: true,
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
      default: false, // previously had no default, so isDeleted:false filters matched nothing
    },
  },
  {
    timestamps: true,
  },
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
