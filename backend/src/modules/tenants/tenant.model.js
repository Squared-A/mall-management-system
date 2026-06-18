import mongoose from "mongoose";

const tenantSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    businessName: {
      type: String,
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
  },
  {
    timestamps: true,
  },
);

const Tenant = mongoose.model("Tenant", tenantSchema);
export default Tenant;
