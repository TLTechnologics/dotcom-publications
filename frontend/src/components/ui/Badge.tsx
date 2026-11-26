import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'published' | 'draft' | 'featured' | 'in_stock' | 'out_of_stock' | 'pre_order' | 'category' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    published: 'bg-[#EAF3ED] text-[#3A754E] border-[#3A754E]/30',
    draft: 'bg-[#FAF2BA] text-[#181716] border-[#EED97A]',
    featured: 'bg-[#FAF2BA] text-[#181716] border-[#EED97A] font-semibold',
    in_stock: 'bg-[#EAF1F7] text-[#4B7396] border-[#4B7396]/30',
    out_of_stock: 'bg-[#FDF2F2] text-[#D34545] border-[#D34545]/30',
    pre_order: 'bg-[#FAF0E2] text-[#C58B35] border-[#C58B35]/30',
    category: 'bg-[#FAF9F5] text-[#181716] border-[#EAE3DE]',
    neutral: 'bg-[#F5F2EB] text-[#736B5E] border-[#EAE3DE]',
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
