import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ' +
    'disabled:cursor-not-allowed disabled:transform-none select-none rounded-xl group cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#EED97A] hover:bg-[#F5E288] text-[#181716] font-semibold border border-[#E5CE68] shadow-subtle hover:shadow-pastel focus-visible:ring-[#EED97A]',
    secondary:
      'bg-[#FAF2BA] hover:bg-[#FFF6D9] text-[#181716] border border-[#EED97A] font-semibold hover:shadow-pastel focus-visible:ring-[#EED97A]',
    outline:
      'border border-[#EAE3DE] bg-white hover:bg-[#FAF2BA]/50 text-[#181716] hover:border-[#EED97A] hover:text-[#181716] focus-visible:ring-[#EED97A]',
    ghost:
      'text-[#181716] hover:bg-[#FAF2BA]/60 focus-visible:ring-[#EED97A]',
    danger:
      'bg-[#D34545] hover:bg-[#BA3838] text-white focus-visible:ring-[#D34545]',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5 shrink-0" />
      ) : icon ? (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};
