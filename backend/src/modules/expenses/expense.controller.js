import expenseService from "./expense.service.js";

const addExpense = async (req, res) => {
  try {
    const mallId = req.body.mallId || req.user.mallId;
    const result = await expenseService.addExpense(
      { ...req.body, mallId },
      req.user
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await expenseService.updateExpense({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallId: userMallId, mallIds } = req.user;
    const result = await expenseService.getExpenses({
      mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await expenseService.getExpense(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await expenseService.deleteExpense(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  addExpense,
  updateExpense,
  getExpenses,
  getExpense,
  deleteExpense,
};
