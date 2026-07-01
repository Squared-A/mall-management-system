import mongoose from "mongoose";

const leaseSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      // RENEWED added: when a lease is renewed, the original is marked
      // RENEWED (closed) and a new ACTIVE lease record is created pointing
      // back at it via renewedFromLeaseId. Previously there was no way to
      // represent a renewal at all, only ACTIVE / EXPIRED / TERMINATED.
      enum: ["ACTIVE", "EXPIRED", "TERMINATED", "RENEWED"],
      default: "ACTIVE",
    },
    renewedFromLeaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Lease = mongoose.model("Lease", leaseSchema);
export default Lease;
