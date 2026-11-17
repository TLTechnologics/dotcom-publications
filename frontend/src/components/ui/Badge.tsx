import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'published' | 'draft' | 'featured' | 'in_stock' | 'out_of_stock' | 'pre_order' | 'category' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    draft: 'bg-amber-50 text-amber-800 border-amber-200',
    featured: 'bg-editorial-burgundy-50 text-editorial-burgundy-800 border-editorial-burgundy-200 font-medium',
    in_stock: 'bg-blue-50 text-blue-800 border-blue-200',
    out_of_stock: 'bg-rose-50 text-rose-800 border-rose-200',
    pre_order: 'bg-purple-50 text-purple-800 border-purple-200',
    category: 'bg-paper-200 text-charcoal-700 border-paper-300',
    neutral: 'bg-stone-100 text-charcoal-700 border-stone-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {variant === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
      {variant === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
      {children}
    </span>
  );
};
