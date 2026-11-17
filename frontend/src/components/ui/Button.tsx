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
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-editorial-burgundy-700 hover:bg-editorial-burgundy-800 text-white shadow-subtle focus:ring-editorial-burgundy-600',
    secondary: 'bg-paper-200 hover:bg-paper-300 text-charcoal-800 border border-paper-300 focus:ring-charcoal-400',
    outline: 'border border-charcoal-300 hover:bg-paper-100 text-charcoal-800 focus:ring-editorial-burgundy-500',
    ghost: 'text-charcoal-700 hover:bg-paper-200/60 focus:ring-charcoal-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
