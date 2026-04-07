// ============================================
// INPUT COMPONENT
// ============================================

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border ${error ? 'border-red-300' : 'border-gray-300'}
            px-${icon ? '10' : '4'} py-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

interface NumberInputProps extends Omit<InputProps, 'type' | 'step'> {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  min,
  max,
  step = 0.01,
  prefix,
  suffix,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (props.onChange) {
      if (isNaN(value)) {
        props.onChange(e);
      } else if (min !== undefined && value < min) {
        e.target.value = min.toString();
        props.onChange(e);
      } else if (max !== undefined && value > max) {
        e.target.value = max.toString();
        props.onChange(e);
      } else {
        props.onChange(e);
      }
    }
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
          {prefix}
        </span>
      )}
      <Input
        {...props}
        type="number"
        step={step}
        min={min}
        max={max}
        className={`${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        onChange={handleChange}
      />
      {suffix && (
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
