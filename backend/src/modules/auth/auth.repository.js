import User from "../users/users.models.js";

const findUserByEmail = async (email) => {
  return await User.findOne({ email, isDeleted: false });
};

export default {
  findUserByEmail,
};
