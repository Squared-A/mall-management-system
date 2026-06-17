import authRepository from "./auth.repository.js";
import { updateLastLogin } from "../users/users.services.js";
import bcrypt from "bcrypt";
import generateToken from "./utils/jwt.js";

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }
  const token = generateToken({ id: user._id, role: user.role });
  const lastLogin = new Date();
  await updateLastLogin(user._id, lastLogin);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      role: user.role,
    },
  };
};

export default { login };
