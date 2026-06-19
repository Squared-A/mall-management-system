import React from 'react';
import clsx from 'clsx';

const TextInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  helperText,
  className,
  ...rest
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="label-base">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx('input-base', Icon && 'pl-9', error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500')}
        {...rest}
      />
    </div>
    {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    {!error && helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
  </div>
);

export default TextInput;
