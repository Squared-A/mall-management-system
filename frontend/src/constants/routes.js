export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER_MALL: '/register-mall',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/',

  // Malls
  MALLS: '/malls',
  MALL_ADD: '/malls/add',
  MALL_EDIT: '/malls/:id/edit',
  MALL_DETAILS: '/malls/:id',

  // Shops
  SHOPS: '/shops',
  SHOP_ADD: '/shops/add',
  SHOP_EDIT: '/shops/:id/edit',
  SHOP_DETAILS: '/shops/:id',

  // Tenants
  TENANTS: '/tenants',
  TENANT_ADD: '/tenants/add',
  TENANT_EDIT: '/tenants/:id/edit',
  TENANT_DETAILS: '/tenants/:id',

  // Leases
  LEASES: '/leases',
  LEASE_CREATE: '/leases/create',
  LEASE_DETAILS: '/leases/:id',

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_CREATE: '/payments/create',
  PAYMENT_HISTORY: '/payments/history',
  INVOICE_VIEW: '/payments/invoices/:id',

  // Maintenance
  MAINTENANCE: '/maintenance',
  MAINTENANCE_CREATE: '/maintenance/create',
  MAINTENANCE_TRACKING: '/maintenance/:id',

  // Staff
  STAFF: '/staff',
  STAFF_ADD: '/staff/add',
  STAFF_EDIT: '/staff/:id/edit',

  // Reports
  REPORTS_REVENUE: '/reports/revenue',
  REPORTS_OCCUPANCY: '/reports/occupancy',
  REPORTS_EXPENSE: '/reports/expense',

  // Announcements
  ANNOUNCEMENTS: '/announcements',
  ANNOUNCEMENT_CREATE: '/announcements/create',

  // Misc
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
};
