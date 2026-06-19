import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Staff from "./staff.model.js";
import User from "../users/user.model.js";
import Mall from "../malls/mall.model.js";

// Position -> platform role. Previously "security" and "maintenance" were
// BOTH mapped to "MALL_MANAGER" — meaning a security guard or maintenance
// worker hired through this form would silently receive full manager-level
// access to mall management functions. Only roles that genuinely need
// elevated access map to MALL_MANAGER/ACCOUNTANT; everything else gets no
// User account with management privileges. If a position isn't recognized,
// we reject rather than silently defaulting to manager (the prior
// behavior: `roleMap[position] || "MALL_MANAGER"`).
const POSITION_ROLE_MAP = {
  manager: "MALL_MANAGER",
  accountant: "ACCOUNTANT",
};

const resolveRole = (position) => {
  const key = position?.toLowerCase();
  return POSITION_ROLE_MAP[key] || null;
};

// Previously: `Staff.create(data)` — no User account was ever created, so
// staff could never log in. This creates the User and Staff together, with
// rollback on partial failure, and validates the requester's authority
// over the target mall.
const addStaff = async (data, requestingUser) => {
  const {
    email,
    password,
    fullName,
    phone,
    position,
    salary,
    shift,
    mallId,
  } = data;

  if (!email || !password || !fullName || !position) {
    throw new Error("email, password, fullName, and position are required");
  }
  if (!mallId) {
    throw new Error("mallId is required: every staff member must belong to a mall");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const mall = await Mall.findOne({ _id: mallId, isDeleted: false });
  if (!mall) {
    throw new Error("Mall not found");
  }

  // Only an owner of this mall (or a manager already assigned to it, or
  // SUPER_ADMIN) may add staff to it.
  if (requestingUser) {
    if (requestingUser.role === "MALL_OWNER") {
      const owned = (requestingUser.mallIds || []).map((m) => m.toString());
      if (!owned.includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
    } else if (requestingUser.role === "MALL_MANAGER") {
      if (
        !requestingUser.mallId ||
        requestingUser.mallId.toString() !== mallId.toString()
      ) {
        throw new Error("You cannot add staff outside your assigned mall");
      }
    } else if (requestingUser.role !== "SUPER_ADMIN") {
      throw new Error("You are not authorized to add staff");
    }
  }

  const role = resolveRole(position);
  if (!role) {
    throw new Error(
      `Unrecognized position "${position}". Valid positions: ${Object.keys(POSITION_ROLE_MAP).join(", ")}`
    );
  }

  if (requestingUser?.role === "MALL_MANAGER" && role !== "ACCOUNTANT") {
    throw new Error("Mall managers can only create accountant staff accounts");
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

  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    fullName,
    phone: phone?.toString() || "",
    role,
    mallId,
    isActive: true,
  });

  let newStaff;
  try {
    newStaff = await Staff.create({
      userId: user._id,
      mallId,
      fullName,
      position,
      salary,
      phone,
      email: normalizedEmail,
      shift,
    });
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  return {
    staff: newStaff,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mallId: user.mallId,
    },
  };
};

const updateStaff = async ({ id, data, requestingUser }) => {
  const staff = await Staff.findOne({ _id: id, isDeleted: false });
  if (!staff) {
    throw new Error("Staff not found");
  }

  await assertMallAccess(staff.mallId, requestingUser);

  const { mallId, userId, ...safeData } = data;

  const updated = await Staff.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously only scoped for MALL_OWNER (using the now-removed singular
// mallId), leaving every other role — including MALL_MANAGER — completely
// unscoped, returning every staff member across every mall in the system.
const getStaffs = async ({ mallId, userRole, userMallIds }) => {
  let filter = { isDeleted: false };

  if (userRole === "SUPER_ADMIN") {
    if (mallId) filter.mallId = new mongoose.Types.ObjectId(mallId);
  } else if (userRole === "MALL_OWNER") {
    const owned = userMallIds || [];
    if (mallId) {
      if (!owned.map((m) => m.toString()).includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
      filter.mallId = new mongoose.Types.ObjectId(mallId);
    } else {
      filter.mallId = { $in: owned };
    }
  } else {
    if (!mallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(mallId);
  }

  const staffs = await Staff.find(filter);
  return staffs;
};

const getStaff = async (id, requestingUser) => {
  const staff = await Staff.findOne({ _id: id, isDeleted: false });
  if (!staff) {
    throw new Error("Staff not found");
  }

  await assertMallAccess(staff.mallId, requestingUser);

  return staff;
};

const deleteStaff = async (id, requestingUser) => {
  const staff = await Staff.findOne({ _id: id, isDeleted: false });
  if (!staff) {
    throw new Error("Staff not found");
  }

  await assertMallAccess(staff.mallId, requestingUser);

  await Staff.findByIdAndUpdate(id, { isDeleted: true });
  await User.findByIdAndUpdate(staff.userId, {
    isDeleted: true,
    isActive: false,
  });
  return true;
};

async function assertMallAccess(staffMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(staffMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "TENANT") {
    throw new Error("Access denied.");
  }

  if (!mallId || mallId.toString() !== staffMallId.toString()) {
    throw new Error("Access denied. This staff member is outside your assigned mall.");
  }
}

export default {
  addStaff,
  updateStaff,
  getStaff,
  getStaffs,
  deleteStaff,
};

