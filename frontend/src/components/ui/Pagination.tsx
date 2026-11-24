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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EAE3DE] px-4 py-3 sm:px-6 bg-white rounded-b-2xl">
      <div className="text-xs text-[#82777A] text-center sm:text-left">
        Showing <span className="font-semibold text-[#292326]">{start}</span>–
        <span className="font-semibold text-[#292326]">{end}</span> of{' '}
        <span className="font-semibold text-[#292326]">{total}</span> results
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="touch-target min-w-[36px] min-h-[36px] p-2 rounded-lg border border-[#EAE3DE] text-[#292326] hover:bg-[#FFF6D9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
          aria-label="Previous Page"
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
                  <span className="px-1 sm:px-1.5 text-xs text-[#82777A]">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`min-w-[36px] min-h-[36px] h-9 px-2 rounded-lg text-xs font-semibold transition-all ${
                    p === page
                      ? 'bg-[#651C32] text-white shadow-subtle'
                      : 'text-[#292326] hover:bg-[#FFF6D9] border border-transparent'
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
          className="touch-target min-w-[36px] min-h-[36px] p-2 rounded-lg border border-[#EAE3DE] text-[#292326] hover:bg-[#FFF6D9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
