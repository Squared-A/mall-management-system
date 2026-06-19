import React from 'react';
import clsx from 'clsx';
import { formatLabel } from '../../utils/formatters';

const STATUS_VARIANTS = {
  // Lease statuses
  active: 'badge-success',
  expired: 'badge-gray',
  terminated: 'badge-danger',
  pending: 'badge-warning',

  // Payment statuses
  paid: 'badge-success',
  overdue: 'badge-danger',
  failed: 'badge-danger',

  // Maintenance statuses
  open: 'badge-info',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
  closed: 'badge-gray',

  // Shop statuses
  occupied: 'badge-success',
  vacant: 'badge-gray',
  maintenance: 'badge-warning',

  // Priorities
  low: 'badge-gray',
  medium: 'badge-info',
  high: 'badge-warning',
  urgent: 'badge-danger',
};

const Badge = ({ status, children, variant }) => {
  const className = variant
    ? `badge-${variant}`
    : STATUS_VARIANTS[String(status).toLowerCase()] || 'badge-gray';

  return <span className={clsx(className)}>{children || formatLabel(status)}</span>;
};

export default Badge;
