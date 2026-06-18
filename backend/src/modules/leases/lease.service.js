import mongoose from "mongoose";
import Lease from "./lease.model.js";

const addLease = async (data) => {
  const newLease = await Lease.create(data);
  return newLease;
};

const updateLease = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Lease.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getLeases = async (mallId) => {
  const leases = await Lease.find({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  return leases;
};

const getLease = async (id) => {
  const lease = await Lease.findById(id);
  return lease;
};

const deleteLease = async (id) => {
  await Lease.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addLease,
  updateLease,
  getLease,
  getLeases,
  deleteLease,
};
