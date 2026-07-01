import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-danger-200 dark:border-danger-500/30 bg-danger-50/50 dark:bg-danger-500/5 px-6 py-12 text-center">
    <div className="rounded-full bg-danger-50 dark:bg-danger-500/10 p-3">
      <AlertTriangle className="h-6 w-6 text-danger-500" />
    </div>
    <div>
      <p className="font-medium text-gray-900 dark:text-gray-100">We hit a snag</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export const EmptyState = ({
  title = 'No data found',
  message = 'There is nothing to show here yet.',
  icon: Icon = Inbox,
  action,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 px-6 py-14 text-center">
    <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <div>
      <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
    {action}
  </div>
);

export default ErrorMessage;
