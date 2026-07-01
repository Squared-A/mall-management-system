import mongoose from "mongoose";
import Mall from "../modules/malls/mall.model.js";
import Tenant from "../modules/tenants/tenant.model.js";

const APPROVED = "APPROVED";

const getRequestedMallId = (req) => {
  const explicitMallId = req.query?.mallId || req.body?.mallId || req.user?.mallId;
  if (explicitMallId) return explicitMallId.toString();

  if (req.baseUrl === "/api/malls") {
    const firstPathSegment = req.path.split("/").filter(Boolean)[0];
    if (firstPathSegment && mongoose.Types.ObjectId.isValid(firstPathSegment)) {
      return firstPathSegment;
    }
  }

  return null;
};

const denyPendingMall = (res) =>
  res.status(403).json({
    success: false,
    message:
      "Mall pending approval. Platform approval is required before accessing mall management features.",
  });

const requireApprovedMall = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user?.role) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authenticated user found.",
      });
    }

    if (user.role === "SUPER_ADMIN") {
      return next();
    }

    if (user.role === "MALL_OWNER") {
      const ownedIds = (user.mallIds || []).map((id) => id.toString());
      if (ownedIds.length === 0) {
        return denyPendingMall(res);
      }

      const ownedMalls = await Mall.find({
        _id: { $in: ownedIds },
        isDeleted: false,
      }).select("_id status");

      const approvedIds = ownedMalls
        .filter((mall) => mall.status === APPROVED)
        .map((mall) => mall._id.toString());
      const requestedMallId = getRequestedMallId(req);

      if (requestedMallId) {
        if (!ownedIds.includes(requestedMallId)) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You do not own this mall.",
          });
        }

        const requestedMall = ownedMalls.find(
          (mall) => mall._id.toString() === requestedMallId,
        );
        if (!requestedMall || requestedMall.status !== APPROVED) {
          return denyPendingMall(res);
        }

        req.user.mallId = requestedMallId;
      } else if (approvedIds.length === 0) {
        return denyPendingMall(res);
      }

      req.user.mallIds = approvedIds;
      return next();
    }

    let mallId = user.mallId;
    if (!mallId && user.role === "TENANT" && user.tenantId) {
      const tenant = await Tenant.findOne({
        _id: user.tenantId,
        isDeleted: false,
      }).select("mallId");
      mallId = tenant?.mallId;
      if (mallId) req.user.mallId = mallId.toString();
    }

    if (!mallId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No mall assigned to this account.",
      });
    }

    const mall = await Mall.findOne({ _id: mallId, isDeleted: false }).select(
      "status",
    );
    if (!mall || mall.status !== APPROVED) {
      return denyPendingMall(res);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export { requireApprovedMall };
