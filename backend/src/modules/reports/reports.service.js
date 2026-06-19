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
  const { userId, mallId, userRole } = data;
  const totalShops = await Shop.countDocuments({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const occupiedShops = await Shop.countDocuments({
    status: "OCCUPIED",
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const vacantShops = await Shop.countDocuments({
    status: { $ne: "AVAILABLE" },
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const totalTenants = await Tenant.countDocuments({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const maintenanceOpen = await Maintenance.countDocuments({
    status: "OPEN",
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const revenue = await Payment.aggregate([
    {
      $match: {
        paymentDate: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);
  const totalMalls = await Mall.countDocuments({ isDeleted: false });
  const totalStaff = await Staff.countDocuments({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });
  const totalAnnouncements = await Announcement.countDocuments({
    isDeleted: false,
    mallId: new mongoose.Types.ObjectId(mallId),
  });

  if (userRole === "MALL_OWNER" || userRole === "MALL_MANAGER") {
    return {
      totalShops,
      occupiedShops,
      vacantShops,
      totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
      totalTenants,
      maintenanceOpen,
      totalStaff,
      totalAnnouncements,
    };
  } else if (userRole === "ACCOUNTANT") {
    return {
      totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
      totalAnnouncements: totalAnnouncements.filter(
        (A) => A.targetRole === "ACCOUNTANT",
      ),
    };
  } else if (userRole === "SUPER_ADMIN") {
    return {
      totalMalls,
      totalAnnouncements,
    };
  } else if (userRole === "TENANT") {
    const tenant = await Tenant.findOne({ isDeleted: false, userId });
    const totalLeases = await Lease.countDocuments({
      isDeleted: false,
      tenantId: tenant._id,
    });
    return {
      totalAnnouncements: totalAnnouncements.filter(
        (A) => A.targetRole === "TENANT",
      ),
      totalLeases,
    };
  }
};

const revenueChart = async (data) => {
  const { mallId, userId, userRole } = data;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenue = await Payment.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "completed",
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const expenses = await Expense.aggregate([
    {
      $match: {
        isDeleted: false,
        status: "completed",
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        expense: { $sum: "$amount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthlyReport = months.map((month, index) => ({
    month,
    revenue: revenue.find((r) => r._id === index + 1)?.revenue || 0,
    expense: expenses.find((r) => r._id === index + 1)?.expense || 0,
    profit:
      revenue.find((r) => r._id === index + 1)?.revenue /
        expenses.find((r) => r._id === index + 1)?.expense || 0,
  }));

  return {
    monthlyReport,
  };
};

export default { dashboardStats, revenueChart };
