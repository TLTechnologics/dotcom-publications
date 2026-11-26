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
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
            {label} {props.required && <span className="text-[#651C32]">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-subtle">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#82777A]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-xl border bg-white text-sm text-[#292326] placeholder-[#82777A]/70 transition-colors focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] disabled:bg-[#FAF8F3] disabled:text-[#82777A] ${
              icon ? 'pl-9' : 'pl-3.5'
            } pr-3.5 py-2.5 ${
              error ? 'border-[#B94B4B] focus:ring-[#B94B4B]' : 'border-[#EAE3DE] hover:border-[#8B4055]/60'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#B94B4B] font-medium">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-[#82777A]">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
