import React from 'react';
import clsx from 'clsx';

/**
 * @param {{label: string, value: string}[]} options
 */
const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className,
  ...rest
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="label-base">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx('input-base cursor-pointer', error && 'border-danger-500 focus:ring-danger-500')}
      {...rest}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
  </div>
);

export default SelectInput;
