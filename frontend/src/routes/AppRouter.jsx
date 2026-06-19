import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts & Guards
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Auth
import Login from '../pages/auth/Login';
import RegisterMall from '../pages/auth/RegisterMall';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Error pages
import { NotFound, Unauthorized } from '../pages/ErrorPages';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Malls
import MallList from '../pages/malls/MallList';
import { AddMall, EditMall } from '../pages/malls/MallFormPages';
import MallDetails from '../pages/malls/MallDetails';

// Shops
import ShopList from '../pages/shops/ShopList';
import { AddShop, EditShop, ShopDetails } from '../pages/shops/ShopPages';

// Tenants
import TenantList from '../pages/tenants/TenantList';
import { AddTenant, EditTenant, TenantDetails } from '../pages/tenants/TenantPages';

// Leases
import { LeaseList, CreateLease, LeaseDetails } from '../pages/leases/LeasePages';

// Payments
import { PaymentList, CreatePayment, PaymentHistory, InvoiceView } from '../pages/payments/PaymentPages';

// Maintenance
import { MaintenanceList, CreateMaintenanceRequest, RequestTracking } from '../pages/maintenance/MaintenancePages';

// Staff
import { StaffList, AddStaff, EditStaff } from '../pages/staff/StaffPages';

// Reports
import { RevenueReport, OccupancyReport, ExpenseReport } from '../pages/reports/ReportPages';

// Announcements
import { AnnouncementList, CreateAnnouncement } from '../pages/announcements/AnnouncementPages';

import { ROUTES } from '../constants/routes';
import { ROLE_GROUPS } from '../constants/roles';

const R = ({ roles, children }) =>
  roles ? <RoleBasedRoute allowedRoles={roles}>{children}</RoleBasedRoute> : children;

const AppRouter = () => (
  <Routes>
    {/* ── Auth ── */}
    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER_MALL} element={<RegisterMall />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
    </Route>

    {/* ── Standalone error pages ── */}
    <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

    {/* ── Protected App ── */}
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

      {/* Malls */}
      <Route path={ROUTES.MALLS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><MallList /></R>} />
      <Route path={ROUTES.MALL_ADD} element={<R roles={ROLE_GROUPS.ADMIN_ONLY}><AddMall /></R>} />
      <Route path={ROUTES.MALL_EDIT} element={<R roles={ROLE_GROUPS.ADMIN_ONLY}><EditMall /></R>} />
      <Route path={ROUTES.MALL_DETAILS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><MallDetails /></R>} />

      {/* Shops */}
      <Route path={ROUTES.SHOPS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><ShopList /></R>} />
      <Route path={ROUTES.SHOP_ADD} element={<R roles={ROLE_GROUPS.MANAGEMENT}><AddShop /></R>} />
      <Route path={ROUTES.SHOP_EDIT} element={<R roles={ROLE_GROUPS.MANAGEMENT}><EditShop /></R>} />
      <Route path={ROUTES.SHOP_DETAILS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><ShopDetails /></R>} />

      {/* Tenants */}
      <Route path={ROUTES.TENANTS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><TenantList /></R>} />
      <Route path={ROUTES.TENANT_ADD} element={<R roles={ROLE_GROUPS.MANAGEMENT}><AddTenant /></R>} />
      <Route path={ROUTES.TENANT_EDIT} element={<R roles={ROLE_GROUPS.MANAGEMENT}><EditTenant /></R>} />
      <Route path={ROUTES.TENANT_DETAILS} element={<R roles={ROLE_GROUPS.MANAGEMENT}><TenantDetails /></R>} />

      {/* Leases */}
      <Route path={ROUTES.LEASES} element={<LeaseList />} />
      <Route path={ROUTES.LEASE_CREATE} element={<R roles={ROLE_GROUPS.MANAGEMENT}><CreateLease /></R>} />
      <Route path={ROUTES.LEASE_DETAILS} element={<LeaseDetails />} />

      {/* Payments */}
      <Route path={ROUTES.PAYMENTS} element={<PaymentList />} />
      <Route path={ROUTES.PAYMENT_CREATE} element={<R roles={ROLE_GROUPS.FINANCE}><CreatePayment /></R>} />
      <Route path={ROUTES.PAYMENT_HISTORY} element={<PaymentHistory />} />
      <Route path={ROUTES.INVOICE_VIEW} element={<InvoiceView />} />

      {/* Maintenance */}
      <Route path={ROUTES.MAINTENANCE} element={<MaintenanceList />} />
      <Route path={ROUTES.MAINTENANCE_CREATE} element={<CreateMaintenanceRequest />} />
      <Route path={ROUTES.MAINTENANCE_TRACKING} element={<RequestTracking />} />

      {/* Staff */}
      <Route path={ROUTES.STAFF} element={<R roles={ROLE_GROUPS.ADMIN_ONLY}><StaffList /></R>} />
      <Route path={ROUTES.STAFF_ADD} element={<R roles={ROLE_GROUPS.ADMIN_ONLY}><AddStaff /></R>} />
      <Route path={ROUTES.STAFF_EDIT} element={<R roles={ROLE_GROUPS.ADMIN_ONLY}><EditStaff /></R>} />

      {/* Reports */}
      <Route path={ROUTES.REPORTS_REVENUE} element={<R roles={ROLE_GROUPS.FINANCE}><RevenueReport /></R>} />
      <Route path={ROUTES.REPORTS_OCCUPANCY} element={<R roles={ROLE_GROUPS.FINANCE}><OccupancyReport /></R>} />
      <Route path={ROUTES.REPORTS_EXPENSE} element={<R roles={ROLE_GROUPS.FINANCE}><ExpenseReport /></R>} />

      {/* Announcements */}
      <Route path={ROUTES.ANNOUNCEMENTS} element={<AnnouncementList />} />
      <Route path={ROUTES.ANNOUNCEMENT_CREATE} element={<R roles={ROLE_GROUPS.MANAGEMENT}><CreateAnnouncement /></R>} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
