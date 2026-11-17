import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pages,
  total,
  limit,
  onPageChange,
}) => {
  if (total <= limit) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 sm:px-6 bg-white rounded-b-xl">
      <div className="text-xs text-charcoal-500">
        Showing <span className="font-medium text-charcoal-800">{start}</span> to{' '}
        <span className="font-medium text-charcoal-800">{end}</span> of{' '}
        <span className="font-medium text-charcoal-800">{total}</span> results
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-stone-200 text-charcoal-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            return (
              <React.Fragment key={p}>
                {prev && p - prev > 1 && (
                  <span className="px-2 text-xs text-charcoal-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-editorial-burgundy-700 text-white'
                      : 'text-charcoal-700 hover:bg-stone-100 border border-transparent'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-1.5 rounded-lg border border-stone-200 text-charcoal-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
