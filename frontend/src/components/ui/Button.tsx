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
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#651C32] hover:bg-[#431322] text-white shadow-subtle focus:ring-[#651C32]',
    secondary: 'bg-[#F6E7A8] hover:bg-[#FBEFC4] text-[#431322] border border-[#F6E7A8] font-semibold focus:ring-[#F6E7A8] shadow-subtle',
    outline: 'border border-[#EAE3DE] bg-white hover:bg-[#FFF6D9]/60 text-[#292326] hover:border-[#651C32] focus:ring-[#651C32]',
    ghost: 'text-[#651C32] hover:bg-[#FFF6D9] focus:ring-[#651C32]',
    danger: 'bg-[#B94B4B] hover:bg-[#9A3838] text-white focus:ring-[#B94B4B]',
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
