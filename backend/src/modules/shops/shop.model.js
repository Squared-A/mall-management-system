import mongoose from "mongoose";

const shopSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      required: true, // every shop MUST belong to a mall
    },
    // The active tenant occupying this shop, if any. Populated by the
    // lease service when a lease is activated, cleared when it ends.
    // Several existing queries (shop.service.js getShops, reports.service.js
    // occupancyReport) already populate("tenantId") on Shop, but this field
    // never existed on the schema, so those populates silently no-opped.
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
    shopNumber: {
      type: Number,
      required: true,
    },
    floor: {
      type: Number,
    },
    size: {
      type: Number,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"],
      default: "AVAILABLE",
    },
    isDeleted: {
      type: Boolean,
      default: false, // shop.service.js filters on this; field didn't exist before
    },
  },
  {
    timestamps: true,
  },
);

// A shop number must be unique within a mall (not globally), so two
// different malls can both have a "Shop 101".
shopSchema.index({ mallId: 1, shopNumber: 1 }, { unique: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
