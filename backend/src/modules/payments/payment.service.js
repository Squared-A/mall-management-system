import Payment from "./payment.model.js";

const addPayment = async (data) => {
  const newPayment = await Payment.create(data);
  return newPayment;
};

const updatePayment = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Payment.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getPayments = async () => {
  const payments = await Payment.find({ isDeleted: false }).populate("Lease");
  const filteredPayments = payments.filter((p) => p.lease?.mallId === mallId);
  return filteredPayments;
};

const getPayment = async (id) => {
  const payment = await Payment.findById(id);
  return payment;
};

const deletePayment = async (id) => {
  await Payment.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addPayment,
  updatePayment,
  getPayment,
  getPayments,
  deletePayment,
};
