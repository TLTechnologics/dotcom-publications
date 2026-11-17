import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-stone-200/80 shadow-subtle my-4">
      <div className="w-14 h-14 rounded-2xl bg-paper-100 flex items-center justify-center text-charcoal-400 mb-4 border border-stone-200">
        {icon}
      </div>
      <h3 className="text-base font-serif font-semibold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-xs text-charcoal-500 max-w-sm leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
