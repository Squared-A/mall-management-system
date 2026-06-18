import mongoose from "mongoose";
import Tenant from "./tenant.model.js";

const registerTenant = async (data) => {
  const newTenant = await Tenant.create(data);
  return newTenant;
};

const updateTenant = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Tenant.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getTenants = async (mallId) => {
  const tenants = await Tenant.find({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  return tenants;
};

const getTenant = async (id) => {
  const tenant = await Tenant.findById(id);
  return tenant;
};

const deleteTenant = async (id) => {
  await Tenant.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  registerTenant,
  updateTenant,
  getTenant,
  getTenants,
  deleteTenant,
};
