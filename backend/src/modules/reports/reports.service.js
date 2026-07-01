import mongoose from "mongoose";
import User from "../users/user.model.js";
import Mall from "../malls/mall.model.js";
import Tenant from "../tenants/tenant.model.js";
import Lease from "../leases/lease.model.js";
import Payment from "../payments/payment.model.js";
import Shop from "../shops/shop.model.js";
import Maintenance from "../maintenance/maintenance.model.js";
import Staff from "../staff/staff.model.js";
import Announcement from "../announcements/announcement.model.js";
import Expense from "../expenses/expense.model.js";

// Shared helper: resolves the correct mall-scoping filter for any role.
// Previously, every report function in this file received `mallId` from
// `req.user.mallId`, which is undefined for MALL_OWNER (owners use
// mallIds[] instead) — so every dashboard/report screen showed all zeros
// for the system's primary persona. This also threw on requests for a
// mall the caller doesn't actually have rights to.
function resolveMallFilter({ requestedMallId, userRole, userMallId, userMallIds }) {
  if (userRole === "SUPER_ADMIN") {
    return requestedMallId
      ? { $in: [new mongoose.Types.ObjectId(requestedMallId)] }
      : null; // null = platform-wide, no filter
  }

  if (userRole === "MALL_OWNER") {
    const owned = (userMallIds || []).map((m) => new mongoose.Types.ObjectId(m));
    if (owned.length === 0) {
      throw new Error("You do not own any malls yet.");
    }
    if (requestedMallId) {
      const match = owned.find((m) => m.toString() === requestedMallId.toString());
      if (!match) throw new Error("You do not own this mall.");
      return { $in: [match] };
    }
    return { $in: owned };
  }

  // MALL_MANAGER, ACCOUNTANT, TENANT - single assigned mall
  if (!userMallId) {
    throw new Error("No mall assigned to this account.");
  }
  return { $in: [new mongoose.Types.ObjectId(userMallId)] };
}

