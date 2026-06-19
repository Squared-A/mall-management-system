import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const COLOR_MAP = {
  primary: {
    icon: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    badge: 'text-primary-600',
  },
  success: {
    icon: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
    badge: 'text-success-600',
  },
  info: {
    icon: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-500',
    badge: 'text-info-600',
  },
  warning: {
    icon: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
    badge: 'text-warning-600',
  },
  danger: {
    icon: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
    badge: 'text-danger-600',
  },
};

const StatCard = ({ label, value, change, positive, detail, color = 'primary', icon: Icon }) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="card p-5 flex items-start justify-between gap-4 animate-fadeIn hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-gray-50 truncate">{value}</p>
        {(change || detail) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {change && (
              <span
                className={clsx(
                  'flex items-center gap-0.5 font-semibold',
                  positive ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {change}
              </span>
            )}
            {detail && <span className="text-gray-400">{detail}</span>}
          </div>
        )}
      </div>
      {Icon && (
        <div className={clsx('rounded-xl p-3 shrink-0', colors.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
