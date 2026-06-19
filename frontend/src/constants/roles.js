export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MALL_OWNER: 'mall_owner',
  MALL_MANAGER: 'mall_manager',
  ACCOUNTANT: 'accountant',
  TENANT: 'tenant',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.MALL_OWNER]: 'Mall Owner',
  [ROLES.MALL_MANAGER]: 'Mall Manager',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.TENANT]: 'Tenant (Shop Owner)',
};

export const ROLE_GROUPS = {
  ALL: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.MALL_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.TENANT,
  ],
  PLATFORM_ADMIN: [ROLES.SUPER_ADMIN],
  PLATFORM_CONTENT: [ROLES.SUPER_ADMIN],
  PLATFORM_REPORTS: [ROLES.SUPER_ADMIN],
  MALL_APPROVAL: [ROLES.SUPER_ADMIN],
  MALL_OWNERSHIP: [ROLES.MALL_OWNER],
  MALL_OPERATIONS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER],
  // Previously [MALL_OWNER, ACCOUNTANT] only — missing MALL_MANAGER, who
  // the backend's payment.routes.js explicitly allows to create/update/
  // delete payments (canManagePayments includes MALL_MANAGER).
  MALL_FINANCE: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT],
  // Previously [MALL_OWNER] only — the backend's staff.routes.js
  // (canManageStaff) explicitly allows MALL_MANAGER to add/edit/remove
  // staff too, not just the owner.
  MALL_STAFF_ADMIN: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER],
  MALL_REPORTS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT],
  TENANT_PORTAL: [ROLES.TENANT],
  // Previously missing ACCOUNTANT, who the backend's lease.routes.js
  // explicitly allows to VIEW (not manage) leases.
  LEASE_ACCESS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT, ROLES.TENANT],
  // Previously missing MALL_MANAGER (can manage payments) — see MALL_FINANCE
  // note above for the same underlying gap.
  PAYMENT_ACCESS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT, ROLES.TENANT],
  // Previously missing ACCOUNTANT, who the backend's maintenance.routes.js
  // explicitly allows to file/view tickets (canFileOrView includes
  // ACCOUNTANT).
  MAINTENANCE_ACCESS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT, ROLES.TENANT],
  ANNOUNCEMENT_READ: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.MALL_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.TENANT,
  ],
  // Previously only PLATFORM_CONTENT (SUPER_ADMIN), which blocked mall
  // owners and managers from creating announcements in their own malls
  // even though the backend's announcement.routes.js explicitly allows
  // SUPER_ADMIN, MALL_OWNER, and MALL_MANAGER to do so.
  ANNOUNCEMENT_WRITE: [ROLES.SUPER_ADMIN, ROLES.MALL_OWNER, ROLES.MALL_MANAGER],
  // Previously this group did not exist at all since the Expense module
  // had no frontend pages. Matches expense.routes.js's canManageExpenses.
  EXPENSE_ACCESS: [ROLES.MALL_OWNER, ROLES.MALL_MANAGER, ROLES.ACCOUNTANT],
};


