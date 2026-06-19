import tenantService from "./tenant.service.js";

const registerTenant = async (req, res) => {
  try {
    const result = await tenantService.registerTenant(req.body, req.user);
    res.status(201).json({
      success: true,
      data: result,
      message: "Tenant and user account created successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tenantService.updateTenant({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getTenants = async (req, res) => {
  try {
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallIds } = req.user;
    const result = await tenantService.getTenants({
      mallId,
      userRole: role,
      userMallIds: mallIds,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getTenant = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tenantService.getTenant(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tenantService.deleteTenant(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  registerTenant,
  updateTenant,
  getTenants,
  getTenant,
  deleteTenant,
};
