import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Tenant from "./tenant.model.js";
import User from "../users/user.model.js";
import Mall from "../malls/mall.model.js";
import auditLogService from "../auditLogs/auditLog.service.js";

// Previously: `Tenant.create(data)` — no User account was ever created, so
// a registered tenant had no way to log in. This now creates the User and
// Tenant together, with rollback if either step fails partway, and
// verifies the requester actually has access to the target mall.
const registerTenant = async (data, requestingUser) => {
  const {
    email,
    password,
    fullName,
    phone,
    businessName,
    tradeLicense,
    tinNumber,
    emergencyContact,
    mallId,
  } = data;

  if (!email || !password || !fullName || !businessName) {
    throw new Error(
      "email, password, fullName, and businessName are required"
    );
  }
  if (!mallId) {
    throw new Error("mallId is required: every tenant must belong to a mall");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const mall = await Mall.findOne({ _id: mallId, isDeleted: false });
  if (!mall) {
    throw new Error("Mall not found");
  }

  // Authorization: who is allowed to register a tenant into this mall?
  if (requestingUser) {
    if (requestingUser.role === "MALL_OWNER") {
      const owned = (requestingUser.mallIds || []).map((m) => m.toString());
      if (!owned.includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
    } else if (
      requestingUser.role === "MALL_MANAGER" ||
      requestingUser.role === "ACCOUNTANT"
    ) {
      if (
        !requestingUser.mallId ||
        requestingUser.mallId.toString() !== mallId.toString()
      ) {
        throw new Error("You cannot register a tenant outside your assigned mall");
      }
    } else if (requestingUser.role !== "SUPER_ADMIN") {
      throw new Error("You are not authorized to register tenants");
    }
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
    phone: phone || "",
    role: "TENANT",
    mallId,
    isActive: true,
  });

  let newTenant;
  try {
    newTenant = await Tenant.create({
      userId: user._id,
      mallId,
      businessName,
      tradeLicense,
      tinNumber,
      emergencyContact,
    });
  } catch (err) {
    // Roll back the orphaned User so a failed tenant profile never leaves
    // behind a login-only account with no tenant record.
    await User.findByIdAndDelete(user._id);
    throw err;
  }

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "TENANT_CREATED",
    entityType: "Tenant",
    entityId: newTenant._id,
    mallId,
    metadata: { businessName, email: normalizedEmail },
  });

  return {
    tenant: newTenant,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mallId: user.mallId,
    },
  };
};

const updateTenant = async ({ id, data, requestingUser }) => {
  const tenant = await Tenant.findOne({ _id: id, isDeleted: false });
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await assertMallAccess(tenant.mallId, requestingUser);

  // mallId/userId reassignment must go through dedicated flows, not a
  // generic field-merge update.
  const { mallId, userId, ...safeData } = data;

  const updated = await Tenant.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously scoped only for MALL_OWNER/MALL_MANAGER using req.user.mallId
// — which doesn't exist for MALL_OWNER (owners use mallIds), so an owner's
// "scoped" query silently matched nothing... or, if mallId happened to be
// undefined, the filter.mallId branch was skipped entirely and ALL tenants
// across ALL malls were returned.
const getTenants = async ({ mallId, userRole, userMallIds }) => {
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

  const tenants = await Tenant.find(filter).populate(
    "userId",
    "fullName email phone isActive"
  );
  return tenants;
};

const getTenant = async (id, requestingUser) => {
  const tenant = await Tenant.findOne({ _id: id, isDeleted: false }).populate(
    "userId",
    "fullName email phone isActive"
  );
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await assertMallAccess(tenant.mallId, requestingUser);

  return tenant;
};

const deleteTenant = async (id, requestingUser) => {
  const tenant = await Tenant.findOne({ _id: id, isDeleted: false });
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await assertMallAccess(tenant.mallId, requestingUser);

  await Tenant.findByIdAndUpdate(id, { isDeleted: true });
  // Soft-delete the linked login too, so a removed tenant can no longer
  // authenticate, mirroring the soft-delete of their profile.
  await User.findByIdAndUpdate(tenant.userId, {
    isDeleted: true,
    isActive: false,
  });

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "TENANT_DELETED",
    entityType: "Tenant",
    entityId: tenant._id,
    mallId: tenant.mallId,
  });

  return true;
};

async function assertMallAccess(tenantMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(tenantMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "TENANT") {
    throw new Error("Access denied.");
  }

  if (!mallId || mallId.toString() !== tenantMallId.toString()) {
    throw new Error("Access denied. This tenant is outside your assigned mall.");
  }
}

export default {
  registerTenant,
  updateTenant,
  getTenant,
  getTenants,
  deleteTenant,
};
