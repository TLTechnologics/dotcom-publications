import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helper, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-editorial-burgundy-600">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-lg border bg-white text-sm text-charcoal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500 focus:border-editorial-burgundy-500 px-3 py-2 ${
            error ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-300 hover:border-stone-400'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-charcoal-500">{helper}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
