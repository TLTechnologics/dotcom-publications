import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'published' | 'draft' | 'featured' | 'in_stock' | 'out_of_stock' | 'pre_order' | 'category' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    published: 'bg-[#EAF3ED] text-[#477A58] border-[#477A58]/30',
    draft: 'bg-[#FFF6D9] text-[#431322] border-[#F6E7A8]',
    featured: 'bg-[#F5E6EA] text-[#651C32] border-[#8B4055]/30 font-semibold',
    in_stock: 'bg-[#EAF1F7] text-[#557A9C] border-[#557A9C]/30',
    out_of_stock: 'bg-[#FCEBEB] text-[#B94B4B] border-[#B94B4B]/30',
    pre_order: 'bg-[#FAF0E2] text-[#C58B35] border-[#C58B35]/30',
    category: 'bg-[#FAF8F3] text-[#292326] border-[#EAE3DE]',
    neutral: 'bg-[#F5F1EE] text-[#82777A] border-[#EAE3DE]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {variant === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-[#477A58] mr-1.5 animate-pulse" />}
      {variant === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-[#C58B35] mr-1.5" />}
      {children}
    </span>
  );
};
