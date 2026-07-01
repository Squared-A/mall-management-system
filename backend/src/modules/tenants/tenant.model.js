import mongoose from "mongoose";

const tenantSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one User account per Tenant profile
    },
    businessName: {
      type: String,
      required: true,
    },
    tradeLicense: {
      type: String,
    },
    tinNumber: {
      type: Number,
    },
    emergencyContact: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false, // tenant.service.js filters on this; field didn't exist before
    },
  },
  {
    timestamps: true,
  },
);

const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant;
