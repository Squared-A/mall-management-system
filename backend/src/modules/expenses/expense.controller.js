import expenseService from "./expense.service.js";

const addExpense = async (req, res) => {
  try {
    const result = await expenseService.addExpense(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await expenseService.updateExpense({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const result = await expenseService.getExpenses();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await expenseService.getExpense(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await expenseService.deleteExpense(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addExpense,
  updateExpense,
  getExpenses,
  getExpense,
  deleteExpense,
};
