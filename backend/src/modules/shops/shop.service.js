import mongoose from "mongoose";
import Shop from "./shop.model.js";
import Mall from "../malls/mall.model.js";

// Previously: `Shop.create(data)` with no validation at all — a shop could
// be created with no mallId, a mallId for a mall the caller doesn't own,
// or a duplicate shopNumber within the same mall (no index existed).
const registerShop = async (data, requestingUser) => {
  const { mallId, shopNumber, monthlyRent } = data;

  if (!mallId) {
    throw new Error("mallId is required: every shop must belong to a mall");
  }
  if (!shopNumber) {
    throw new Error("shopNumber is required");
  }
  if (monthlyRent === undefined || monthlyRent === null) {
    throw new Error("monthlyRent is required");
  }

  const mall = await Mall.findOne({ _id: mallId, isDeleted: false });
  if (!mall) {
    throw new Error("Mall not found");
  }

  // Ownership enforcement: a MALL_OWNER may only create shops in malls
  // they own; MALL_MANAGER/staff are bound to their single assigned mall.
  if (requestingUser?.role === "MALL_OWNER") {
    const owned = (requestingUser.mallIds || []).map((m) => m.toString());
    if (!owned.includes(mallId.toString())) {
      throw new Error("You do not own this mall");
    }
  } else if (requestingUser?.role !== "SUPER_ADMIN") {
    if (
      !requestingUser?.mallId ||
      requestingUser.mallId.toString() !== mallId.toString()
    ) {
      throw new Error("You cannot create a shop outside your assigned mall");
    }
  }

  const existing = await Shop.findOne({
    mallId,
    shopNumber,
    isDeleted: false,
  });
  if (existing) {
    throw new Error(`Shop number ${shopNumber} already exists in this mall`);
  }

  const newShop = await Shop.create({
    mallId,
    shopNumber,
    floor: data.floor,
    size: data.size,
    monthlyRent,
    category: data.category,
    status: data.status || "AVAILABLE",
  });

  return newShop;
};

const updateShop = async ({ id, data, requestingUser }) => {
  const shop = await Shop.findOne({ _id: id, isDeleted: false });
  if (!shop) {
    throw new Error("Shop not found");
  }

  await assertMallAccess(shop.mallId, requestingUser);

  // mallId and tenantId should not be hand-edited through this endpoint —
  // mall reassignment isn't supported, and tenant occupancy is driven by
  // the lease lifecycle, not direct shop edits.
  const { mallId, tenantId, ...safeData } = data;

  const updated = await Shop.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously filtered on `isDeleted: false` (field didn't exist, so this
// silently matched everything) and only scoped by mallId for MALL_OWNER /
// MALL_MANAGER — MALL_OWNER could not actually scope correctly because
// `mallId` came from req.user.mallId, which doesn't exist for owners
// (owners use mallIds). TENANT and ACCOUNTANT got zero scoping too.
const getShops = async ({ mallId, userRole, userMallIds }) => {
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
    // MALL_MANAGER, ACCOUNTANT, TENANT - single assigned mall only
    if (!mallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(mallId);
  }

  const shops = await Shop.find(filter)
    .populate("tenantId", "businessName")
    .populate("mallId", "name");
  return shops;
};

const getShop = async (id, requestingUser) => {
  const shop = await Shop.findOne({ _id: id, isDeleted: false })
    .populate("tenantId", "businessName")
    .populate("mallId", "name");
  if (!shop) {
    throw new Error("Shop not found");
  }

  await assertMallAccess(shop.mallId, requestingUser);

  return shop;
};

const deleteShop = async (id, requestingUser) => {
  const shop = await Shop.findOne({ _id: id, isDeleted: false });
  if (!shop) {
    throw new Error("Shop not found");
  }

  await assertMallAccess(shop.mallId, requestingUser);

  await Shop.findByIdAndUpdate(id, { isDeleted: true });
  return true;
};

// Shared ownership/scope check used by update/get/delete.
async function assertMallAccess(shopMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(shopMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (!mallId || mallId.toString() !== shopMallId.toString()) {
    throw new Error("Access denied. This shop is outside your assigned mall.");
  }
}

export default { registerShop, updateShop, getShop, getShops, deleteShop };

