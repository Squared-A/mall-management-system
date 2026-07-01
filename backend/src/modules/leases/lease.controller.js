import leaseService from "./lease.service.js";

const addLease = async (req, res) => {
  try {
    // Previously hardcoded to req.user.mallId, which is undefined for
    // MALL_OWNER (owners use mallIds[]), so owners could never create a
    // lease at all. mallId now comes from the body/query (validated against
    // ownership inside the service) and falls back to the user's own
    // assigned mall for single-mall roles.
    const mallId = req.body.mallId || req.user.mallId;
    if (!mallId) {
      return res
        .status(400)
        .json({ success: false, message: "mallId is required." });
    }
    const result = await leaseService.addLease(
      { ...req.body, mallId },
      req.user
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateLease = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await leaseService.updateLease({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const terminateLease = async (req, res) => {
  try {
    const result = await leaseService.terminateLease(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const expireLease = async (req, res) => {
  try {
    const result = await leaseService.expireLease(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const renewLease = async (req, res) => {
  try {
    const result = await leaseService.renewLease(
      req.params.id,
      req.body,
      req.user
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getLeases = async (req, res) => {
  try {
    // Previously called leaseService.getLeases(mallId) with a bare string,
    // but the service destructures { mallId, userRole } from its argument
    // — userRole was always undefined, so the MALL_OWNER/MALL_MANAGER
    // scoping branch never activated and every authenticated user received
    // every lease in the entire system.
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallId: userMallId, mallIds, tenantId } = req.user;
    const result = await leaseService.getLeases({
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

const getLease = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await leaseService.getLease(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteLease = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await leaseService.deleteLease(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  addLease,
  updateLease,
  terminateLease,
  expireLease,
  renewLease,
  getLeases,
  getLease,
  deleteLease,
};
