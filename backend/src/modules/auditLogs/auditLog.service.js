import mongoose from "mongoose";
import AuditLog from "./auditLog.model.js";

// Fire-and-forget logger: audit logging must never break the primary
// request flow, so failures here are caught and logged to the console
// rather than propagated.
const record = async ({ actorId, actorRole, action, entityType, entityId, mallId, metadata }) => {
  try {
    await AuditLog.create({
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      mallId,
      metadata: metadata || {},
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

const getLogs = async ({ mallId, userRole, userMallIds, limit = 50 }) => {
  const filter = {};

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
    throw new Error("Access denied. Only owners and admins may view audit logs.");
  }

  return AuditLog.find(filter)
    .populate("actorId", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 200));
};

export default { record, getLogs };
