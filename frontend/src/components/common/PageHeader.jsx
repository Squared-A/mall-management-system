import React from 'react';
import Breadcrumbs from './Breadcrumbs';

const PageHeader = ({ title, subtitle, breadcrumbs, actions }) => (
  <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export default PageHeader;
