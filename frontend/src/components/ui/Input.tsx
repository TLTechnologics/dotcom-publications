import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-editorial-burgundy-600">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border bg-white text-sm text-charcoal-900 placeholder-charcoal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500 focus:border-editorial-burgundy-500 disabled:bg-paper-100 disabled:text-charcoal-500 ${
              icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2 ${
              error ? 'border-rose-400 focus:ring-rose-400' : 'border-stone-300 hover:border-stone-400'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-charcoal-500">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
