import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../types';
import { PageFlip } from 'page-flip';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Bookmark,
  Hand,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';

interface InteractiveBookReaderProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
  onViewDetails?: (book: Book) => void;
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

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(8);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentPage(0);
      setIsReady(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        pageFlipRef.current?.flipNext('bottom');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        pageFlipRef.current?.flipPrev('bottom');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize StPageFlip Engine
  useEffect(() => {
    if (!isOpen || !book || !containerRef.current) return;

    // Small delay to ensure DOM dimensions in modal are measured accurately
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      try {
        const pf = new PageFlip(containerRef.current, {
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
          disableFlipByClick: true, // Prevents body clicks from triggering accidental page flips
          showPageCorners: true,    // Natural corner lift and bend on mouse proximity
        });

        const pages = containerRef.current.querySelectorAll<HTMLElement>('.st-page');
        if (pages.length > 0) {
          pf.loadFromHTML(pages);
          setTotalPages(pf.getPageCount());

          pf.on('flip', (e: any) => {
            setCurrentPage(e.data);
          });

          pf.on('init', () => {
            setIsReady(true);
          });

          pageFlipRef.current = pf;
          setIsReady(true);
        }
      } catch (err) {
        console.warn('StPageFlip initialization note:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
          pageFlipRef.current = null;
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const authorsText = book.authors?.map((a) => a.name).join(', ') || 'Faculty Authors';
  const discountPercent =
    book.mrp && book.mrp > book.selling_price
      ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
      : 0;

  // Split description cleanly into reading paragraphs
  const cleanDescription = book.full_description || book.short_description || '';
  const paragraphs = cleanDescription
    ? cleanDescription.split('\n').filter((p) => p.trim().length > 0)
    : [
        `${book.title} provides a systematic exposition designed for postgraduate scholars and researchers. This authoritative monograph integrates fundamental pedagogical foundations with contemporary academic literature.`,
        `Synthesizing comprehensive curriculum parameters and contemporary peer-reviewed research, this academic publication equips students and instructors with essential analytical frameworks.`,
      ];

  const firstLetter = paragraphs[0]?.charAt(0) || 'T';
  const restOfFirstParagraph = paragraphs[0]?.slice(1) || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#292326]/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white overflow-hidden p-0.5 border border-[#F6E7A8]/50 shadow-md shrink-0">
            <img src="/logo.jpg" alt="Dotcom Publications" className="w-full h-full object-cover rounded-[6px]" />
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-sm tracking-tight block text-[#FFF6D9]">
              Dotcom Publications
            </span>
            <span className="text-[10px] text-[#EED97A] uppercase tracking-wider block font-semibold">
              Interactive 3D Physical Book Reader
            </span>
          </div>
        </div>

        {/* Page / Spread Indicator */}
        <div className="flex items-center gap-2 bg-[#181716]/90 border border-[#EED97A]/40 px-3.5 py-1.5 rounded-full shadow-lg text-xs backdrop-blur-sm">
          <span className="text-[#EED97A] font-bold">
            {currentPage === 0
              ? 'Front Cover'
              : currentPage >= totalPages - 1
              ? 'Complete Edition Preview'
              : `Pages ${currentPage}–${currentPage + 1} of ${totalPages}`}
          </span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-300 font-mono text-[11px] hidden sm:inline">
            Drag corners or swipe to turn
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-[#181716]/90 hover:bg-[#282522] text-white border border-[#EED97A]/40 transition-all shadow-md group hover:scale-105 active:scale-95"
          title="Close Reader (Esc)"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Main 3D Book Stage */}
      <div className="relative w-full max-w-4xl h-[78vh] sm:h-[82vh] flex items-center justify-center pt-8">
        {/* Previous Page Arrow */}
        <button
          onClick={() => pageFlipRef.current?.flipPrev('bottom')}
          className="absolute left-1 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#181716]/90 hover:bg-[#282522] text-[#EED97A] border border-[#EED97A]/50 shadow-2xl flex items-center justify-center transition-all z-40 hover:scale-110 active:scale-95"
          title="Previous Page (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Page Arrow */}
        <button
          onClick={() => pageFlipRef.current?.flipNext('bottom')}
          className="absolute right-1 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#181716]/90 hover:bg-[#282522] text-[#EED97A] border border-[#EED97A]/50 shadow-2xl flex items-center justify-center transition-all z-40 hover:scale-110 active:scale-95"
          title="Next Page (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* StPageFlip Interactive HTML5 Canvas Container */}
        <div
          ref={containerRef}
          className="flip-book-container relative w-full h-full flex items-center justify-center"
          style={{ margin: '0 auto' }}
        >
          {/* ======================================================== */}
          {/* PAGE 0: PHYSICAL HARDCOVER FRONT COVER                   */}
          {/* ======================================================== */}
          <div
            className="st-page page-cover bg-[#181716] text-white overflow-hidden shadow-2xl relative flex flex-col justify-between"
            data-density="hard"
          >
            {/* 3D Physical Spine on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 bg-gradient-to-r from-[#100F0E] via-[#181716] to-[#242220] border-r border-[#EED97A]/20 z-20 flex flex-col justify-between py-6 items-center">
              <span className="w-1.5 h-6 bg-[#EED97A]/40 rounded-full" />
              <span className="writing-vertical-rl text-[9px] uppercase tracking-widest text-[#EED97A]/80 font-semibold truncate max-h-56 transform rotate-180">
                {book.title}
              </span>
              <span className="w-1.5 h-6 bg-[#EED97A]/40 rounded-full" />
            </div>

            {/* Front Cover Image / Artwork */}
            <div className="absolute inset-0 pl-8 sm:pl-10 overflow-hidden bg-[#181716] flex flex-col justify-between p-6">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover pl-8 sm:pl-10 pointer-events-none"
                />
              ) : (
                <div className="absolute inset-0 bg-[#181716] flex flex-col justify-between p-6 pl-12 text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#EED97A] block">
                      Dotcom Academic Imprint
                    </span>
                    <h2 className="font-serif font-bold text-xl sm:text-2xl mt-4 leading-tight text-[#FAF9F5]">
                      {book.title}
                    </h2>
                    {book.subtitle && (
                      <p className="text-xs text-stone-300 italic mt-2">{book.subtitle}</p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-[#EED97A]/30">
                    <p className="text-xs text-[#EED97A] font-semibold">{authorsText}</p>
                    <p className="text-[10px] text-stone-300 mt-0.5">Faculty Monograph Series</p>
                  </div>
                </div>
              )}

              {/* Gloss & Spine Lighting Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15 pointer-events-none" />

              {/* Interactive Corner Hint */}
              <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181716]/90 border border-[#EED97A]/60 text-white shadow-xl backdrop-blur-sm pointer-events-none animate-corner-hint">
                <Hand className="w-3.5 h-3.5 text-[#EED97A]" />
                <span className="text-[11px] font-bold text-[#EED97A]">Drag Corner to Flip</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 1: HALF-TITLE & PUBLICATION IMPRINT (INTERIOR LEFT) */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#292326] relative"
            data-density="soft"
          >
            {/* Left Page Spine Shadow */}
            <div className="absolute top-0 bottom-0 right-0 w-16 page-spine-shadow-right pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#82777A] uppercase tracking-wider font-semibold">
              <span>Dotcom Publications</span>
              <span>ISSN 2841-8902</span>
            </div>

            <div className="space-y-4 my-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#181716] block">
                {book.category_name || 'Academic Monograph Series'}
              </span>

              <h2 className="font-serif font-bold text-base sm:text-lg text-[#181716] leading-tight">
                {book.title}
              </h2>

              <p className="text-xs text-[#736B5E] italic">
                Authored by {authorsText}
              </p>

              {/* Publication Specs */}
              <div className="space-y-1.5 pt-3 border-t border-stone-200 text-[11px] text-[#181716]">
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Imprint:</span>
                  <span className="font-semibold">{book.publisher_name || 'Dotcom Academic Press'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">ISBN:</span>
                  <span className="font-mono font-bold text-[#181716]">{book.isbn || '978-81-948231-0-4'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Edition:</span>
                  <span>{book.edition || '1st National Monograph Edition'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Format:</span>
                  <span>{book.book_format || 'Hardbound / Academic Paperback'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Standard Pages:</span>
                  <span>{book.pages ? `${book.pages} Pages` : '480 Pages (Complete)'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 text-[10px] text-stone-600 leading-relaxed">
                Peer-reviewed text sanctioned for higher education university curricula across participating faculties.
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 1 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 2: CHAPTER 1 / OPENING SYNOPSIS (INTERIOR RIGHT)    */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative"
            data-density="soft"
          >
            {/* Right Page Spine Shadow */}
            <div className="absolute top-0 bottom-0 left-0 w-16 page-spine-shadow-left pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Chapter I</span>
              <span>Introduction & Foundations</span>
            </div>

            <div className="my-auto space-y-3.5">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#181716]">
                Foundational Paradigms & Scope
              </h3>

              {/* Editorial Drop Cap Paragraph */}
              <p className="text-[11px] sm:text-xs leading-relaxed text-stone-800 font-light">
                <span className="float-left text-3xl sm:text-4xl font-serif font-bold text-[#181716] leading-none pr-2 pt-1">
                  {firstLetter}
                </span>
                {restOfFirstParagraph}
              </p>

              {paragraphs[1] && (
                <p className="text-[11px] sm:text-xs leading-relaxed text-stone-800 font-light">
                  {paragraphs[1]}
                </p>
              )}
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 2 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 3: CURRICULAR SCOPE & METHODOLOGY (INTERIOR LEFT)   */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative"
            data-density="soft"
          >
            <div className="absolute top-0 bottom-0 right-0 w-16 page-spine-shadow-right pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Curricular Scope</span>
              <span>Section 2</span>
            </div>

            <div className="space-y-3 my-auto text-xs leading-relaxed text-[#181716]">
              <h3 className="font-serif font-bold text-sm text-[#181716]">
                Academic Methodology & Proofs
              </h3>
              <p className="font-light text-stone-700 leading-relaxed text-[11px] sm:text-xs">
                {paragraphs[1] ||
                  'The pedagogical approach combines empirical verification with established curricular benchmarks, ensuring that postgraduate researchers can independently replicate complex methodological proofs.'}
              </p>
              <p className="font-light text-stone-700 leading-relaxed text-[11px] sm:text-xs">
                {paragraphs[2] ||
                  'Each theoretical segment is accompanied by illustrative university examination case studies and modular problem formulations tailored to modern academic curricula.'}
              </p>

              <div className="border-l-2 border-[#EED97A] pl-3 py-1 bg-[#FAF9F5]/80 italic text-[11px] text-stone-600 rounded-r">
                "Essential textbook recommendation for academic faculty and department libraries."
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 3 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 4: TABLE OF CONTENTS & SYLLABUS UNITS (RIGHT)      */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative"
            data-density="soft"
          >
            <div className="absolute top-0 bottom-0 left-0 w-16 page-spine-shadow-left pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Curriculum Syllabus</span>
              <span>Section 3</span>
            </div>

            <div className="my-auto space-y-2.5">
              <h3 className="font-serif font-bold text-sm text-[#181716]">
                Key Monograph Units
              </h3>

              <div className="space-y-1.5 text-[11px] text-stone-700">
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200 flex items-start gap-2">
                  <span className="font-bold text-[#181716]">Unit I:</span>
                  <span>Theoretical Axioms & Foundational Principles</span>
                </div>
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200 flex items-start gap-2">
                  <span className="font-bold text-[#181716]">Unit II:</span>
                  <span>Empirical Methodologies & Quantitative Formulations</span>
                </div>
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200 flex items-start gap-2">
                  <span className="font-bold text-[#181716]">Unit III:</span>
                  <span>Applied Case Analytics & Faculty Problems</span>
                </div>
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200 flex items-start gap-2">
                  <span className="font-bold text-[#181716]">Unit IV:</span>
                  <span>Contemporary Research Paradigms & Synthesis</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 4 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 5: FACULTY ENDORSEMENTS & ACADEMIC REVIEWS (LEFT)   */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative"
            data-density="soft"
          >
            <div className="absolute top-0 bottom-0 right-0 w-16 page-spine-shadow-right pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Faculty Endorsements</span>
              <span>Editorial Board</span>
            </div>

            <div className="space-y-3 my-auto text-xs text-[#181716]">
              <h3 className="font-serif font-bold text-sm text-[#181716]">
                Scholarly Impact & Reviews
              </h3>
              <p className="text-[11px] text-stone-700 leading-relaxed font-light">
                This peer-reviewed publication has been evaluated and sanctioned for university adoptions across institutions in India and South Asia.
              </p>

              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200">
                  <p className="font-semibold text-[11px] text-[#181716]">Faculty Review Committee</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    "A milestone work presenting rigorous scholarship in an accessible didactic format."
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200">
                  <p className="font-semibold text-[11px] text-[#181716]">Institutional Library Association</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Standard recommended text for university central libraries.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 5 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 6: INSTITUTIONAL ADOPTIONS & METRICS (RIGHT)       */}
          {/* ======================================================== */}
          <div
            className="st-page book-paper-texture p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative"
            data-density="soft"
          >
            <div className="absolute top-0 bottom-0 left-0 w-16 page-spine-shadow-left pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Institutional Adoptions</span>
              <span>Academic Outreach</span>
            </div>

            <div className="space-y-3 my-auto text-xs text-[#181716]">
              <h3 className="font-serif font-bold text-sm text-[#181716]">
                University Adoptions & Metrics
              </h3>
              <p className="text-[11px] text-stone-700 leading-relaxed font-light">
                Prescribed as reference literature across higher education engineering, management, and doctoral faculties.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200">
                  <span className="font-serif font-bold text-sm text-[#181716] block">75+</span>
                  <span className="text-[10px] text-[#736B5E]">Partner Campuses</span>
                </div>
                <div className="p-2 bg-[#FAF9F5] rounded border border-stone-200">
                  <span className="font-serif font-bold text-sm text-[#181716] block">100%</span>
                  <span className="text-[10px] text-[#736B5E]">Peer Reviewed</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-stone-200 text-[10px] text-stone-600 leading-relaxed">
                Specially indexed with chapter-wise problem solutions and instructional slide decks for course coordinators.
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — Page 6 —
            </div>
          </div>

          {/* ======================================================== */}
          {/* PAGE 7: HARDCOVER BACK / "CONTINUE READING" CTA SCREEN  */}
          {/* ======================================================== */}
          <div
            className="st-page page-cover bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between text-[#181716] relative shadow-2xl"
            data-density="hard"
          >
            <div className="absolute top-0 bottom-0 left-0 w-16 page-spine-shadow-left pointer-events-none" />

            <div className="border-b border-stone-300/80 pb-2 flex items-center justify-between text-[10px] text-[#736B5E] uppercase tracking-wider font-semibold">
              <span>Publication Access</span>
              <span>Order Monograph</span>
            </div>

            <div className="my-auto text-center space-y-3.5 py-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF2BA] text-[#181716] border border-[#EED97A] flex items-center justify-center mx-auto shadow-sm">
                <Bookmark className="w-6 h-6 text-[#181716]" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#736B5E] block">
                  Preview Completed
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#181716] mt-0.5">
                  Enjoying this book?
                </h3>
                <p className="text-xs text-[#736B5E] mt-1 max-w-xs mx-auto font-light">
                  Continue reading with the complete edition.
                </p>
              </div>

              {/* Price Block */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 max-w-xs mx-auto shadow-xs">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-serif font-bold text-xl text-[#181716]">
                    ₹{book.selling_price}
                  </span>
                  {book.mrp > book.selling_price && (
                    <span className="text-xs text-[#736B5E] line-through font-normal">
                      ₹{book.mrp}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF2BA] text-[#181716] border border-[#EED97A]">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#3A754E] font-semibold block mt-0.5">
                  In Stock • Free Institutional Shipping
                </span>
              </div>

              {/* Prominent CTA: "Get This Book" */}
              <div className="space-y-2 max-w-xs mx-auto pt-1">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold"
                  onClick={() => {
                    onAddToCart(book);
                    onClose();
                  }}
                >
                  <ShoppingBag className="w-4 h-4 text-[#181716]" />
                  <span>Get This Book</span>
                </Button>

                {onViewDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewDetails(book);
                    }}
                    className="w-full text-center text-xs text-[#181716] hover:text-[#736B5E] hover:underline font-semibold"
                  >
                    View Full Specifications
                  </button>
                )}
              </div>
            </div>

            <div className="text-center text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-2">
              — End of Preview —
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hint on Desktop */}
      <div className="absolute bottom-3 left-0 right-0 text-center text-[11px] text-stone-400 hidden sm:block pointer-events-none">
        Click corners or drag page edges • Swipe left/right on mobile • Press{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> to exit
      </div>
    </div>
  );
};
