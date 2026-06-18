import mongoose from "mongoose";

const shopSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    shopNumber: {
      type: Number,
    },
    floor: {
      type: Number,
    },
    size: {
      type: Number,
    },
    monthlyRent: {
      type: Number,
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"],
    },
  },
  {
    timestamps: true,
  },
);

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
