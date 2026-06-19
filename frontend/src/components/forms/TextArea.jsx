import React from 'react';
import clsx from 'clsx';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 4,
  className,
  ...rest
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="label-base">
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={clsx('input-base resize-none', error && 'border-danger-500 focus:ring-danger-500')}
      {...rest}
    />
    {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
  </div>
);

export default TextArea;
