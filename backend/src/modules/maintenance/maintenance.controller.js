import maintenanceService from "./maintenance.service.js";

const addMaintenance = async (req, res) => {
  try {
    const result = await maintenanceService.addMaintenance(req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await maintenanceService.updateMaintenance({
      id,
      data: req.body,
      requestingUser: req.user,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMaintenances = async (req, res) => {
  try {
    const mallId = req.query.mallId || req.user.mallId;
    const { role, mallId: userMallId, mallIds, tenantId } = req.user;
    const result = await maintenanceService.getMaintenances({
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

const getMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await maintenanceService.getMaintenance(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await maintenanceService.deleteMaintenance(id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 403;
    res.status(status).json({ success: false, message: error.message });
  }
};

export default {
  addMaintenance,
  updateMaintenance,
  getMaintenances,
  getMaintenance,
  deleteMaintenance,
};
