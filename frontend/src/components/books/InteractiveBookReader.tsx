import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Book } from '../../types';
import { PageFlip } from 'page-flip';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, Hand, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface InteractiveBookReaderProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
  onViewDetails?: (book: Book) => void;
}

const WORDS_PER_PAGE = 90;
const MAX_SAMPLE_PAGES = 4;

function splitPreviewIntoPages(text: string): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (!words.length) return [];

  const pages: string[] = [];
  for (let index = 0; index < words.length && pages.length < MAX_SAMPLE_PAGES; index += WORDS_PER_PAGE) {
    pages.push(words.slice(index, index + WORDS_PER_PAGE).join(' '));
  }
  return pages;
}

export const InteractiveBookReader: React.FC<InteractiveBookReaderProps> = ({
  book,
  isOpen,
  onClose,
  onAddToCart,
  onViewDetails,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const previewPages = useMemo(
    () => splitPreviewIntoPages(book?.full_description || book?.short_description || ''),
    [book],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentPage(0);
      setTotalPages(0);
      setIsReady(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        pageFlipRef.current?.flipNext('bottom');
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        pageFlipRef.current?.flipPrev('bottom');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !book || !containerRef.current) return;

    const timer = window.setTimeout(() => {
      if (!containerRef.current) return;
      try {
        const pageFlip = new PageFlip(containerRef.current, {
          width: 420,
          height: 580,
          size: 'stretch',
          minWidth: 280,
          maxWidth: 480,
          minHeight: 380,
          maxHeight: 650,
          maxShadowOpacity: 0.65,
          showCover: true,
          mobileScrollSupport: true,
          usePortrait: true,
          startPage: 0,
          drawShadow: true,
          flippingTime: 850,
          useMouseEvents: true,
          swipeDistance: 30,
          clickEventForward: true,
          disableFlipByClick: true,
          showPageCorners: true,
        });
        const pages = containerRef.current.querySelectorAll<HTMLElement>('.st-page');
        if (!pages.length) return;
        pageFlip.loadFromHTML(pages);
        setTotalPages(pageFlip.getPageCount());
        pageFlip.on('flip', (event: { data: number }) => setCurrentPage(event.data));
        pageFlip.on('init', () => setIsReady(true));
        pageFlipRef.current = pageFlip;
        setIsReady(true);
      } catch (error) {
        console.warn('Book preview could not be initialized:', error);
      }
    }, 100);

    return () => {
      window.clearTimeout(timer);
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {
          // Ignore cleanup errors from the page flip engine.
        }
        pageFlipRef.current = null;
      }
    };
  }, [isOpen, book, previewPages]);

  if (!isOpen || !book) return null;

  const authors = book.authors?.map((author) => author.name).join(', ') || 'Dotcom Publications';
  const discountPercent = book.mrp > book.selling_price
    ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#292326]/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white overflow-hidden p-0.5 border border-[#F6E7A8]/50 shadow-md shrink-0">
            <img src="/logo.jpg" alt="Dotcom Publications" className="w-full h-full object-cover rounded-[6px]" />
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-sm tracking-tight block text-[#FFF6D9]">Dotcom Publications</span>
            <span className="text-[10px] text-[#EED97A] uppercase tracking-wider block font-semibold">Book preview</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#181716]/90 border border-[#EED97A]/40 px-3 sm:px-3.5 py-1.5 rounded-full shadow-lg text-[11px] sm:text-xs backdrop-blur-sm">
          <span className="text-[#EED97A] font-bold">
            {currentPage === 0 ? 'Cover' : currentPage >= totalPages - 1 ? 'Preview complete' : `Page ${currentPage} of ${totalPages - 1}`}
          </span>
          <span className="text-stone-400 hidden sm:inline">•</span>
          <span className="text-stone-300 font-mono text-[11px] hidden sm:inline">Drag a corner or swipe to turn</span>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => { onClose(); onViewDetails(book); }}
              className="min-h-[44px] flex items-center justify-center gap-2 rounded-sm bg-[#181716]/90 hover:bg-[#282522] text-white border border-[#EED97A]/40 px-3 transition-colors"
              aria-label={`View details for ${book.title}`}
            >
              <Info className="w-4 h-4 text-[#EED97A]" />
              <span className="hidden sm:inline text-xs font-semibold">Book details</span>
            </button>
          )}
          <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#181716]/90 hover:bg-[#282522] text-white border border-[#EED97A]/40 transition-all shadow-md group" title="Close reader (Esc)" aria-label="Close reader">
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-4xl h-[78vh] sm:h-[82vh] flex items-center justify-center pt-8">
        <button onClick={() => pageFlipRef.current?.flipPrev('bottom')} className="absolute left-1 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#181716]/90 hover:bg-[#282522] text-[#EED97A] border border-[#EED97A]/50 shadow-2xl flex items-center justify-center transition-all z-40" title="Previous page" aria-label="Previous page">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button onClick={() => pageFlipRef.current?.flipNext('bottom')} className="absolute right-1 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#181716]/90 hover:bg-[#282522] text-[#EED97A] border border-[#EED97A]/50 shadow-2xl flex items-center justify-center transition-all z-40" title="Next page" aria-label="Next page">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div ref={containerRef} className="flip-book-container relative w-full h-full flex items-center justify-center" style={{ margin: '0 auto' }}>
          <div className="st-page page-cover bg-[#181716] text-white overflow-hidden shadow-2xl relative flex flex-col justify-between" data-density="hard">
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 bg-gradient-to-r from-[#100F0E] via-[#181716] to-[#242220] border-r border-[#EED97A]/20 z-20 flex flex-col justify-between py-6 items-center">
              <span className="w-1.5 h-6 bg-[#EED97A]/40 rounded-full" />
              <span className="writing-vertical-rl text-[9px] uppercase tracking-widest text-[#EED97A]/80 font-semibold truncate max-h-56 transform rotate-180">{book.title}</span>
              <span className="w-1.5 h-6 bg-[#EED97A]/40 rounded-full" />
            </div>
            <div className="absolute inset-0 pl-8 sm:pl-10 overflow-hidden bg-[#181716] flex flex-col justify-between p-6">
              {book.cover_image ? (
                <img src={book.cover_image} alt={`Cover of ${book.title}`} className="absolute inset-0 w-full h-full object-cover pl-8 sm:pl-10 pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-[#181716] flex flex-col justify-between p-6 pl-12 text-white">
                  <div><span className="text-[10px] uppercase font-bold tracking-widest text-[#EED97A] block">Dotcom Publications</span><h2 className="font-serif font-bold text-xl sm:text-2xl mt-4 leading-tight text-[#FAF9F5]">{book.title}</h2>{book.subtitle && <p className="text-xs text-stone-300 italic mt-2">{book.subtitle}</p>}</div>
                  <div className="pt-4 border-t border-[#EED97A]/30"><p className="text-xs text-[#EED97A] font-semibold">{authors}</p></div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15 pointer-events-none" />
              <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181716]/90 border border-[#EED97A]/60 text-white shadow-xl pointer-events-none animate-corner-hint"><Hand className="w-3.5 h-3.5 text-[#EED97A]" /><span className="text-[11px] font-bold text-[#EED97A]">Drag corner to flip</span></div>
            </div>
          </div>

          <div className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#292326] relative" data-density="soft">
            <div className="absolute top-0 bottom-0 right-0 w-16 page-spine-shadow-right pointer-events-none" />
            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#82777A] uppercase tracking-wider font-semibold"><span>Dotcom Publications</span><span>Book preview</span></div>
            <div className="space-y-4 my-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#181716] block">{book.category_name || book.subject || 'Selected publication'}</span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#181716] leading-tight">{book.title}</h2>
              {book.subtitle && <p className="text-xs text-[#736B5E] italic">{book.subtitle}</p>}
              <p className="text-xs text-[#736B5E] italic">By {authors}</p>
              <div className="space-y-1.5 pt-3 border-t border-stone-200 text-[11px] text-[#181716]">
                {book.publisher_name && <div className="flex justify-between gap-2"><span className="text-[#736B5E]">Publisher</span><span className="font-semibold text-right">{book.publisher_name}</span></div>}
                {book.isbn && <div className="flex justify-between gap-2"><span className="text-[#736B5E]">ISBN</span><span className="font-mono">{book.isbn}</span></div>}
                {book.edition && <div className="flex justify-between gap-2"><span className="text-[#736B5E]">Edition</span><span className="text-right">{book.edition}</span></div>}
                {book.pages && <div className="flex justify-between gap-2"><span className="text-[#736B5E]">Pages</span><span>{book.pages}</span></div>}
                {book.book_format && <div className="flex justify-between gap-2"><span className="text-[#736B5E]">Format</span><span className="text-right">{book.book_format}</span></div>}
              </div>
              <p className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 text-[10px] text-stone-600 leading-relaxed">Read a short preview, then add the complete book to your cart to purchase it.</p>
            </div>
            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">— Book details —</div>
          </div>

          {previewPages.map((pageText, index) => (
            <div key={`${book.id}-preview-${index}`} className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative" data-density="soft">
              <div className={`absolute top-0 bottom-0 ${index % 2 === 0 ? 'left-0 page-spine-shadow-left' : 'right-0 page-spine-shadow-right'} w-16 pointer-events-none`} />
              <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold"><span>{book.title}</span><span>Preview</span></div>
              <div className="my-auto py-5">
                {index === 0 && <h3 className="font-serif font-bold text-sm sm:text-base text-[#181716] mb-4">From the book description</h3>}
                <p className="font-serif text-[13px] sm:text-sm leading-[1.9] text-stone-800">{pageText}</p>
              </div>
              <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">— Preview page {index + 1} —</div>
            </div>
          ))}

          <div className="st-page page-cover bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative shadow-2xl" data-density="hard">
            <div className="absolute top-0 bottom-0 left-0 w-16 page-spine-shadow-left pointer-events-none" />
            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold"><span>Preview complete</span><span>Continue with the book</span></div>
            <div className="my-auto text-center space-y-3.5 py-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF2BA] text-[#181716] border border-[#EED97A] flex items-center justify-center mx-auto shadow-sm"><Bookmark className="w-6 h-6 text-[#181716]" /></div>
              <div><span className="text-[10px] uppercase font-bold tracking-widest text-[#736B5E] block">End of free preview</span><h3 className="font-serif font-bold text-lg sm:text-xl text-[#181716] mt-1">Continue with the complete book</h3><p className="text-xs text-[#736B5E] mt-1 max-w-xs mx-auto">Add it to your cart to purchase the full printed edition.</p></div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 max-w-xs mx-auto shadow-xs">
                <div className="flex items-center justify-center gap-2"><span className="font-serif font-bold text-xl text-[#181716]">₹{book.selling_price.toLocaleString('en-IN')}</span>{book.mrp > book.selling_price && <span className="text-xs text-[#736B5E] line-through">₹{book.mrp.toLocaleString('en-IN')}</span>}{discountPercent > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF2BA] text-[#181716] border border-[#EED97A]">{discountPercent}% OFF</span>}</div>
                <span className="text-[10px] text-[#3A754E] font-semibold block mt-0.5">{book.availability_status === 'out_of_stock' ? 'Currently out of stock' : book.availability_status === 'pre_order' ? 'Available for pre-order' : 'Available to order'}</span>
              </div>
              <div className="space-y-2 max-w-xs mx-auto pt-1">
                <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2 text-xs font-bold" disabled={book.availability_status === 'out_of_stock'} onClick={() => { onAddToCart(book); onClose(); }}>
                  <ShoppingBag className="w-4 h-4 text-[#181716]" /><span>{book.availability_status === 'out_of_stock' ? 'Currently unavailable' : 'Add to cart'}</span>
                </Button>
                {onViewDetails && <button type="button" onClick={() => { onClose(); onViewDetails(book); }} className="w-full text-center text-xs text-[#181716] hover:text-[#736B5E] hover:underline font-semibold">View full book details</button>}
              </div>
            </div>
            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">— End of preview —</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-stone-400 hidden sm:block pointer-events-none">Drag a page corner or swipe left/right to turn · Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> to close</div>
      {!isReady && <span className="sr-only">Loading book preview</span>}
    </div>
  );
};
