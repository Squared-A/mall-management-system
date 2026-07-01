import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * @param {Array<{label: string, to?: string}>} items
 */
const Breadcrumbs = ({ items = [] }) => (
  <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1" aria-label="Breadcrumb">
    <Link to="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors">
      <Home className="h-3.5 w-3.5" />
    </Link>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-gray-300 dark:text-gray-600" />
        {item.to && idx !== items.length - 1 ? (
          <Link to={item.to} className="hover:text-primary-600 transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;
