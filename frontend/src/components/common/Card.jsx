import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, title, subtitle, actions, noPadding = false }) => {
  return (
    <div className={clsx('card animate-fadeIn', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};

export default Card;
