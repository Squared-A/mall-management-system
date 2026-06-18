import leaseService from "./lease.service.js";

const addLease = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const { tenantId, shopId } = req.body;
    if (!mallId || mallId === null) {
      return res
        .status(401)
        .json({ message: "Access denied. No mallId provided." });
    }
    if (!tenantId || !shopId || tenantId === null || shopId === null) {
      return res.status(401).json({
        message: "Access denied.Both shopId and tenantId are required.",
      });
    }
    const result = await leaseService.addLease({ ...req.body, mallId });
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateLease = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await leaseService.updateLease({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getLeases = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await leaseService.getLeases(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getLease = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await leaseService.getLease(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteLease = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await leaseService.deleteLease(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addLease,
  updateLease,
  getLeases,
  getLease,
  deleteLease,
};
