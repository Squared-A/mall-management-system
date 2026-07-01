import mongoose from "mongoose";

const maintenanceSchema = mongoose.Schema(
  {
    // mallId did not exist on this schema at all, yet
    // maintenance.service.js's getMaintenances() filtered on
    // `filter.mallId = ...` — that filter could never match anything,
    // so mall-scoping silently did nothing and every request returned
    // every maintenance ticket across every mall.
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "LOW",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "COMPLETED"],
      default: "OPEN",
    },
    assignedTo: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    // was misspelled "timstamps" — Mongoose silently ignores unknown
    // schema options, so createdAt/updatedAt were never actually being
    // generated on any Maintenance document.
    timestamps: true,
  },
);

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
export default Maintenance;
