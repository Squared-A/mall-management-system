import Maintenance from "./maintenance.model.js";

const addMaintenance = async (data) => {
  const newMaintenance = await Maintenance.create(data);
  return newMaintenance;
};

const updateMaintenance = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Maintenance.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getMaintenances = async (mallId) => {
  const maintenances = await Maintenance.find({ isDeleted: false }).populate(
    "shop",
  );
  const filteredMaintenances = maintenances.filter(
    (m) => m.shop?.mallId === mallId,
  );
  return filteredMaintenances;
};

const getMaintenance = async (id) => {
  const maintenance = await Maintenance.findById(id);
  return maintenance;
};

const deleteMaintenance = async (id) => {
  await Maintenance.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addMaintenance,
  updateMaintenance,
  getMaintenance,
  getMaintenances,
  deleteMaintenance,
};
