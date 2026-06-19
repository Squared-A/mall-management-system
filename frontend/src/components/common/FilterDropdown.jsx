import React from 'react';
import { ListFilter } from 'lucide-react';

/**
 * Simple select-based filter dropdown.
 * @param {{label: string, value: string}[]} options
 */
const FilterDropdown = ({ value, onChange, options = [], placeholder = 'All', icon: Icon = ListFilter, className = '' }) => (
  <div className={`relative ${className}`}>
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base pl-9 appearance-none cursor-pointer pr-8"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default FilterDropdown;
