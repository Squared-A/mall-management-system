import mongoose from "mongoose";

const staffSchema = mongoose.Schema(
  {
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
    },
    fullName: {
      type: String,
    },
    position: {
      type: String,
    },
    salary: {
      type: Number,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    shift: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
