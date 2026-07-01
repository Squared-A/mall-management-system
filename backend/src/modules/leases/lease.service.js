import mongoose from "mongoose";
import Lease from "./lease.model.js";
import Shop from "../shops/shop.model.js";
import Tenant from "../tenants/tenant.model.js";
import auditLogService from "../auditLogs/auditLog.service.js";

// Previously: `Lease.create(data)` with zero validation. Nothing checked
// that the tenant, shop, and mall actually belonged together (a lease
// could link a tenant from Mall A to a shop in Mall B), nothing checked
// the shop was actually available, dates weren't validated, and the
// shop's status/tenantId were never updated when a lease was created.
const addLease = async (data, requestingUser) => {
  const { mallId, tenantId, shopId, startDate, endDate, monthlyRent, deposit } =
    data;

  if (!mallId || !tenantId || !shopId || !startDate || !endDate) {
    throw new Error(
      "mallId, tenantId, shopId, startDate, and endDate are required"
    );
  }
  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("endDate must be after startDate");
  }
  if (monthlyRent === undefined || deposit === undefined) {
    throw new Error("monthlyRent and deposit are required");
  }

  await assertMallManageAccess(mallId, requestingUser);

  const [tenant, shop] = await Promise.all([
    Tenant.findOne({ _id: tenantId, isDeleted: false }),
    Shop.findOne({ _id: shopId, isDeleted: false }),
  ]);

  if (!tenant) throw new Error("Tenant not found");
  if (!shop) throw new Error("Shop not found");

  // Cross-entity integrity: tenant, shop, and lease must all be in the
  // SAME mall. This check did not exist before.
  if (tenant.mallId.toString() !== mallId.toString()) {
    throw new Error("Tenant does not belong to the specified mall");
  }
  if (shop.mallId.toString() !== mallId.toString()) {
    throw new Error("Shop does not belong to the specified mall");
  }

  if (shop.status === "OCCUPIED") {
    throw new Error("This shop is already occupied by an active lease");
  }
  if (shop.status === "MAINTENANCE") {
    throw new Error("This shop is under maintenance and cannot be leased");
  }

  // Prevent overlapping active leases on the same shop.
  const conflicting = await Lease.findOne({
    shopId,
    isDeleted: false,
    status: "ACTIVE",
  });
  if (conflicting) {
    throw new Error("This shop already has an active lease");
  }

  const newLease = await Lease.create({
    mallId,
    tenantId,
    shopId,
    startDate,
    endDate,
    monthlyRent,
    deposit,
    status: "ACTIVE",
  });

  // Sync shop occupancy — this never happened before, so shops would stay
  // "AVAILABLE" forever even after being leased out.
  await Shop.findByIdAndUpdate(shopId, {
    status: "OCCUPIED",
    tenantId,
  });

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "LEASE_CREATED",
    entityType: "Lease",
    entityId: newLease._id,
    mallId,
    metadata: { shopId, tenantId, monthlyRent },
  });

  return newLease;
};

const updateLease = async ({ id, data, requestingUser }) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false });
  if (!lease) throw new Error("Lease not found");

  await assertMallManageAccess(lease.mallId, requestingUser);

  // Status transitions go through dedicated endpoints (terminate/renew/
  // expire) so the shop-sync side effects always happen consistently.
  // mallId/tenantId/shopId are immutable after creation — relinking a
  // lease to a different shop/tenant is a new lease, not an edit.
  const { status, mallId, tenantId, shopId, ...safeData } = data;

  const updated = await Lease.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Explicit lifecycle transition: ACTIVE -> TERMINATED. Frees up the shop.
const terminateLease = async (id, requestingUser) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false });
  if (!lease) throw new Error("Lease not found");

  await assertMallManageAccess(lease.mallId, requestingUser);

  if (lease.status !== "ACTIVE") {
    throw new Error(`Cannot terminate a lease with status ${lease.status}`);
  }

  lease.status = "TERMINATED";
  await lease.save();

  await Shop.findByIdAndUpdate(lease.shopId, {
    status: "AVAILABLE",
    tenantId: null,
  });

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "LEASE_TERMINATED",
    entityType: "Lease",
    entityId: lease._id,
    mallId: lease.mallId,
  });

  return lease;
};

