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

// Roles allowed to access each module/route
export const ROLE_GROUPS = {
  ALL: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.MALL_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.TENANT,
  ],
  MANAGEMENT: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.MALL_MANAGER,
  ],
  FINANCE: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.ACCOUNTANT,
  ],
  ADMIN_ONLY: [ROLES.SUPER_ADMIN, ROLES.MALL_OWNER],
  STAFF: [
    ROLES.SUPER_ADMIN,
    ROLES.MALL_OWNER,
    ROLES.MALL_MANAGER,
    ROLES.ACCOUNTANT,
  ],
};
