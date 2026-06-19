import Expense from "./expense.model.js";

const addExpense = async (data) => {
  const newExpense = await Expense.create(data);
  return newExpense;
};

const updateExpense = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Expense.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getExpenses = async () => {
  const expenses = await Expense.find({ isDeleted: false }).populate("Lease");
  const filteredExpenses = expenses.filter((p) => p.lease?.mallId === mallId);
  return filteredExpenses;
};

const getExpense = async (id) => {
  const expense = await Expense.findById(id);
  return expense;
};

const deleteExpense = async (id) => {
  await Expense.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addExpense,
  updateExpense,
  getExpense,
  getExpenses,
  deleteExpense,
};