const dashboardStats = async (data) => {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const endOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1,
  );
  const { userId, mallId, userRole, userMallId, userMallIds } = data;

  if (userRole === "SUPER_ADMIN") {
    const totalMalls = await Mall.countDocuments({ isDeleted: false });
    const pendingMalls = await Mall.countDocuments({ isDeleted: false, status: "PENDING" });
    const approvedMalls = await Mall.countDocuments({ isDeleted: false, status: "APPROVED" });
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const totalTenants = await Tenant.countDocuments({ isDeleted: false });
    const totalAnnouncements = await Announcement.countDocuments({
      isDeleted: false,
    });
    const totalRevenueResult = await Payment.aggregate([
      { $match: { isDeleted: false, status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    return {
      totalMalls,
      pendingMalls,
      approvedMalls,
      totalUsers,
      totalTenants,
      totalAnnouncements,
      totalRevenue: totalRevenueResult[0]?.totalRevenue || 0,
    };
  }

  if (userRole === "TENANT") {
    const tenant = await Tenant.findOne({ isDeleted: false, userId });
    const totalLeases = tenant
      ? await Lease.countDocuments({ isDeleted: false, tenantId: tenant._id })
      : 0;
    const activeLeases = tenant
      ? await Lease.countDocuments({ isDeleted: false, tenantId: tenant._id, status: "ACTIVE" })
      : 0;
    const pendingPayments = tenant
      ? await Payment.countDocuments({ isDeleted: false, tenantId: tenant._id, status: "pending" })
      : 0;
    const completedPayments = tenant
      ? await Payment.countDocuments({ isDeleted: false, tenantId: tenant._id, status: "completed" })
      : 0;
    const totalAnnouncements = await Announcement.countDocuments({
      isDeleted: false,
      mallId: tenant?.mallId,
      targetRole: { $in: ["all", "TENANT"] },
    });
    return { totalAnnouncements, totalLeases, activeLeases, pendingPayments, completedPayments };
  }

  // MALL_OWNER, MALL_MANAGER, ACCOUNTANT all need a resolved mall filter.
  const mallFilter = resolveMallFilter({
    requestedMallId: mallId,
    userRole,
    userMallId,
    userMallIds,
  });
  const mallIdsArray = mallFilter.$in;

  const totalShops = await Shop.countDocuments({
    isDeleted: false,
    mallId: mallFilter,
  });
  const occupiedShops = await Shop.countDocuments({
    status: "OCCUPIED",
    mallId: mallFilter,
  });
  const vacantShops = totalShops - occupiedShops;
  const totalTenants = await Tenant.countDocuments({
    isDeleted: false,
    mallId: mallFilter,
  });
  const maintenanceOpen = await Maintenance.countDocuments({
    status: "OPEN",
    mallId: mallFilter,
  });

  // Previously this aggregation had NO mallId match at all — it summed
  // revenue across every mall on the platform regardless of whose
  // dashboard was being rendered, leaking every other mall's revenue into
  // each owner's/manager's numbers.
  const revenue = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        mallId: { $in: mallIdsArray },
        paymentDate: { $gte: startOfMonth, $lt: endOfMonth },
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const totalStaff = await Staff.countDocuments({
    isDeleted: false,
    mallId: mallFilter,
  });

  const totalAnnouncements = await Announcement.countDocuments({
    isDeleted: false,
    mallId: mallFilter,
    ...(userRole === "ACCOUNTANT" ? { targetRole: { $in: ["all", "ACCOUNTANT"] } } : {}),
  });

  const activeLeases = await Lease.countDocuments({
    isDeleted: false,
    status: "ACTIVE",
    mallId: mallFilter,
  });

  const pendingPayments = await Payment.countDocuments({
    isDeleted: false,
    status: "pending",
    mallId: mallFilter,
  });

  if (userRole === "MALL_OWNER" || userRole === "MALL_MANAGER") {
    return {
      totalShops,
      occupiedShops,
      occupancyRate: totalShops > 0 ? (occupiedShops / totalShops) * 100 : 0,
      activeLeases,
      pendingPayments,
      vacantShops,
      totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
      totalTenants,
      maintenanceOpen,
      totalStaff,
      totalAnnouncements,
    };
  }

  // ACCOUNTANT
  return {
    totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
    pendingPayments,
    totalAnnouncements,
  };
};

const platformReport = async (data) => {
  const { userRole } = data;

  if (userRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can access platform reports");
  }

  const totalMalls = await Mall.countDocuments({ isDeleted: false });
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const totalTenants = await Tenant.countDocuments({ isDeleted: false });
  const totalAnnouncements = await Announcement.countDocuments({
    isDeleted: false,
  });

  const platformRevenue = await Payment.aggregate([
    { $match: { isDeleted: false, status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const platformExpenses = await Expense.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
  ]);

  return {
    totalMalls,
    totalUsers,
    totalTenants,
    totalAnnouncements,
    totalRevenue: platformRevenue.length > 0 ? platformRevenue[0].totalRevenue : 0,
    totalExpenses: platformExpenses.length > 0 ? platformExpenses[0].totalExpense : 0,
  };
};

const revenueChart = async (data) => {
  const { mallId, userRole, userMallId, userMallIds } = data;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Previously this aggregation had no mall filter at all — every owner's
  // revenue chart showed every mall's combined revenue/expense, and
  // SUPER_ADMIN-only context leaked into individual mall dashboards.
  const mallFilter =
    userRole === "SUPER_ADMIN" && !mallId
      ? null
      : resolveMallFilter({ requestedMallId: mallId, userRole, userMallId, userMallIds });

  const matchBase = { isDeleted: false, status: "completed" };
  if (mallFilter) matchBase.mallId = mallFilter;

  const revenue = await Payment.aggregate([
    { $match: matchBase },
    { $group: { _id: { $month: "$paymentDate" }, revenue: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);
  const expenses = await Expense.aggregate([
    { $match: mallFilter ? { isDeleted: false, mallId: mallFilter } : { isDeleted: false } },
    { $group: { _id: { $month: "$expenseDate" }, expense: { $sum: "$amount" } } },
    { $sort: { _id: 1 } },
  ]);

  const revenueData = months.map((month, index) => {
    const rev = revenue.find((r) => r._id === index + 1)?.revenue || 0;
    const exp = expenses.find((r) => r._id === index + 1)?.expense || 0;
    return {
      name: month,
      revenue: rev,
      expense: exp,
      profit: rev - exp,
    };
  });

  return { revenueData };
};

const getActivitiesByRole = (userRole) => {
  const rolePermissions = {
    SUPER_ADMIN: {
      users: true, malls: true, tenants: false, leases: false, payments: false,
      expenses: false, announcements: true, staff: false, shops: false, maintenances: false,
    },
    MALL_OWNER: {
      users: false, malls: false, tenants: true, leases: true, payments: true,
      expenses: true, announcements: true, staff: true, shops: true, maintenances: true,
    },
    MALL_MANAGER: {
      users: false, malls: false, tenants: true, leases: true, payments: true,
      expenses: true, announcements: true, staff: true, shops: true, maintenances: true,
    },
    ACCOUNTANT: {
      users: false, malls: false, tenants: false, leases: false, payments: true,
      expenses: true, announcements: true, staff: false, shops: false, maintenances: false,
    },
    TENANT: {
      users: false, malls: false, tenants: false, leases: true, payments: true,
      expenses: false, announcements: true, staff: false, shops: false, maintenances: true,
    },
  };
  return rolePermissions[userRole] || {};
};

const recentActivities = async (data) => {
  const { mallId, userRole, userId, userMallId, userMallIds } = data;
  const permissions = getActivitiesByRole(userRole);

  let mallFilter = {};
  let mallIdsArray = null;
  let tenantId = null;

  if (userRole === "SUPER_ADMIN") {
    if (mallId) {
      mallIdsArray = [new mongoose.Types.ObjectId(mallId)];
      mallFilter = { mallId: { $in: mallIdsArray } };
    }
  } else if (userRole === "TENANT") {
    const tenant = await Tenant.findOne({ isDeleted: false, userId });
    tenantId = tenant?._id || null;
    mallIdsArray = tenant ? [tenant.mallId] : [];
    mallFilter = { mallId: { $in: mallIdsArray } };
  } else {
    const filter = resolveMallFilter({
      requestedMallId: mallId,
      userRole,
      userMallId,
      userMallIds,
    });
    mallIdsArray = filter.$in;
    mallFilter = { mallId: filter };
  }

  const announcementFilter = {
    isDeleted: false,
    ...mallFilter,
    ...(userRole === "ACCOUNTANT" || userRole === "TENANT"
      ? { targetRole: { $in: ["all", userRole] } }
      : {}),
  };

  const activities = [];

  // Previously: permissions.users / permissions.malls were unscoped
  // platform-wide queries available to MALL_OWNER too (now corrected to
  // SUPER_ADMIN-only in getActivitiesByRole above), so this branch is now
  // unreachable for non-admins, but kept for completeness/SUPER_ADMIN.
  if (permissions.users) {
    const recentUsers = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentUsers.map((u) => ({
        id: u._id,
        type: "user",
        action: "New User Registered",
        description: `${u.fullName} with email ${u.email}`,
        time: u.createdAt,
        color: "primary",
      }))
    );
  }

  if (permissions.malls) {
    const recentMalls = await Mall.find({ isDeleted: false })
      .populate("ownerId", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentMalls.map((m) => ({
        id: m._id,
        type: "mall",
        action: "New Mall Registered",
        description: `${m.name} added by ${m.ownerId?.fullName ?? "Unknown"}`,
        time: m.createdAt,
        color: "gray",
      }))
    );
  }

  if (permissions.tenants) {
    const recentTenants = await Tenant.find({ isDeleted: false, ...mallFilter })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentTenants.map((t) => ({
        id: t._id,
        type: "tenant",
        action: "New Tenant Registered",
        description: `${t.businessName ?? "Tenant"} registered by ${t.userId?.fullName ?? "Unknown"}`,
        time: t.createdAt,
        color: "blue",
      }))
    );
  }

  if (permissions.leases) {
    const leaseFilter =
      userRole === "TENANT"
        ? { isDeleted: false, tenantId }
        : { isDeleted: false, ...mallFilter };
    const recentLeases = await Lease.find(leaseFilter)
      .populate({ path: "tenantId", populate: [{ path: "userId", select: "fullName" }] })
      .populate("shopId", "shopNumber")
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentLeases.map((l) => ({
        id: l._id,
        type: "lease",
        action: "New Lease Created",
        description: `Lease created for shop ${l.shopId?.shopNumber ?? "unknown"} and tenant ${l.tenantId?.userId?.fullName ?? "Unknown"}`,
        time: l.createdAt,
        color: "success",
      }))
    );
  }

  if (permissions.payments) {
    const paymentFilter =
      userRole === "TENANT" ? { isDeleted: false, tenantId } : { isDeleted: false, ...mallFilter };
    const recentPayments = await Payment.find(paymentFilter)
      .sort({ createdAt: -1 })
      .populate({ path: "tenantId", populate: [{ path: "userId", select: "fullName" }] })
      .populate("shopId", "shopNumber")
      .limit(5);
    activities.push(
      ...recentPayments.map((p) => ({
        id: p._id,
        type: "payment",
        action: "Payment Received",
        description: `Payment of ${p.amount} received from ${p.tenantId?.userId?.fullName ?? "Unknown"}`,
        time: p.createdAt,
        color: "teal",
      }))
    );
  }

  if (permissions.expenses) {
    const recentExpenses = await Expense.find({ isDeleted: false, ...mallFilter })
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentExpenses.map((e) => ({
        id: e._id,
        type: "expense",
        action: "New Expense Added",
        description: `${e.category} expense of ${e.amount}`,
        time: e.createdAt,
        color: "orange",
      }))
    );
  }

  if (permissions.announcements) {
    const recentAnnouncements = await Announcement.find(announcementFilter)
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentAnnouncements.map((a) => ({
        id: a._id,
        type: "announcement",
        action: "New Announcement Created",
        description: `${a.title} announced by ${a.createdBy?.fullName ?? "Unknown"}`,
        time: a.createdAt,
        color: "purple",
      }))
    );
  }

  if (permissions.staff) {
    const recentStaffs = await Staff.find({ isDeleted: false, ...mallFilter })
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentStaffs.map((s) => ({
        id: s._id,
        type: "staff",
        action: "New Staff Added",
        description: `${s.fullName} hired as ${s.position ?? "staff"}`,
        time: s.createdAt,
        color: "cyan",
      }))
    );
  }

  if (permissions.shops) {
    const recentShops = await Shop.find({ isDeleted: false, ...mallFilter })
      .sort({ createdAt: -1 })
      .limit(5);
    activities.push(
      ...recentShops.map((s) => ({
        id: s._id,
        type: "shop",
        action: "New Shop Added",
        description: `Shop ${s.shopNumber} added to mall`,
        time: s.createdAt,
        color: "brown",
      }))
    );
  }

  if (permissions.maintenances) {
    const maintenanceFilter =
      userRole === "TENANT" ? { isDeleted: false, tenantId } : { isDeleted: false, ...mallFilter };
    const recentMaintenances = await Maintenance.find(maintenanceFilter)
      .sort({ createdAt: -1 })
      .populate({ path: "tenantId", populate: [{ path: "userId", select: "fullName" }] })
      .populate("shopId", "shopNumber")
      .limit(5);
    activities.push(
      ...recentMaintenances.map((m) => ({
        id: m._id,
        type: "maintenance",
        action: "New Maintenance Request",
        description: `${m.title} for shop ${m.shopId?.shopNumber ?? "unknown"}`,
        time: m.createdAt,
        color: "red",
      }))
    );
  }

  return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
};

const occupancyReport = async (data) => {
  const { mallId, userRole, userMallId, userMallIds } = data;
  const mallFilter = resolveMallFilter({
    requestedMallId: mallId,
    userRole,
    userMallId,
    userMallIds,
  });

  const totalShops = await Shop.countDocuments({
    isDeleted: false,
    mallId: mallFilter,
  });
  const occupiedShops = await Shop.countDocuments({
    status: "OCCUPIED",
    mallId: mallFilter,
  });
  const vacantShops = totalShops - occupiedShops;
  const shops = await Shop.find({
    isDeleted: false,
    mallId: mallFilter,
  }).populate("tenantId", "businessName");

  return {
    totalShops,
    occupiedShops,
    vacantShops,
    occupancyRate: totalShops > 0 ? (occupiedShops / totalShops) * 100 : 0,
    shopDetails: shops.map((shop) => ({
      id: shop._id,
      shopNumber: shop.shopNumber,
      status: shop.status,
      tenant: shop.tenantId?.businessName || "Vacant",
      // Was `shop.rentAmount`, a field that never existed on the Shop
      // schema (the real field is `monthlyRent`) — this always returned
      // `undefined` for every shop in the report.
      rentAmount: shop.monthlyRent,
    })),
  };
};

const expenseReport = async (data) => {
  const { mallId, startDate, endDate, userRole, userMallId, userMallIds } = data;
  const mallFilter =
    userRole === "SUPER_ADMIN" && !mallId
      ? null
      : resolveMallFilter({ requestedMallId: mallId, userRole, userMallId, userMallIds });

  const matchFilter = { isDeleted: false };
  if (mallFilter) matchFilter.mallId = mallFilter;

  if (startDate || endDate) {
    matchFilter.expenseDate = {};
    if (startDate) matchFilter.expenseDate.$gte = new Date(startDate);
    if (endDate) matchFilter.expenseDate.$lte = new Date(endDate);
  }

  const expenses = await Expense.aggregate([
    { $match: matchFilter },
    { $group: { _id: "$category", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { amount: -1 } },
  ]);

  const totalExpense = await Expense.aggregate([
    { $match: matchFilter },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    totalExpense: totalExpense.length > 0 ? totalExpense[0].total : 0,
    byCategory: expenses,
  };
};

const exportReport = async (type, data) => {
  // TODO: Implement PDF export using a library like pdfkit or puppeteer
  throw new Error("PDF export not yet implemented");
};

export default {
  dashboardStats,
  platformReport,
  revenueChart,
  recentActivities,
  getActivitiesByRole,
  occupancyReport,
  expenseReport,
  exportReport,
};


