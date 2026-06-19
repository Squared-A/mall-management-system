import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const Spinner = ({ className, size = 24 }) => (
  <Loader2 className={clsx('animate-spin text-primary-600', className)} size={size} />
);

const LoadingSpinner = ({ fullScreen = false, label = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <Spinner size={24} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