// Explicit lifecycle transition: ACTIVE -> EXPIRED (manual or via a
// scheduled job once endDate has passed). Frees up the shop.
const expireLease = async (id, requestingUser) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false });
  if (!lease) throw new Error("Lease not found");

  await assertMallManageAccess(lease.mallId, requestingUser);

  if (lease.status !== "ACTIVE") {
    throw new Error(`Cannot expire a lease with status ${lease.status}`);
  }

  lease.status = "EXPIRED";
  await lease.save();

  await Shop.findByIdAndUpdate(lease.shopId, {
    status: "AVAILABLE",
    tenantId: null,
  });

  return lease;
};

// Explicit lifecycle transition: closes the current lease as RENEWED and
// opens a new ACTIVE lease on the same shop/tenant with new dates/terms.
// This functionality did not exist at all previously.
const renewLease = async (id, renewalData, requestingUser) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false });
  if (!lease) throw new Error("Lease not found");

  await assertMallManageAccess(lease.mallId, requestingUser);

  if (lease.status !== "ACTIVE" && lease.status !== "EXPIRED") {
    throw new Error(`Cannot renew a lease with status ${lease.status}`);
  }

  const { startDate, endDate, monthlyRent, deposit } = renewalData;
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required to renew a lease");
  }
  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("endDate must be after startDate");
  }

  lease.status = "RENEWED";
  await lease.save();

  const newLease = await Lease.create({
    mallId: lease.mallId,
    tenantId: lease.tenantId,
    shopId: lease.shopId,
    startDate,
    endDate,
    monthlyRent: monthlyRent ?? lease.monthlyRent,
    deposit: deposit ?? lease.deposit,
    status: "ACTIVE",
    renewedFromLeaseId: lease._id,
  });

  await Shop.findByIdAndUpdate(lease.shopId, {
    status: "OCCUPIED",
    tenantId: lease.tenantId,
  });

  return newLease;
};

// Previously: ACCOUNTANT and TENANT got zero scoping (saw every lease in
// the system); MALL_OWNER's filter relied on a single mallId that no
// longer exists on the owner's token.
const getLeases = async ({ mallId, userRole, userMallId, userMallIds, userTenantId }) => {
  let filter = { isDeleted: false };

  if (userRole === "SUPER_ADMIN") {
    if (mallId) filter.mallId = new mongoose.Types.ObjectId(mallId);
  } else if (userRole === "MALL_OWNER") {
    const owned = userMallIds || [];
    if (mallId) {
      if (!owned.map((m) => m.toString()).includes(mallId.toString())) {
        throw new Error("You do not own this mall");
      }
      filter.mallId = new mongoose.Types.ObjectId(mallId);
    } else {
      filter.mallId = { $in: owned };
    }
  } else if (userRole === "TENANT") {
    // A tenant may only ever see their own leases.
    if (!userTenantId) return [];
    filter.tenantId = userTenantId;
  } else {
    // MALL_MANAGER, ACCOUNTANT
    if (!userMallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(userMallId);
  }

  const leases = await Lease.find(filter)
    .populate("tenantId", "businessName")
    .populate("shopId", "shopNumber floor")
    .populate("mallId", "name");
  return leases;
};

const getLease = async (id, requestingUser) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false })
    .populate("tenantId", "businessName userId")
    .populate("shopId", "shopNumber floor")
    .populate("mallId", "name");
  if (!lease) throw new Error("Lease not found");

  if (requestingUser?.role === "TENANT") {
    if (
      !lease.tenantId ||
      lease.tenantId._id.toString() !== requestingUser.tenantId?.toString()
    ) {
      throw new Error("Access denied.");
    }
    return lease;
  }

  await assertMallManageAccess(lease.mallId._id || lease.mallId, requestingUser);
  return lease;
};

const deleteLease = async (id, requestingUser) => {
  const lease = await Lease.findOne({ _id: id, isDeleted: false });
  if (!lease) throw new Error("Lease not found");

  await assertMallManageAccess(lease.mallId, requestingUser);

  await Lease.findByIdAndUpdate(id, { isDeleted: true });

  // If this lease was the active one, free up the shop too.
  if (lease.status === "ACTIVE") {
    await Shop.findByIdAndUpdate(lease.shopId, {
      status: "AVAILABLE",
      tenantId: null,
    });
  }

  return true;
};

async function assertMallManageAccess(leaseMallId, requestingUser) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(leaseMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "MALL_MANAGER") {
    if (!mallId || mallId.toString() !== leaseMallId.toString()) {
      throw new Error("Access denied. This lease is outside your assigned mall.");
    }
    return;
  }

  throw new Error("Access denied. You are not authorized to manage leases.");
}

export default {
  addLease,
  updateLease,
  terminateLease,
  expireLease,
  renewLease,
  getLease,
  getLeases,
  deleteLease,
};
