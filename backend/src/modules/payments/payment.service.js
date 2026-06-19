import mongoose from "mongoose";
import Payment from "./payment.model.js";
import Lease from "../leases/lease.model.js";
import auditLogService from "../auditLogs/auditLog.service.js";

// Previously: `Payment.create(data)` with zero validation — no check that
// the lease/tenant/shop/mall referenced actually existed or related to
// each other, and mallId/shopId weren't even being captured since they
// didn't exist on the schema.
const addPayment = async (data, requestingUser) => {
  const { leaseId, amount, paymentMethod, paymentDate, invoiceNumber } = data;

  if (!leaseId || !amount || !paymentMethod || !paymentDate) {
    throw new Error(
      "leaseId, amount, paymentMethod, and paymentDate are required"
    );
  }
  if (amount <= 0) {
    throw new Error("amount must be greater than 0");
  }

  const lease = await Lease.findOne({ _id: leaseId, isDeleted: false });
  if (!lease) {
    throw new Error("Lease not found");
  }

  await assertPaymentAccess(lease.mallId, requestingUser, "create");

  const newPayment = await Payment.create({
    mallId: lease.mallId,
    shopId: lease.shopId,
    leaseId: lease._id,
    tenantId: lease.tenantId,
    amount,
    paymentMethod,
    paymentDate,
    invoiceNumber,
    status: data.status || "pending",
    recordedBy: requestingUser?.id,
  });

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: newPayment._id,
    mallId: lease.mallId,
    metadata: { amount, leaseId, paymentMethod },
  });

  return newPayment;
};

const updatePayment = async ({ id, data, requestingUser }) => {
  const payment = await Payment.findOne({ _id: id, isDeleted: false });
  if (!payment) throw new Error("Payment not found");

  await assertPaymentAccess(payment.mallId, requestingUser, "update");

  // Re-linking a payment to a different lease/tenant/shop/mall isn't a
  // valid "edit" — those fields are immutable after creation.
  const { mallId, shopId, leaseId, tenantId, ...safeData } = data;

  const updated = await Payment.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });
  return updated;
};

// Previously crashed on every call: `p.lease?.mallId === mallId` referenced
// a bare `mallId` identifier that was never defined anywhere in this
// function's scope (not a parameter, not destructured, not imported) —
// a guaranteed ReferenceError. It also called `.populate("Lease")`, which
// doesn't match the schema's actual field name `leaseId`, so populate
// would have silently no-opped even before reaching the crash.
const getPayments = async ({ mallId, userRole, userMallId, userMallIds, userTenantId }) => {
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
    if (!userTenantId) return [];
    filter.tenantId = userTenantId;
  } else {
    // MALL_MANAGER, ACCOUNTANT
    if (!userMallId) return [];
    filter.mallId = new mongoose.Types.ObjectId(userMallId);
  }

  const payments = await Payment.find(filter)
    .populate("leaseId", "startDate endDate status")
    .populate("tenantId", "businessName")
    .populate("shopId", "shopNumber")
    .sort({ paymentDate: -1 });

  return payments;
};

const getPayment = async (id, requestingUser) => {
  const payment = await Payment.findOne({ _id: id, isDeleted: false })
    .populate("leaseId", "startDate endDate status")
    .populate("tenantId", "businessName userId")
    .populate("shopId", "shopNumber");
  if (!payment) throw new Error("Payment not found");

  if (requestingUser?.role === "TENANT") {
    if (
      !payment.tenantId ||
      payment.tenantId._id.toString() !== requestingUser.tenantId?.toString()
    ) {
      throw new Error("Access denied.");
    }
    return payment;
  }

  await assertPaymentAccess(payment.mallId, requestingUser, "view");
  return payment;
};

const deletePayment = async (id, requestingUser) => {
  const payment = await Payment.findOne({ _id: id, isDeleted: false });
  if (!payment) throw new Error("Payment not found");

  await assertPaymentAccess(payment.mallId, requestingUser, "delete");

  await Payment.findByIdAndUpdate(id, { isDeleted: true });

  await auditLogService.record({
    actorId: requestingUser?.id,
    actorRole: requestingUser?.role || "SYSTEM",
    action: "PAYMENT_DELETED",
    entityType: "Payment",
    entityId: payment._id,
    mallId: payment.mallId,
    metadata: { amount: payment.amount },
  });

  return true;
};

// Who can create/update/delete payments and when:
//   - SUPER_ADMIN: anywhere
//   - MALL_OWNER: only malls they own
//   - MALL_MANAGER, ACCOUNTANT: only their assigned mall (the roles
//     expected to actually be recording rent payments day-to-day)
//   - TENANT: never (tenants can VIEW their own payments via getPayments/
//     getPayment, but cannot create, edit, or delete payment records)
// This authorization layer did not exist at all previously — any
// authenticated user (including a TENANT) could create or delete any
// payment in the system.
async function assertPaymentAccess(paymentMallId, requestingUser, action) {
  if (!requestingUser) return;
  const { role, mallId, mallIds } = requestingUser;

  if (role === "SUPER_ADMIN") return;

  if (role === "MALL_OWNER") {
    const owned = (mallIds || []).map((m) => m.toString());
    if (!owned.includes(paymentMallId.toString())) {
      throw new Error("Access denied. You do not own this mall.");
    }
    return;
  }

  if (role === "MALL_MANAGER" || role === "ACCOUNTANT") {
    if (!mallId || mallId.toString() !== paymentMallId.toString()) {
      throw new Error(
        "Access denied. This payment is outside your assigned mall."
      );
    }
    return;
  }

  throw new Error(`Access denied. You are not authorized to ${action} payments.`);
}

export default {
  addPayment,
  updatePayment,
  getPayment,
  getPayments,
  deletePayment,
};
