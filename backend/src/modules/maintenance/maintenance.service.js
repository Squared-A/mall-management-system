import mongoose from "mongoose";
import Maintenance from "./maintenance.model.js";
import Shop from "../shops/shop.model.js";
import Tenant from "../tenants/tenant.model.js";
import Lease from "../leases/lease.model.js";

// Previously: `Maintenance.create(data)` with no validation, and mallId
// was never being captured at all (the field didn't even exist on the
// schema).
const addMaintenance = async (data, requestingUser) => {
  const { title } = data;

  if (!title) {
    throw new Error("title is required");
  }

  let shopId = data.shopId;
  let tenantId = data.tenantId || null;
  let shop;

  // A TENANT files a ticket for their active leased shop automatically.
  if (requestingUser?.role === "TENANT") {
    if (!requestingUser.tenantId) {
      throw new Error("No tenant profile associated with this account");
    }

    const activeLease = await Lease.findOne({
      tenantId: requestingUser.tenantId,
      status: "ACTIVE",
      isDeleted: false,
    }).populate("shopId");

    if (!activeLease?.shopId) {
      throw new Error("No active leased shop found for this tenant");
    }

    tenantId = requestingUser.tenantId;
    shopId = activeLease.shopId._id;
    shop = activeLease.shopId;
  } else {
    if (!shopId) {
      throw new Error("shopId is required");
    }
    shop = await Shop.findOne({ _id: shopId, isDeleted: false });
    if (!shop) {
      throw new Error("Shop not found");
    }
    await assertMallAccess(shop.mallId, requestingUser);
  }

  const newMaintenance = await Maintenance.create({
    mallId: shop.mallId,
    shopId,
    tenantId,
    title,
    description: data.description,
    priority: data.priority || "LOW",
    status: "OPEN",
    assignedTo: requestingUser?.role === "TENANT" ? undefined : data.assignedTo,
  });
  return newMaintenance;
};

const updateMaintenance = async ({ id, data, requestingUser }) => {
  const maintenance = await Maintenance.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!maintenance) throw new Error("Maintenance ticket not found");

  if (requestingUser?.role === "TENANT") {
    if (
      !maintenance.tenantId ||
      maintenance.tenantId.toString() !== requestingUser.tenantId?.toString()
    ) {
      throw new Error("Access denied.");
    }
    // Tenants may only update the description/title of their own open
    // ticket, not status/assignment/priority (that's staff territory).
    const { title, description } = data;
    const updated = await Maintenance.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );
    return updated;
  }

  await assertMallAccess(maintenance.mallId, requestingUser);

  const { mallId, shopId, tenantId, ...safeData } = data;
  const updated = await Maintenance.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously: ACCOUNTANT and TENANT received zero scoping (every ticket
// in the system); MALL_OWNER's filter relied on a mallId param that the
// controller passed from req.user.mallId — which doesn't exist for
// owners, so an owner's "scoped" request actually returned everything
// unfiltered (the if-condition required mallId to be truthy to apply any
// filter at all).
const getMaintenances = async ({ mallId, userRole, userMallId, userMallIds, userTenantId }) => {
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
  } else if (userRole === "TENANT") {
    if (!userTenantId) return [];
    filter.tenantId = userTenantId;
  } else {
    // MALL_MANAGER, ACCOUNTANT
    if (!userMallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(userMallId);
  }

  const maintenances = await Maintenance.find(filter)
    .populate("shopId", "shopNumber")
    .populate("tenantId", "businessName")
    .sort({ createdAt: -1 });
  return maintenances;
};

const getMaintenance = async (id, requestingUser) => {
  const maintenance = await Maintenance.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate("shopId", "shopNumber")
    .populate("tenantId", "businessName");
  if (!maintenance) throw new Error("Maintenance ticket not found");

  if (requestingUser?.role === "TENANT") {
    if (
      !maintenance.tenantId ||
      maintenance.tenantId._id.toString() !== requestingUser.tenantId?.toString()
    ) {
      throw new Error("Access denied.");
    }
    return maintenance;
  }

  await assertMallAccess(maintenance.mallId, requestingUser);
  return maintenance;
};

const deleteMaintenance = async (id, requestingUser) => {
  const maintenance = await Maintenance.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!maintenance) throw new Error("Maintenance ticket not found");

  await assertMallAccess(maintenance.mallId, requestingUser);

  await Maintenance.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

async function assertMallAccess(maintenanceMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(maintenanceMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "TENANT") {
    throw new Error("Access denied.");
  }

  if (!mallId || mallId.toString() !== maintenanceMallId.toString()) {
    throw new Error(
      "Access denied. This ticket is outside your assigned mall."
    );
  }
}

export default {
  addMaintenance,
  updateMaintenance,
  getMaintenance,
  getMaintenances,
  deleteMaintenance,
};


