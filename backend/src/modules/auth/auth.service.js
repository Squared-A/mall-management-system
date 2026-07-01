import User from "../users/user.model.js";
import Mall from "../malls/mall.model.js";
import Tenant from "../tenants/tenant.model.js";
import bcrypt from "bcrypt";
import generateToken, {
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

const APPROVED = "APPROVED";

const summarizeOwnerMalls = async (mallIds = []) => {
  if (!mallIds?.length) {
    return {
      mallApprovalStatus: null,
      hasApprovedMall: false,
      hasPendingMall: false,
      malls: [],
    };
  }

  const malls = await Mall.find({
    _id: { $in: mallIds },
    isDeleted: false,
  }).select("_id name status");

  const serializedMalls = malls.map((mall) => ({
    _id: mall._id,
    name: mall.name,
    status: mall.status,
  }));
  const hasApprovedMall = serializedMalls.some((mall) => mall.status === APPROVED);
  const hasPendingMall = serializedMalls.some((mall) => mall.status === "PENDING");

  return {
    mallApprovalStatus: hasApprovedMall ? APPROVED : serializedMalls[0]?.status || null,
    hasApprovedMall,
    hasPendingMall,
    malls: serializedMalls,
  };
};

const buildAuthUser = async (user, { tenantId = null, lastLogin = user.lastLogin } = {}) => {
  const authUser = {
    id: user._id,
    name: user.fullName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    lastLogin,
    mallId: user.mallId,
    mallIds: user.mallIds || [],
    tenantId,
    role: user.role,
    isActive: user.isActive,
  };

  if (user.role === "MALL_OWNER") {
    return {
      ...authUser,
      ...(await summarizeOwnerMalls(user.mallIds || [])),
    };
  }

  if (user.mallId) {
    const mall = await Mall.findOne({ _id: user.mallId, isDeleted: false }).select(
      "status",
    );
    authUser.mallApprovalStatus = mall?.status || null;
    authUser.hasApprovedMall = mall?.status === APPROVED;
  }

  return authUser;
};

// Generic self-registration is intentionally narrow: it may only ever
// create a SUPER_ADMIN-less, mall-less account. It must NEVER honor a
// `role` field from the request body. The original implementation did
// `User.create({ ...data })`, which let callers grant themselves platform access.
const register = async (data) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  if (!data.password || data.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await User.create({
    fullName: data.fullName,
    email: normalizedEmail,
    phone: data.phone,
    password: hashedPassword,
    role: "MALL_OWNER",
    mallIds: [],
  });

  const token = generateToken({
    id: newUser._id,
    role: newUser.role,
    mallIds: newUser.mallIds,
  });
  const refreshTokenValue = generateRefreshToken({ id: newUser._id });

  return {
    user: await buildAuthUser(newUser),
    token,
    accessToken: token,
    refreshToken: refreshTokenValue,
  };
};

// Registers a new mall owner and their first mall in one flow.
const registerMallOwner = async (data) => {
  const {
    mallName,
    ownerName,
    email,
    phone,
    password,
    address,
    city,
    floors,
    totalShops,
    description,
    logo,
  } = data;

  if (!mallName || !ownerName || !email || !password) {
    throw new Error(
      "mallName, ownerName, email, and password are required to register a mall"
    );
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const owner = await User.create({
    fullName: ownerName,
    email: normalizedEmail,
    phone,
    password: hashedPassword,
    role: "MALL_OWNER",
    mallIds: [],
  });

  let newMall;
  try {
    newMall = await Mall.create({
      ownerId: owner._id,
      name: mallName,
      address: address || "Not provided",
      city: city || "Not provided",
      floors: floors || 1,
      totalShops: totalShops || 0,
      description: description || "",
      logo: logo || "",
      status: "PENDING",
    });
  } catch (err) {
    await User.findByIdAndDelete(owner._id);
    throw err;
  }

  owner.mallIds = [newMall._id];
  await owner.save();

  const token = generateToken({
    id: owner._id,
    role: owner.role,
    mallIds: owner.mallIds,
  });
  const refreshTokenValue = generateRefreshToken({ id: owner._id });

  return {
    user: await buildAuthUser(owner),
    mall: newMall,
    token,
    accessToken: token,
    refreshToken: refreshTokenValue,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
    isDeleted: false,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("This account has been deactivated");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  let tenantId = null;
  if (user.role === "TENANT") {
    const tenantProfile = await Tenant.findOne({
      userId: user._id,
      isDeleted: false,
    }).select("_id");
    tenantId = tenantProfile?._id || null;
  }

  const token = generateToken({
    id: user._id,
    role: user.role,
    mallId: user.mallId,
    mallIds: user.mallIds,
    tenantId,
  });
  const refreshTokenValue = generateRefreshToken({ id: user._id });
  const lastLogin = new Date();
  await User.findByIdAndUpdate(user._id, { lastLogin });

  return {
    token,
    accessToken: token,
    refreshToken: refreshTokenValue,
    user: await buildAuthUser(user, { tenantId, lastLogin }),
  };
};

const refreshToken = async (token) => {
  if (!token) {
    throw new Error("No refresh token provided");
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id);
  if (!user || user.isDeleted || !user.isActive) {
    throw new Error("Invalid refresh token");
  }

  let tenantId = null;
  if (user.role === "TENANT") {
    const tenantProfile = await Tenant.findOne({
      userId: user._id,
      isDeleted: false,
    }).select("_id");
    tenantId = tenantProfile?._id || null;
  }

  const accessToken = generateToken({
    id: user._id,
    role: user.role,
    mallId: user.mallId,
    mallIds: user.mallIds,
    tenantId,
  });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  return { accessToken, refreshToken: newRefreshToken };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");

  let tenantId = null;
  if (user.role === "TENANT") {
    const tenantProfile = await Tenant.findOne({
      userId: user._id,
      isDeleted: false,
    }).select("_id");
    tenantId = tenantProfile?._id || null;
  }

  return buildAuthUser(user, { tenantId });
};

const updateProfile = async (userId, data) => {
  const allowedFields = ["fullName", "email", "phone"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field]) updateData[field] = data[field];
  });
  const updated = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  return buildAuthUser(updated);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (!user) throw new Error("User not found");
  // TODO: Implement email sending for password reset
};

const resetPassword = async () => {
  // TODO: Implement password reset with token verification
  throw new Error("Password reset not implemented");
};

export default {
  register,
  registerMallOwner,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
