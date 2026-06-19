import {
  LayoutDashboard,
  Building2,
  Store,
  Users,
  FileSignature,
  CreditCard,
  Wrench,
  UserCog,
  BarChart3,
  Megaphone,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { ROLE_GROUPS } from '../constants/roles';

/**
 * Sidebar navigation structure. Each item can have nested `children`.
 * `roles` controls which roles can see the item.
 */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: ROUTES.DASHBOARD,
    roles: ROLE_GROUPS.ALL,
  },
  {
    label: 'Malls',
    icon: Building2,
    to: ROUTES.MALLS,
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  {
    label: 'Shops',
    icon: Store,
    to: ROUTES.SHOPS,
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  {
    label: 'Tenants',
    icon: Users,
    to: ROUTES.TENANTS,
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  {
    label: 'Leases',
    icon: FileSignature,
    to: ROUTES.LEASES,
    roles: [...ROLE_GROUPS.MANAGEMENT, 'tenant'],
  },
  {
    label: 'Payments',
    icon: CreditCard,
    to: ROUTES.PAYMENTS,
    roles: ROLE_GROUPS.ALL,
    children: [
      { label: 'All Payments', to: ROUTES.PAYMENTS, roles: ROLE_GROUPS.FINANCE },
      { label: 'Create Payment', to: ROUTES.PAYMENT_CREATE, roles: ROLE_GROUPS.FINANCE },
      { label: 'Payment History', to: ROUTES.PAYMENT_HISTORY, roles: ROLE_GROUPS.ALL },
    ],
  },
  {
    label: 'Maintenance',
    icon: Wrench,
    to: ROUTES.MAINTENANCE,
    roles: ROLE_GROUPS.ALL,
  },
  {
    label: 'Staff',
    icon: UserCog,
    to: ROUTES.STAFF,
    roles: ROLE_GROUPS.ADMIN_ONLY,
  },
  {
    label: 'Reports',
    icon: BarChart3,
    to: ROUTES.REPORTS_REVENUE,
    roles: ROLE_GROUPS.FINANCE,
    children: [
      { label: 'Revenue Report', to: ROUTES.REPORTS_REVENUE, roles: ROLE_GROUPS.FINANCE },
      { label: 'Occupancy Report', to: ROUTES.REPORTS_OCCUPANCY, roles: ROLE_GROUPS.FINANCE },
      { label: 'Expense Report', to: ROUTES.REPORTS_EXPENSE, roles: ROLE_GROUPS.FINANCE },
    ],
  },
  {
    label: 'Announcements',
    icon: Megaphone,
    to: ROUTES.ANNOUNCEMENTS,
    roles: ROLE_GROUPS.ALL,
  },
];
