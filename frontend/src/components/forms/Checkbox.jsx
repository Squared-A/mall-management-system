import React from 'react';
import clsx from 'clsx';

export const Checkbox = ({ label, name, checked, onChange, className }) => (
  <label className={clsx('flex items-center gap-2 cursor-pointer select-none', className)}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500"
    />
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

export const Switch = ({ label, name, checked, onChange, className }) => (
  <label className={clsx('flex items-center gap-3 cursor-pointer select-none', className)}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.({ target: { name, checked: !checked, type: 'checkbox' } })}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
        checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);
