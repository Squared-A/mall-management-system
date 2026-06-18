import User from "../users/user.model.js";
// import { updateLastLogin } from "../users/users.services.js";
import bcrypt from "bcrypt";
import generateToken from "../../utils/jwt.js";

const register = async (data) => {
  const existingUser = await User.findOne({
    email: data.email,
    isDeleted: false,
  });

  if (existingUser) {
    throw new Error("user with this email found!");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = User.create({ ...data, password: hashedPassword });

  const token = generateToken({
    id: newUser._id,
    role: newUser.role,
    mallId: user.mallId,
  });

  return {
    newUser,
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email, isDeleted: false }).select(
    "+password",
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }
  const token = generateToken({
    id: user._id,
    role: user.role,
    mallId: user.mallId,
  });
  const lastLogin = new Date();
  await User.findByIdAndUpdate(user._id, lastLogin);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      mallId: user.mallId,
      role: user.role,
    },
  };
};

export default { register, login };
