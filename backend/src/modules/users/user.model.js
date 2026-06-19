import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "MALL_OWNER",
        "MALL_MANAGER",
        "ACCOUNTANT",
        "TENANT",
      ],
      required: true,
      // NOTE: previously defaulted to "MALL_OWNER", which silently granted
      // owner privileges to any user created without an explicit role.
      // Role must now be supplied explicitly by the service layer.
    },

    // MALL_OWNER can own multiple malls -> array.
    // MALL_MANAGER / ACCOUNTANT / TENANT / staff are scoped to exactly one
    // mall -> single ObjectId. SUPER_ADMIN uses neither (sees everything).
    mallIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mall",
      },
    ],
    mallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mall",
      default: null,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const User = mongoose.model("User", userSchema);
export default User;
