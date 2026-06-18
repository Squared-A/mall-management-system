import mongoose from "mongoose";

const announcementSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    targetRole: {
      type: String,
      enum: ["all", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
