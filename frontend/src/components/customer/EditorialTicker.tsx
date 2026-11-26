import React, { useMemo } from 'react';
import { Book } from '../../types';
import { Sparkles, ChevronRight } from 'lucide-react';

interface EditorialTickerProps {
  books?: Book[];
  onSelectBook?: (book: Book) => void;
}

interface TickerItem {
  id: string | number;
  badge: string;
  text: string;
  subtext?: string;
  callout?: string;
  book?: Book;
}

export const EditorialTicker: React.FC<EditorialTickerProps> = ({ books = [], onSelectBook }) => {
  // Compute a robust, non-empty list of items for the marquee
  const displayItems = useMemo<TickerItem[]>(() => {
    let baseList: TickerItem[] = [];

    if (books && books.length > 0) {
      const defaultBadges = [
        'LATEST DISPATCHES',
        'NEW PUBLICATIONS',
        'BOOK RELEASES',
        'MONOGRAPH SERIES',
        'NEW ARRIVALS',
      ];
      baseList = books.slice(0, 10).map((b, idx) => ({
        id: `book-${b.id}-${idx}`,
        badge: b.category_name?.toUpperCase() || defaultBadges[idx % defaultBadges.length],
        text: b.title,
        subtext: b.authors?.map((a) => a.name).join(', ') || 'Faculty Authors',
        callout: `₹${b.selling_price}`,
        book: b,
      }));
    } else {
      baseList = [
        {
          id: 'f-1',
          badge: 'NEW PUBLICATIONS',
          text: 'Principles of Modern Econometric Theory & Higher Pedagogy',
          subtext: 'University Monograph Series',
          callout: 'Now in Print',
        },
        {
          id: 'f-2',
          badge: 'BOOK RELEASES',
          text: 'Computational Quantum Mechanics & Engineering Informatics',
          subtext: 'Faculty Board of Sciences',
          callout: 'Accredited Syllabus',
        },
        {
          id: 'f-3',
          badge: 'MONOGRAPH SERIES',
          text: 'Contemporary Constitutional Jurisprudence in South Asia',
          subtext: 'Department of Higher Education',
          callout: '2nd Revised Edition',
        },
        {
          id: 'f-4',
          badge: 'LATEST DISPATCHES',
          text: 'Advanced Organic Spectroscopy & Analytical Laboratory Manual',
          subtext: 'Peer-Reviewed Monograph',
          callout: 'Institutional Dispatch',
        },
        {
          id: 'f-5',
          badge: 'NEW ARRIVALS',
          text: 'Behavioral Macroeconomics & Dynamic Stochastic Modeling',
          subtext: 'National Curriculum Approved',
          callout: 'Available in Print',
        },
      ];
    }

    // Ensure content is visually long enough to easily span across 4K displays without gaps
    let expanded = [...baseList];
    while (expanded.length < 8) {
      expanded = [...expanded, ...baseList];
    }
    return expanded;
  }, [books]);

  // Renders a single publication badge item
  const renderItem = (item: TickerItem, key: string) => (
    <div
      key={key}
      onClick={() => item.book && onSelectBook?.(item.book)}
      className={`flex items-center gap-2.5 mx-3 sm:mx-4 px-3.5 py-1 rounded-full bg-[#242220] hover:bg-[#2D2A27] border border-[#3D3934] transition-all shrink-0 ${
        item.book ? 'cursor-pointer hover:border-[#EED97A]/80 group' : ''
      }`}
    >
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EED97A] text-[#181716] shrink-0">
        {item.badge}
      </span>
      <span className="font-serif font-semibold text-xs text-[#F5F2EB] group-hover:text-[#FAF2BA] transition-colors truncate max-w-xs sm:max-w-md shrink-0">
        {item.text}
      </span>
      {item.subtext && (
        <span className="text-stone-300 text-[10px] hidden md:inline font-normal shrink-0">
          — {item.subtext}
        </span>
      )}
      {item.callout && (
        <span className="text-[10px] font-bold text-[#181716] bg-[#FAF2BA] px-2 py-0.5 rounded-full border border-[#EED97A]/60 shrink-0">
          {item.callout}
        </span>
      )}
      {item.book && (
        <ChevronRight className="w-3 h-3 text-[#EED97A] group-hover:translate-x-0.5 transition-transform shrink-0" />
      )}
    </div>
  );

  return (
    <div className="bg-[#181716] border-y border-[#2E2B27] text-white py-2.5 select-none overflow-hidden relative shadow-inner flex items-center">
      {/* Left Static Announcement Pill */}
      <div className="relative z-30 bg-[#181716] pl-4 sm:pl-6 pr-4 py-1 flex items-center gap-2.5 border-r border-[#2E2B27] shadow-xl shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EED97A] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EED97A]" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#EED97A] whitespace-nowrap flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#EED97A]" />
          <span>Latest Dispatches</span>
        </span>
      </div>

      {/* True Infinite Marquee Viewport */}
      <div className="flex-1 overflow-hidden relative w-full">
        <div className="animate-infinite-ticker">
          {/* Group 1 */}
          <div className="flex items-center shrink-0">
            {displayItems.map((item, idx) => renderItem(item, `g1-${item.id}-${idx}`))}
          </div>

          {/* Group 2 (Exact identical copy ensuring -50% translation matches seamlessly) */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {displayItems.map((item, idx) => renderItem(item, `g2-${item.id}-${idx}`))}
          </div>
        </div>
      </div>
    </div>
  );
};
