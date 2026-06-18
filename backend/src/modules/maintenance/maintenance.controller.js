import maintenanceService from "./maintenance.service.js";

const addMaintenance = async (req, res) => {
  try {
    const result = await maintenanceService.addMaintenance(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    // console.log(error);
    // console.log(error.response);
    res.status(401).json({ error: error.message });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const result = await maintenanceService.updateMaintenance({
      id,
      data: req.body,
    });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getMaintenances = async (req, res) => {
  try {
    const mallId = req.user.mallId;
    const result = await maintenanceService.getMaintenances(mallId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await maintenanceService.getMaintenance(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await maintenanceService.deleteMaintenance(id);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default {
  addMaintenance,
  updateMaintenance,
  getMaintenances,
  getMaintenance,
  deleteMaintenance,
};
