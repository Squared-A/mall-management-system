import {
  LayoutDashboard,
  Building2,
  Store,
  Users,
  FileSignature,
  CreditCard,
  Wrench,
  UserCog,
  Receipt,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { ROUTES } from "../constants/routes";
import { ROLE_GROUPS } from "../constants/roles";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: ROUTES.DASHBOARD,
    roles: ROLE_GROUPS.ALL,
  },
  {
    label: "Malls",
    icon: Building2,
    to: ROUTES.MALLS,
    roles: [...ROLE_GROUPS.MALL_APPROVAL, ...ROLE_GROUPS.MALL_OPERATIONS],
  },
  {
    label: "Shops",
    icon: Store,
    to: ROUTES.SHOPS,
    roles: ROLE_GROUPS.MALL_OPERATIONS,
  },
  {
    label: "Tenants",
    icon: Users,
    to: ROUTES.TENANTS,
    roles: ROLE_GROUPS.MALL_OPERATIONS,
  },
  {
    label: "Leases",
    icon: FileSignature,
    to: ROUTES.LEASES,
    roles: ROLE_GROUPS.LEASE_ACCESS,
  },
  {
    label: "Payments",
    icon: CreditCard,
    to: ROUTES.PAYMENTS,
    roles: ROLE_GROUPS.PAYMENT_ACCESS,
    children: [
      {
        label: "All Payments",
        to: ROUTES.PAYMENTS,
        roles: ROLE_GROUPS.MALL_FINANCE,
      },
      {
        label: "Create Payment",
        to: ROUTES.PAYMENT_CREATE,
        roles: ROLE_GROUPS.MALL_FINANCE,
      },
      {
        label: "Payment History",
        to: ROUTES.PAYMENT_HISTORY,
        roles: ROLE_GROUPS.PAYMENT_ACCESS,
      },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    to: ROUTES.MAINTENANCE,
    roles: ROLE_GROUPS.MAINTENANCE_ACCESS,
  },
  {
    label: "Staff",
    icon: UserCog,
    to: ROUTES.STAFF,
    roles: ROLE_GROUPS.MALL_STAFF_ADMIN,
  },
  {
    label: "Expenses",
    icon: Receipt,
    to: ROUTES.EXPENSES,
    roles: ROLE_GROUPS.EXPENSE_ACCESS,
  },
  {
    label: "Reports",
    icon: BarChart3,
    to: ROUTES.REPORTS_REVENUE,
    roles: [...ROLE_GROUPS.MALL_REPORTS, ...ROLE_GROUPS.PLATFORM_REPORTS],
    children: [
      {
        label: "Platform Overview",
        to: ROUTES.REPORTS_PLATFORM,
        roles: ROLE_GROUPS.PLATFORM_REPORTS,
      },
      {
        label: "Revenue Report",
        to: ROUTES.REPORTS_REVENUE,
        roles: ROLE_GROUPS.MALL_REPORTS,
      },
      {
        label: "Occupancy Report",
        to: ROUTES.REPORTS_OCCUPANCY,
        roles: ROLE_GROUPS.MALL_REPORTS,
      },
      {
        label: "Expense Report",
        to: ROUTES.REPORTS_EXPENSE,
        roles: ROLE_GROUPS.MALL_REPORTS,
      },
    ],
  },
  {
    label: "Announcements",
    icon: Megaphone,
    to: ROUTES.ANNOUNCEMENTS,
    roles: ROLE_GROUPS.ANNOUNCEMENT_READ,
  },
];
