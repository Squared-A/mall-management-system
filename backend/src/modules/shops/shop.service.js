import mongoose from "mongoose";
import Shop from "./shop.model.js";

const registerShop = async (data) => {
  const newShop = await Shop.create(data);
  return newShop;
};

const updateShop = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Shop.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getShops = async (mallId) => {
  const shops = await Shop.find({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  return shops;
};

const getShop = async (id) => {
  const shop = await Shop.findById(id);
  return shop;
};

const deleteShop = async (id) => {
  await Shop.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default { registerShop, updateShop, getShop, getShops, deleteShop };
