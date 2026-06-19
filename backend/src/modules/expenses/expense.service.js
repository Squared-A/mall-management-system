import mongoose from "mongoose";
import Expense from "./expense.model.js";
import Mall from "../malls/mall.model.js";

// Previously: `Expense.create(data)` with no validation that mallId was
// present/valid, and no authorization check.
const addExpense = async (data, requestingUser) => {
  const { mallId, amount, category } = data;

  if (!mallId) {
    throw new Error("mallId is required: every expense must belong to a mall");
  }
  if (!amount || amount <= 0) {
    throw new Error("amount must be greater than 0");
  }

  const mall = await Mall.findOne({ _id: mallId, isDeleted: false });
  if (!mall) {
    throw new Error("Mall not found");
  }

  await assertExpenseAccess(mallId, requestingUser);

  const newExpense = await Expense.create({
    mallId,
    category,
    description: data.description,
    amount,
    expenseDate: data.expenseDate,
    paymentMethod: data.paymentMethod,
    vendor: data.vendor,
    receipt: data.receipt,
    createdBy: requestingUser?.id,
  });
  return newExpense;
};

const updateExpense = async ({ id, data, requestingUser }) => {
  const expense = await Expense.findOne({ _id: id, isDeleted: false });
  if (!expense) throw new Error("Expense not found");

  await assertExpenseAccess(expense.mallId, requestingUser);

  const { mallId, createdBy, ...safeData } = data;

  const updated = await Expense.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously: crashed every call with the exact same bug as payments —
// `.populate("Lease")` (Expense has no "Lease" or "leaseId" field at all;
// expenses aren't lease-related) and a reference to an undefined bare
// `mallId` identifier, guaranteeing a ReferenceError on every request.
const getExpenses = async ({ mallId, userRole, userMallId, userMallIds }) => {
  let filter = { isDeleted: false };

  if (userRole === "SUPER_ADMIN") {
    if (mallId) filter.mallId = new mongoose.Types.ObjectId(mallId);
  } else if (userRole === "MALL_OWNER") {
    const owned = userMallIds || [];
    if (mallId) {
      if (!owned.map((m) => m.toString()).includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
      filter.mallId = new mongoose.Types.ObjectId(mallId);
    } else {
      filter.mallId = { $in: owned };
    }
  } else {
    // MALL_MANAGER, ACCOUNTANT (TENANT has no business viewing expenses)
    if (!userMallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(userMallId);
  }

  const expenses = await Expense.find(filter)
    .populate("createdBy", "fullName")
    .sort({ expenseDate: -1 });
  return expenses;
};

const getExpense = async (id, requestingUser) => {
  const expense = await Expense.findOne({
    _id: id,
    isDeleted: false,
  }).populate("createdBy", "fullName");
  if (!expense) throw new Error("Expense not found");

  await assertExpenseAccess(expense.mallId, requestingUser);
  return expense;
};

const deleteExpense = async (id, requestingUser) => {
  const expense = await Expense.findOne({ _id: id, isDeleted: false });
  if (!expense) throw new Error("Expense not found");

  await assertExpenseAccess(expense.mallId, requestingUser);

  await Expense.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

// Only SUPER_ADMIN, MALL_OWNER (own mall), and MALL_MANAGER/ACCOUNTANT
// (assigned mall) may record or view expenses. TENANT and unrelated
// managers/accountants are excluded. Previously there was no such check
// at all.
async function assertExpenseAccess(expenseMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(expenseMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "MALL_MANAGER" || role === "ACCOUNTANT") {
    if (!mallId || mallId.toString() !== expenseMallId.toString()) {
      throw new Error(
        "Access denied. This expense is outside your assigned mall."
      );
    }
    return;
  }

  throw new Error("Access denied. You are not authorized to manage expenses.");
}

export default {
  addExpense,
  updateExpense,
  getExpense,
  getExpenses,
  deleteExpense,
};
