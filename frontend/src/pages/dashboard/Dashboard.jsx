import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Home,
  FileSignature,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../hooks/useAuth";
import { useMall } from "../../context/MallContext";
import StatCard from "./StatCard";
import Card from "../../components/common/Card";
import RevenueChart from "../../components/charts/RevenueChart";
import OccupancyChart from "../../components/charts/OccupancyChart";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import { reportApi } from "../../api/reportApi";
import { dashboardApi } from "../../api/dashboardApi";

const STAT_ICONS = [DollarSign, Home, FileSignature, CreditCard];

const ACTIVITY_COLORS = {
  success: "bg-success-500",
  info: "bg-info-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  primary: "bg-primary-500",
  gray: "bg-gray-400",
};

const Dashboard = () => {
  const { user } = useAuth();
  const { activeMallId } = useMall();
  const [REVENUE_DATA, setREVENUEDATA] = useState([]);
  const [STATS, setSTATS] = useState([]);
  const [RECENTACTIVITIES, setRECENTACTS] = useState([]);

  const userRole = user?.role;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await reportApi.getRevenueReport();
        setREVENUEDATA(response?.data?.data?.revenueData ?? []);
      } catch (error) {
        setREVENUEDATA([]);
      }
    };
    const fetchDashboardStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setSTATS(response?.data?.data ?? {});
      } catch (error) {
        setSTATS({});
      }
    };
    const fetchActivities = async () => {
      try {
        const response = await dashboardApi.getRecentActivities();
        setRECENTACTS(response?.data?.data ?? []);
      } catch (error) {
        setRECENTACTS([]);
      }
    };
    fetchRevenueData();
    fetchDashboardStats();
    fetchActivities();
    // Previously had an empty dependency array, so the entire dashboard —
    // revenue, stats, recent activity — loaded once at mount and never
    // refreshed when the active mall changed (now possible via
    // MallSelector for owners with multiple malls). An owner switching
    // from Mall A to Mall B would keep seeing Mall A's numbers.
  }, [activeMallId]);

  const STAT_CARDS = {
    All: [
      {
        id: "total-revenue",
        label: "Total Revenue",
        value: STATS.totalRevenue,
        change: "+12.5%",
        positive: true,
        detail: "vs last year",
        color: "primary",
      },
      {
        id: "pending-payments",
        label: "Pending Payments",
        value: STATS.pendingPayments ?? 0,
        change: null,
        positive: false,
        detail: "awaiting payment",
        color: "warning",
      },
    ],
    ownerAndManager: [
      {
        id: "occupancy-rate",
        label: "Occupancy Rate",
        value: formatPercent(STATS.occupancyRate || 0, 0),
        change: null,
        positive: true,
        detail: "occupied shops",
        color: "success",
      },
      {
        id: "active-leases",
        label: "Active Leases",
        value: STATS.activeLeases ?? 0,
        change: null,
        positive: true,
        detail: "currently active",
        color: "info",
      },
    ],
    superAdmin: [
      {
        id: "total-malls",
        label: "Total Malls",
        value: STATS.totalMalls ?? 0,
        detail: `${STATS.approvedMalls ?? 0} approved`,
        color: "primary",
      },
      {
        id: "pending-malls",
        label: "Pending Approvals",
        value: STATS.pendingMalls ?? 0,
        detail: "mall requests",
        color: "warning",
      },
      {
        id: "total-users",
        label: "Total Users",
        value: STATS.totalUsers ?? 0,
        detail: "platform accounts",
        color: "info",
      },
      {
        id: "platform-revenue",
        label: "Platform Revenue",
        value: formatCurrency(STATS.totalRevenue ?? 0),
        detail: "completed payments",
        color: "success",
      },
    ],
    tenant: [
      {
        id: "tenant-active-leases",
        label: "Active Leases",
        value: STATS.activeLeases ?? 0,
        detail: `${STATS.totalLeases ?? 0} total leases`,
        color: "info",
      },
      {
        id: "tenant-pending-payments",
        label: "Pending Payments",
        value: STATS.pendingPayments ?? 0,
        detail: "awaiting payment",
        color: "warning",
      },
      {
        id: "tenant-completed-payments",
        label: "Completed Payments",
        value: STATS.completedPayments ?? 0,
        detail: "payment records",
        color: "success",
      },
      {
        id: "tenant-announcements",
        label: "Announcements",
        value: STATS.totalAnnouncements ?? 0,
        detail: "visible notices",
        color: "primary",
      },
    ],
  };

  const recentActivities = Array.isArray(RECENTACTIVITIES)
    ? RECENTACTIVITIES.map((RA) => ({
        ...RA,
        time: RA?.time
          ? new Date(RA.time).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      }))
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {greeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening across your mall operations today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          All systems operational
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {userRole === ROLES.SUPER_ADMIN &&
          STAT_CARDS.superAdmin.map((stat, idx) => (
            <StatCard key={stat.id} {...stat} icon={STAT_ICONS[idx % STAT_ICONS.length]} />
          ))}

        {userRole === ROLES.TENANT &&
          STAT_CARDS.tenant.map((stat, idx) => (
            <StatCard key={stat.id} {...stat} icon={STAT_ICONS[idx % STAT_ICONS.length]} />
          ))}

        {[ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT].includes(
          userRole,
        ) &&
          STAT_CARDS.All.map((stat, idx) => (
            <StatCard key={stat.id} {...stat} icon={STAT_ICONS[idx]} />
          ))}

        {[ROLES.MALL_OWNER, ROLES.MALL_MANAGER].includes(userRole) &&
          STAT_CARDS.ownerAndManager.map((stat, idx) => (
            <StatCard key={stat.id} {...stat} icon={STAT_ICONS[(idx + 2) % STAT_ICONS.length]} />
          ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {[ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT].includes(
          userRole,
        ) && (
          <Card
            className="xl:col-span-2"
            title="Revenue Overview"
            subtitle="Monthly revenue vs expenses (current year)"
            actions={
              <Link
                to={ROUTES.REPORTS_REVENUE}
                className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
              >
                Full report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <RevenueChart data={REVENUE_DATA} />
          </Card>
        )}
        {[ROLES.MALL_OWNER, ROLES.MALL_MANAGER].includes(userRole) && (
          <Card
            title="Occupancy Rate"
            subtitle="Shops occupied vs vacant"
            actions={
              <Link
                to={ROUTES.REPORTS_OCCUPANCY}
                className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
              >
                Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <OccupancyChart
              occupied={STATS.occupiedShops}
              vacant={STATS.vacantShops}
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-50 dark:bg-primary-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {STATS.occupiedShops}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Occupied
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {STATS.vacantShops}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vacant
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
      {/* Bottom row: Activity + Top Shops */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Latest events across your malls"
          actions={<span className="badge-gray">Live</span>}
        >
          <ul className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800 -mx-5">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <span
                  className={clsx(
                    "mt-2 h-2 w-2 shrink-0 rounded-full",
                    ACTIVITY_COLORS[activity.color],
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                  {activity.time}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Top Performing Shops
        <Card
          title="Top Shops by Revenue"
          subtitle="This month's highest earners"
          actions={
            <Link
              to={ROUTES.SHOPS}
              className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
            >
              All shops <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <ul className="space-y-3 mt-1">
            {MOCK_TOP_SHOPS.map((shop, idx) => {
              const maxRevenue = MOCK_TOP_SHOPS[0].revenue;
              const pct = Math.round((shop.revenue / maxRevenue) * 100);
              const isPositive = shop.trend.startsWith("+");
              return (
                <li key={shop.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {shop.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {formatCurrency(shop.revenue)}
                      </span>
                      <span
                        className={clsx(
                          "text-xs font-medium",
                          isPositive ? "text-success-600" : "text-danger-600",
                        )}
                      >
                        {shop.trend}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card> */}
      </div>
    </div>
  );
};

export default Dashboard;


