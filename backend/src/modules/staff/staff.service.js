import mongoose from "mongoose";
import Staff from "./staff.model.js";

const addStaff = async (data) => {
  const newStaff = await Staff.create(data);
  return newStaff;
};

const updateStaff = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Staff.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getStaffs = async (mallId) => {
  const staffs = await Staff.find({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  return staffs;
};

const getStaff = async (id) => {
  const staff = await Staff.findById(id);
  return staff;
};

const deleteStaff = async (id) => {
  await Staff.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default {
  addStaff,
  updateStaff,
  getStaff,
  getStaffs,
  deleteStaff,
};
