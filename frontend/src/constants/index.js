export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Mall Management System';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const TOKEN_KEY = 'mms_access_token';
export const REFRESH_TOKEN_KEY = 'mms_refresh_token';
export const USER_KEY = 'mms_user';
export const THEME_KEY = 'mms_theme';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export const LEASE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  PENDING: 'pending',
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  FAILED: 'failed',
};

export const MAINTENANCE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const MAINTENANCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const SHOP_STATUS = {
  OCCUPIED: 'occupied',
  VACANT: 'vacant',
  MAINTENANCE: 'maintenance',
};
