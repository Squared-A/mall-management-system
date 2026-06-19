import paymentService from "./payment.service.js";

const addPayment = async (req, res) => {
  try {
    const result = await paymentService.addPayment(req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await paymentService.updatePayment({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    // Previously called with zero arguments, which would have crashed the
    // (also-broken) service as soon as that bug was fixed, since the
    // service destructures its filter context from this argument.
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallId: userMallId, mallIds, tenantId } = req.user;
    const result = await paymentService.getPayments({
      mallId,
      userRole: role,
      userMallId,
      userMallIds: mallIds,
      userTenantId: tenantId,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await paymentService.getPayment(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await paymentService.deletePayment(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  addPayment,
  updatePayment,
  getPayments,
  getPayment,
  deletePayment,
};
