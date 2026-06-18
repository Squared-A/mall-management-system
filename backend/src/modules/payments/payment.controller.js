import paymentService from "./payment.service.js";

const addPayment = async (req, res) => {
  try {
    const result = await paymentService.addPayment(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await paymentService.updatePayment({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const result = await paymentService.getPayments();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await paymentService.getPayment(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await paymentService.deletePayment(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addPayment,
  updatePayment,
  getPayments,
  getPayment,
  deletePayment,
};
