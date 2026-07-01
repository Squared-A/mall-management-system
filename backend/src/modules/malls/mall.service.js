import Mall from "./mall.model.js";
import User from "../users/user.model.js";
import auditLogService from "../auditLogs/auditLog.service.js";

// This now serves "an existing MALL_OWNER adds another mall to their
// account" (first-mall registration happens via authService.registerMallOwner).
// Previously this did `User.findByIdAndUpdate(userId, { mallId: newMall._id })`,
// which (a) used the old singular field and (b) overwrote rather than
// added to the owner's malls, so registering a second mall silently
// detached the owner from their first one.
const registerMall = async (data, requestingUser) => {
  const ownerId = requestingUser?.id || data.ownerId;

  if (!ownerId) {
    throw new Error("ownerId is required to register a mall");
  }

  const owner = await User.findById(ownerId);
  if (!owner || owner.isDeleted) {
    throw new Error("Owner account not found");
  }
  if (owner.role !== "MALL_OWNER" && owner.role !== "SUPER_ADMIN") {
    throw new Error("Only mall owners can register malls");
  }

  const newMall = await Mall.create({
    ownerId: owner._id,
    name: data.name,
    address: data.address,
    city: data.city,
    floors: data.floors,
    totalShops: data.totalShops,
    description: data.description,
    logo: data.logo,
    status: "PENDING",
  });

  await User.findByIdAndUpdate(owner._id, {
    $addToSet: { mallIds: newMall._id },
  });

  return newMall;
};

const updateMall = async ({ id, data, userRole, userMallIds, requestingUser }) => {
  let updateData = { ...data };

  if (userRole === "SUPER_ADMIN") {
    if (!Object.prototype.hasOwnProperty.call(updateData, "status")) {
      throw new Error("Super admins can only update mall approval status");
    }
    updateData = { status: updateData.status };
  } else {
    delete updateData.status;
    delete updateData.ownerId;
  }

  // MALL_OWNER can only update a mall they actually own.
  if (userRole === "MALL_OWNER") {
    const owned = (userMallIds || []).map((m) => m.toString());
    if (!owned.includes(id)) {
      throw new Error("Unauthorized: You can only update your own malls");
    }
  }

  const updated = await Mall.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new Error("Mall not found");
  }

  if (updateData.status && userRole === "SUPER_ADMIN") {
    await auditLogService.record({
      actorId: requestingUser?.id,
      actorRole: userRole,
      action: "MALL_STATUS_CHANGED",
      entityType: "Mall",
      entityId: updated._id,
      mallId: updated._id,
      metadata: { newStatus: updateData.status },
    });
  }

  return updated;
};

// Previously returned ALL malls in the system to every authenticated role
// (mall owners could browse competitors' malls; tenants/staff could too).
// Now properly scoped: SUPER_ADMIN sees everything, MALL_OWNER sees only
// malls they own, everyone else sees only their single assigned mall.
const getMalls = async ({ userRole, userMallId, userMallIds }) => {
  const filter = { isDeleted: false };

  if (userRole === "SUPER_ADMIN") {
    // no additional filter — platform-wide view
  } else if (userRole === "MALL_OWNER") {
    filter._id = { $in: userMallIds || [] };
  } else if (userMallId) {
    filter._id = userMallId;
  } else {
    // No mall context at all — return nothing rather than leaking data.
    return [];
  }

  const malls = await Mall.find(filter).populate("ownerId", "fullName email");
  return malls;
};

// Previously fetched any mall by id with no ownership/membership check
// whatsoever — any authenticated user could read any mall's full record.
const getMall = async (id, { userRole, userMallId, userMallIds } = {}) => {
  const mall = await Mall.findOne({ _id: id, isDeleted: false }).populate(
    "ownerId",
    "fullName email"
  );

  if (!mall) {
    throw new Error("Mall not found");
  }

  if (userRole === "SUPER_ADMIN") {
    return mall;
  }

  if (userRole === "MALL_OWNER") {
    const owned = (userMallIds || []).map((m) => m.toString());
    if (!owned.includes(id)) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return mall;
  }

  if (!userMallId || userMallId.toString() !== id) {
    throw new Error("Access denied. This mall is not your assigned mall.");
  }

  return mall;
};

const deleteMall = async (id, { userRole, userMallIds } = {}) => {
  if (userRole === "MALL_OWNER") {
    const owned = (userMallIds || []).map((m) => m.toString());
    if (!owned.includes(id)) {
      throw new Error("Unauthorized: You can only delete your own malls");
    }
  }

  const mall = await Mall.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!mall) {
    throw new Error("Mall not found");
  }

  return true;
};

export default { registerMall, updateMall, getMall, getMalls, deleteMall };

