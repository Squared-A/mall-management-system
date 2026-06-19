import mongoose from "mongoose";

// New module: nothing in the original codebase recorded who did what,
// when, to which mall — there was no way to answer "who deleted this
// tenant" or "who approved this mall" after the fact. This is a minimal,
// append-only audit trail for sensitive actions (create/update/delete on
// tenants, staff, leases, payments, shops, malls; role/permission changes).
const auditLogSchema = mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      // e.g. "TENANT_CREATED", "LEASE_TERMINATED", "PAYMENT_DELETED"
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Audit logs are read-heavy by mall and time; index accordingly.
auditLogSchema.index({ mallId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
