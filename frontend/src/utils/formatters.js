import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number as currency (USD by default).
 */
export const formatCurrency = (value, currency = 'USD') => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format a number with thousand separators.
 */
export const formatNumber = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a date string/object into a readable date.
 */
export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  return format(d, pattern);
};

/**
 * Format a date including time.
 */
export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy hh:mm a');

/**
 * Capitalize first letter and replace underscores with spaces.
 */
export const formatLabel = (value = '') =>
  value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Truncate a string with ellipsis.
 */
export const truncate = (text = '', length = 50) =>
  text.length > length ? `${text.slice(0, length)}...` : text;

/**
 * Generate initials from a full name.
 */
export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * Format a percentage value.
 */
export const formatPercent = (value, decimals = 1) =>
  `${Number(value || 0).toFixed(decimals)}%`;
