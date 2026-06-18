import Mall from "./mall.model.js";
import User from "../users/user.model.js";

const registerMall = async (data) => {
  const userId = data.ownerId;
  const newMall = await Mall.create(data);
  await User.findByIdAndUpdate(userId, { mallId: newMall._id });
  return newMall;
};

const updateMall = async ({ id, data }) => {
  console.log(id, data);
  const updated = await Mall.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

const getMalls = async () => {
  const malls = await Mall.find({ isDeleted: false });
  return malls;
};

const getMall = async (id) => {
  const mall = await Mall.findById(id);
  return mall;
};

const deleteMall = async (id) => {
  await Mall.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

export default { registerMall, updateMall, getMall, getMalls, deleteMall };
