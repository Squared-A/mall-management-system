import React from 'react';
import clsx from 'clsx';
import { getInitials } from '../../utils/formatters';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const COLORS = [
  'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-500',
  'bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
  'bg-info-50 text-info-600 dark:bg-info-500/20 dark:text-info-500',
];

const Avatar = ({ name = '', src, size = 'md', className }) => {
  const colorIdx = (name?.charCodeAt(0) || 0) % COLORS.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover', SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        COLORS[colorIdx],
        className
      )}
    >
      {getInitials(name) || '?'}
    </div>
  );
};

export default Avatar;
