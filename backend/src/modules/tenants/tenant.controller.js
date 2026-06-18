import tenantService from "./tenant.service.js";

const registerTenant = async (req, res) => {
  try {
    const result = await tenantService.registerTenant(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await tenantService.updateTenant({ id, data: req.body });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getTenants = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await tenantService.getTenants(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getTenant = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tenantService.getTenant(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await tenantService.deleteTenant(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  registerTenant,
  updateTenant,
  getTenants,
  getTenant,
  deleteTenant,
};
