import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Book, LandingPageContent, SiteSettings } from '../../types';
import { HeroPrintCanvas, ContourChaptersCanvas } from './EditorialCanvases';
import { EditorialTicker } from './EditorialTicker';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  CheckCircle2,
  ChevronDown,
  Plus,
  Minus,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
  Lock
} from 'lucide-react';
import { Button } from '../ui/Button';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface ScrollChoreographyProps {
  books: Book[];
  landingContent?: LandingPageContent | null;
  siteSettings?: SiteSettings | null;
  onOpenReader: (book: Book) => void;
  onOpenDetails: (book: Book) => void;
  onAddToCart: (book: Book) => void;
}

// Word-atom splitting helper for editorial typography
function splitWords(text: string, baseDelayMs = 0, stepMs = 38): React.ReactNode[] {
  const words = text.split(/\s+/);
  return words.map((word, i) => (
    <React.Fragment key={i}>
      <span
        className="word-atom"
        style={{ '--d': `${baseDelayMs + i * stepMs}ms` } as React.CSSProperties}
      >
        {word}
      </span>
      {i < words.length - 1 ? ' ' : ''}
    </React.Fragment>
  ));
}

// Institutional FAQ items matching reference Experience C
const EDITORIAL_FAQS = [
  {
    q: 'How do academic faculties and university departments request inspection copies?',
    a: 'Faculty members and department heads can submit inspection and adoption requests directly through our editorial desk or by contacting adoptions@dotcompublications.com. Digital specimen review copies are made available immediately via our interactive 3D digital reader, followed by physical desk copies dispatch upon institutional verification.'
  },
  {
    q: 'Are all Dotcom Publications monographs peer-reviewed and accredited?',
    a: 'Yes. Every title in our monograph and university textbook series undergoes a rigorous double-blind peer review process conducted by senior academic referees and subject matter specialists from accredited higher education institutions across India and internationally.'
  },
  {
    q: 'What institutional discounts and procurement terms are available for libraries?',
    a: 'We provide structured institutional bulk tiers (15% to 35% discount) for university central libraries, departmental holdings, and consortium purchases, complete with GST invoice compliance, library MARC records, and complimentary institutional delivery.'
  },
  {
    q: 'How does the interactive 3D physical book preview function?',
    a: 'Our proprietary page-flipping book preview faithfully renders physical book dimensions, realistic dual-page spread folding, natural page drag physics, and table-of-contents navigation, allowing scholars and students to examine typesetting and chapter excerpts prior to physical acquisition.'
  },
  {
    q: 'What are the standard delivery timelines for pan-India dispatches?',
    a: 'All orders are dispatched within 24 to 48 business hours via insured express logistics. Metros and university campus towns typically receive shipments within 2 to 4 business days, complete with real-time consignment tracking notifications.'
  }
];

export const ScrollChoreography: React.FC<ScrollChoreographyProps> = ({
  books,
  landingContent,
  siteSettings,
  onOpenReader,
  onOpenDetails,
  onAddToCart,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Dynamic CMS Hero Text parsing
  const heroHeading = (landingContent?.hero_heading || 'KNOWLEDGE BEYOND PAGES').trim();
  const headingParts = heroHeading.split(/\s+/);
  const midpoint = Math.ceil(headingParts.length / 2);
  const heroWord1 = headingParts.slice(0, midpoint).join(' ') || 'KNOWLEDGE';
  const heroWord2 = headingParts.slice(midpoint).join(' ') || 'BEYOND PAGES';

  // Section Container Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const manifestoOverlayRef = useRef<HTMLDivElement>(null);
  const manifestoScaleRef = useRef<HTMLDivElement>(null);

  // Experience A: Gallery Refs
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryInnerRef = useRef<HTMLDivElement>(null);
  const galleryFadeOverlayRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const galleryProgressBarRef = useRef<HTMLDivElement>(null);

  // Experience B: Artifact Refs
  const artifactRef = useRef<HTMLDivElement>(null);
  const artifactCopyRef = useRef<HTMLDivElement>(null);
  const artifactCardRef = useRef<HTMLDivElement>(null);
  const perforationRef = useRef<HTMLDivElement>(null);
  const artifactMeterRef = useRef<HTMLDivElement>(null);
  const cue0Ref = useRef<HTMLDivElement>(null);
  const cue1Ref = useRef<HTMLDivElement>(null);
  const cue2Ref = useRef<HTMLDivElement>(null);
  const cue3Ref = useRef<HTMLDivElement>(null);
  const [artifactPhase, setArtifactPhase] = useState<number>(0);

  // Experience C: FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqRef = useRef<HTMLDivElement>(null);

  // Experience D: Pricing Table Ref
  const pricingRef = useRef<HTMLDivElement>(null);

  // Experience E: Final Editorial Section Refs
  const chaptersRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const ch0Ref = useRef<HTMLDivElement>(null);
  const ch1Ref = useRef<HTMLDivElement>(null);
  const ch2Ref = useRef<HTMLDivElement>(null);

  // Featured book for Artifact
  const featuredBook = useMemo(() => {
    return books.find((b) => b.is_featured) || books[0] || null;
  }, [books]);

  // Phase status strings for Artifact
  const statusMessages = [
    'STATUS: CURRICULUM SYLLABUS SPECIFIED',
    'STATUS: PEER-REVIEW CITATION INDICES VERIFIED',
    'STATUS: ARCHIVAL SMYTH-SEWN BINDING INSPECTED',
    'STATUS: ARCHIVAL SPECIMEN AUTHENTICATED FOR DISPATCH',
  ];

  // GSAP Context & ScrollTrigger Architecture
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ctx: gsap.Context;
    let rafId: number;

    // Wait for layout to settle before initializing triggers
    rafId = requestAnimationFrame(() => {
      ctx = gsap.context((self) => {
        const isDesktop = window.innerWidth >= 768;

        // ====================================================================
        // 1. HERO SECTION (Smooth lift & exit to Manifesto - No blank space)
        // ====================================================================
        if (heroRef.current && heroInnerRef.current) {
          gsap.to(heroInnerRef.current, {
            y: -70,
            opacity: 0.2,
            scale: 0.96,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        }

        // ====================================================================
        // 2. MANIFESTO SECTION (Pinned bottom-to-top wipe reveal)
        // ====================================================================
        if (manifestoRef.current && manifestoOverlayRef.current) {
          const manifestoTl = gsap.timeline({
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: 'top top',
              end: '+=110%',
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
            },
          });

          // Bottom to top wipe reveal via clip-path
          manifestoTl.fromTo(
            manifestoOverlayRef.current,
            { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
            {
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
              ease: 'power2.inOut',
            }
          );

          if (manifestoScaleRef.current) {
            manifestoTl.fromTo(
              manifestoScaleRef.current,
              { scale: 0.95 },
              { scale: 1.0, ease: 'power2.out' },
              0
            );
          }
        }

        // ====================================================================
        // 3. EXPERIENCE A: HORIZONTAL PRODUCT GALLERY
        // ====================================================================
        if (galleryRef.current && galleryTrackRef.current) {
          const getOverflow = () => {
            if (!galleryTrackRef.current) return 0;
            // Width of track minus window width + margin to finish cleanly on last card
            return Math.max(0, galleryTrackRef.current.scrollWidth - window.innerWidth + 120);
          };

          if (isDesktop) {
            // Generous scroll distance ensures cards move at an unhurried, luxurious pace,
            // with a dedicated hold phase and a seamless cinematic exit transition into Artifact
            const scrollDistance = () => getOverflow() + window.innerHeight * 2.2;

            const galleryTl = gsap.timeline({
              scrollTrigger: {
                trigger: galleryRef.current,
                start: 'top top',
                end: () => `+=${scrollDistance()}`,
                pin: true,
                scrub: 1.5,
                invalidateOnRefresh: true,
                anticipatePin: 1,
              },
            });

            // Phase 1: Smooth horizontal card slide (0 to 7.0s)
            galleryTl.to(
              galleryTrackRef.current,
              {
                x: () => -getOverflow(),
                ease: 'none',
                duration: 7,
              },
              0
            );

            // Bottom progress bar fills accurately alongside the cards
            if (galleryProgressBarRef.current) {
              galleryTl.fromTo(
                galleryProgressBarRef.current,
                { scaleX: 0 },
                { scaleX: 1, ease: 'none', transformOrigin: 'left center', duration: 7 },
                0
              );
            }

            // Phase 2: Comfort hold at final card (7.0 to 8.2s)
            // Allows scholars/visitors to examine the final book without sudden unpinning
            galleryTl.to({}, { duration: 1.2 }, 7);

            // Phase 3: Seamless cinematic handoff to Stage 4 Artifact (8.2 to 10.0s)
            // Gallery content gently lifts and softens, while a deep charcoal veil blends into the artifact chamber
            if (galleryInnerRef.current) {
              galleryTl.to(
                galleryInnerRef.current,
                {
                  y: -40,
                  scale: 0.96,
                  opacity: 0.15,
                  ease: 'power2.inOut',
                  duration: 1.8,
                },
                8.2
              );
            }

            if (galleryFadeOverlayRef.current) {
              galleryTl.to(
                galleryFadeOverlayRef.current,
                {
                  opacity: 1,
                  ease: 'power2.inOut',
                  duration: 1.8,
                },
                8.2
              );
            }
          }
        }

        // ====================================================================
        // 4. EXPERIENCE B: DARK PUBLICATION ARTIFACT
        // ====================================================================
        if (artifactRef.current && artifactCardRef.current) {
          if (isDesktop) {
            const artifactTl = gsap.timeline({
              scrollTrigger: {
                trigger: artifactRef.current,
                start: 'top top',
                end: () => `+=${window.innerHeight * 2.8}`,
                pin: true,
                scrub: 1.5,
                anticipatePin: 1,
                onUpdate: (st) => {
                  const p = st.progress;
                  // Balanced, generous distribution across 4 verification phases:
                  // p: 0.00 - 0.24 -> Phase 0: Curriculum Syllabus Specified
                  // p: 0.24 - 0.50 -> Phase 1: Peer-Review Citation Indices Verified
                  // p: 0.50 - 0.76 -> Phase 2: Archival Smyth-Sewn Binding Inspected
                  // p: 0.76 - 1.00 -> Phase 3: Archival Specimen Authenticated
                  let phase = 0;
                  if (p >= 0.76) phase = 3;
                  else if (p >= 0.50) phase = 2;
                  else if (p >= 0.24) phase = 1;
                  setArtifactPhase(phase);
                },
              },
            });

            // 1. Cinematic entrance sequence (0 to 2.2s):
            // Left editorial headline and copy float into crystal-clear focus
            if (artifactCopyRef.current) {
              artifactTl.fromTo(
                artifactCopyRef.current,
                { opacity: 0, y: 45 },
                { opacity: 1, y: 0, ease: 'power2.out', duration: 2.2 },
                0
              );
            }

            // Artifact card elevates with tactile physical presence
            artifactTl.fromTo(
              artifactCardRef.current,
              { scale: 0.90, y: 55, opacity: 0 },
              { scale: 1.0, y: 0, opacity: 1, ease: 'power2.out', duration: 2.2 },
              0
            );

            // 2. Perforation tear line animates smoothly across the specimen proof (2.2 to 8.4s)
            if (perforationRef.current) {
              artifactTl.fromTo(
                perforationRef.current,
                { scaleX: 0 },
                { scaleX: 1, ease: 'none', transformOrigin: 'left center', duration: 6.2 },
                2.2
              );
            }

            // 3. Status progress meter fills steadily across inspection phases
            if (artifactMeterRef.current) {
              artifactTl.fromTo(
                artifactMeterRef.current,
                { scaleX: 0 },
                { scaleX: 1, ease: 'none', transformOrigin: 'left center', duration: 6.2 },
                2.2
              );
            }

            // 4. Sequential verification cue highlights with deliberate pacing
            if (cue1Ref.current) {
              artifactTl.fromTo(
                cue1Ref.current,
                { opacity: 0.4, x: 0 },
                { opacity: 1.0, x: 6, ease: 'power2.out', duration: 0.8 },
                2.4
              );
            }

            if (cue2Ref.current) {
              artifactTl.fromTo(
                cue2Ref.current,
                { opacity: 0.4, x: 0 },
                { opacity: 1.0, x: 6, ease: 'power2.out', duration: 0.8 },
                4.8
              );
            }

            if (cue3Ref.current) {
              artifactTl.fromTo(
                cue3Ref.current,
                { opacity: 0.4, x: 0 },
                { opacity: 1.0, x: 6, ease: 'power2.out', duration: 0.8 },
                7.2
              );
              // Highlight scale on authentication completion
              artifactTl.to(
                artifactCardRef.current,
                { scale: 1.025, ease: 'power2.out', duration: 0.8 },
                7.2
              );
            }

            // 5. Settling hold at fully authenticated specimen (8.4 to 10.0s)
            artifactTl.to({}, { duration: 1.6 }, 8.4);
          } else {
            // On mobile devices: Show all verified cues clearly without pin locking
            setArtifactPhase(3);
          }
        }

        // ====================================================================
        // 5. EXPERIENCE C: FAQ TRANSITION REVEAL
        // ====================================================================
        if (faqRef.current) {
          gsap.from(faqRef.current.querySelectorAll('.faq-editorial-item'), {
            opacity: 0,
            y: 20,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: faqRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });
        }

        // ====================================================================
        // 6. EXPERIENCE D: PRICING TABLE ROW REVEAL
        // ====================================================================
        if (pricingRef.current) {
          gsap.from(pricingRef.current.querySelectorAll('.pricing-row'), {
            opacity: 0,
            x: -20,
            stagger: 0.06,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: pricingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          });
        }

        // ====================================================================
        // 7. EXPERIENCE E: FINAL EDITORIAL SECTION (3 Chapters Pinned Transition)
        // ====================================================================
        if (chaptersRef.current) {
          if (isDesktop) {
            const chaptersTl = gsap.timeline({
              scrollTrigger: {
                trigger: chaptersRef.current,
                start: 'top top',
                end: '+=120%',
                pin: true,
                scrub: 1.2,
                anticipatePin: 1,
                onUpdate: (st) => {
                  const p = st.progress;
                  const active = Math.min(2, Math.floor(p * 3));
                  setActiveChapter(active);
                },
              },
            });

            // Chapter 1 active initially (progress 0 -> 0.33)
            // Chapter 2 activates at 0.33 -> 0.66
            // Chapter 3 activates at 0.66 -> 1.0
            chaptersTl.to({}, { duration: 1 }); // placeholder for smooth timeline scrub
          }
        }
      }, rootRef);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, [books]);

  return (
    <div ref={rootRef} className="relative w-full overflow-hidden bg-[#F7F7F5] text-[#222321]">
      {/* ====================================================================== */}
      {/* 1. HERO SECTION: CINEMATIC TYPOGRAPHIC HERO                            */}
      {/* ====================================================================== */}
      <section
        ref={heroRef}
        className="relative bg-[#F1F0EC] text-[#222321] selection:bg-[#D8D6CF] selection:text-[#222321] min-h-[calc(100vh-72px)] flex flex-col justify-between p-6 sm:p-10 border-b border-[#E3E2DD] overflow-hidden"
      >
        {/* Generative Editorial Print Canvas */}
        <HeroPrintCanvas />

        {/* Hero Top Notice */}
        <div className="relative z-20 flex items-center justify-between text-xs font-semibold text-[#565752]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#777871] animate-ping" />
            <span className="tracking-widest uppercase text-[10px]">
              Dotcom Academic Press • University Monographs
            </span>
          </div>
          <span className="text-[10px] text-[#6F706C] font-mono tracking-wider hidden sm:inline">
            PEER-REVIEWED SERIES / 2026
          </span>
        </div>

        {/* Hero Centered Typographic Composition */}
        <div
          ref={heroInnerRef}
          className="relative z-20 my-auto text-center flex flex-col items-center justify-center pointer-events-none py-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm bg-white border border-[#D8D6CF] text-xs font-semibold text-[#565752] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#777871]" />
            <span>Accredited Higher Education Literature</span>
          </div>

          <h1 className="font-serif font-bold tracking-tight text-[#222321] leading-tight sm:leading-none text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl break-words uppercase select-none max-w-full">
            {splitWords(heroWord1, 0, 42)}
          </h1>
          <h2 className="font-serif font-bold tracking-tight text-[#777871] leading-tight sm:leading-none text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl break-words uppercase mt-2 sm:mt-4 select-none max-w-full">
            {splitWords(heroWord2, 220, 42)}
          </h2>

          <p className="mt-4 sm:mt-8 max-w-xl mx-auto text-xs sm:text-sm text-[#565752] font-normal leading-relaxed px-3 sm:px-4">
            {landingContent?.hero_description || 'Dotcom Publications authors and publishes authoritative pedagogical literature, university textbooks, and scholarly monographs trusted by educational faculties across disciplines.'}
          </p>
        </div>

        {/* Hero Bottom Metadata & Scroll Prompt */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[10px] uppercase tracking-widest text-[#565752] border-t border-[#D8D6CF] pt-4 font-mono text-center sm:text-left">
          <span>Institutional Area • Greater Noida • Delhi NCR</span>
          <div className="flex items-center gap-2 text-[#565752] animate-bounce">
            <span>Scroll to Explore Publications</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#777871]" />
          </div>
          <span>Pan-India Institutional Supply</span>
        </div>
      </section>

      {/* Continuous Animated Editorial Ticker Banner (Transitional ribbon) */}
      <EditorialTicker books={books} onSelectBook={onOpenReader} />

      {/* ====================================================================== */}
      {/* 2. MANIFESTO SECTION: ANIMATED PUBLISHING MANIFESTO                   */}
      {/* ====================================================================== */}
      <section
        ref={manifestoRef}
        className="pinned-stage-container bg-[#FAF9F5] text-[#181716] border-b border-[#EAE3DE] flex items-center justify-center pt-20 px-6 sm:px-12 md:px-20 text-center"
      >
        <div ref={manifestoScaleRef} className="max-w-5xl mx-auto relative select-none py-12">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#FAF2BA] text-[#181716] text-[10px] font-bold uppercase tracking-widest border border-[#EED97A]/80 mb-4 shadow-2xs">
            Dotcom Publications Editorial Manifesto
          </div>

          {/* Base Layer: Muted Architectural Charcoal Text */}
          <div className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-[#D9D3CA] leading-tight tracking-tight">
            EVERY BOOK OPENS A NEW WORLD OF KNOWLEDGE.
          </div>

          {/* Overlay Layer: Full Solid Deep Charcoal Wiped from Bottom-to-Top via GSAP */}
          <div
            ref={manifestoOverlayRef}
            className="absolute inset-0 font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-[#181716] leading-tight tracking-tight pointer-events-none"
            style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}
          >
            EVERY BOOK OPENS A NEW WORLD OF KNOWLEDGE.
          </div>

          <p className="mt-8 text-xs sm:text-sm text-[#524B42] max-w-xl mx-auto font-normal leading-relaxed">
            We curate authoritative monographs and university textbooks that empower independent scholarly discovery, connecting faculty research with the next generation of scholars.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-mono text-[#181716]">
            <span>• PEER-REVIEWED</span>
            <span>• ARCHIVAL BINDING</span>
            <span>• CURRICULUM-ALIGNED</span>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 3. EXPERIENCE A: HORIZONTAL PRODUCT GALLERY                            */}
      {/* ====================================================================== */}
      <section
        ref={galleryRef}
        id="publications-gallery"
        className="pinned-stage-container bg-[#FAF9F5] text-[#181716] border-b border-[#EAE3DE] flex flex-col justify-between pt-24 pb-8 sm:pt-24 sm:pb-10 relative overflow-hidden"
      >
        {/* Seamless Dark Transition Veil to Stage 4 (Artifact) */}
        <div
          ref={galleryFadeOverlayRef}
          className="pointer-events-none absolute inset-0 bg-[#141312] opacity-0 z-30 transition-none"
        />

        <div
          ref={galleryInnerRef}
          className="relative z-20 w-full h-full flex flex-col justify-between"
        >
          {/* Top Header Bar matching Reference */}
          <div className="px-6 sm:px-12 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#181716] tracking-tight">
                OUR PUBLICATIONS
              </h2>
              <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#524B42] uppercase mt-1">
                ACADEMIC COLLECTION / CURRENT EDITION
              </p>
            </div>

            <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#524B42] uppercase hidden sm:flex items-center gap-2">
              <span>SCROLL TO MOVE ALONG THE COLLECTION</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#181716]" />
            </div>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="px-6 sm:hidden text-[11px] font-mono font-bold text-[#524B42] flex items-center gap-1.5 mt-2">
            <span>SWIPE TO BROWSE COLLECTION</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#181716]" />
          </div>

          {/* Horizontal Card Track */}
          <div className="w-full md:overflow-hidden overflow-x-auto touch-scroll-x my-auto py-4 scrollbar-none">
            <div
              ref={galleryTrackRef}
              className="flex items-center gap-5 sm:gap-8 px-6 sm:px-12 w-max"
            >
              {books.map((book) => {
                const authorsText = book.authors?.map((a) => a.name).join(', ') || 'Faculty Authors';
                return (
                  <div
                    key={book.id}
                    onClick={() => onOpenReader(book)}
                    className="w-[260px] xs:w-[280px] sm:w-[320px] md:w-[340px] shrink-0 bg-white rounded-sm border border-[#EAE3DE] overflow-hidden shadow-sm hover:shadow-sm hover:border-[#EED97A] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col"
                  >
                    {/* Book Cover Frame */}
                    <div className="aspect-[3/4] bg-[#F7F5EE] relative overflow-hidden">
                      <img
                        src={book.cover_image || '/covers/computational-mathematics.jpg'}
                        alt={book.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 pointer-events-none"
                      />
                      <div className="absolute top-3 left-3 bg-[#FAF2BA] px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#181716] border border-[#EED97A]/80 shadow-xs">
                        {book.category_name || 'Academic Monograph'}
                      </div>
                      <div className="absolute inset-0 bg-[#181716]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#FAF9F5] text-[#181716] border border-[#EED97A] text-xs font-bold shadow-sm flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#181716]" />
                          <span>Interactive 3D Preview</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Metadata */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-[#524B42] font-semibold block truncate">
                          {authorsText}
                        </span>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-[#181716] group-hover:text-black transition-colors mt-0.5 line-clamp-2 leading-snug">
                          {book.title}
                        </h3>
                        {book.subject && (
                          <p className="text-[11px] text-[#524B42] truncate mt-1">
                            {book.subject}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#EAE3DE] flex items-center justify-between">
                        <div>
                          <span className="font-serif font-bold text-base text-[#181716]">
                            ₹{book.selling_price}
                          </span>
                          {book.mrp > book.selling_price && (
                            <span className="text-xs text-[#6B6358] line-through ml-1.5 font-medium">
                              ₹{book.mrp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetails(book);
                            }}
                            className="min-h-[36px] sm:min-h-0 px-3 py-1.5 rounded-sm border border-[#EAE3DE] text-[11px] font-semibold text-[#181716] hover:bg-[#FAF9F5] transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(book);
                            }}
                            className="min-h-[36px] sm:min-h-0 px-3 py-1.5 rounded-sm bg-[#EED97A] hover:bg-[#F5E288] text-[#181716] text-[11px] font-semibold flex items-center gap-1 border border-[#E5CE68] shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#181716]" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thin Horizontal Progress Indicator Line matching Reference */}
          <div className="px-6 sm:px-12 w-full">
            <div className="w-full h-[2px] bg-[#EAE3DE] relative overflow-hidden">
              <div
                ref={galleryProgressBarRef}
                className="absolute inset-y-0 left-0 w-full bg-[#EED97A]"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#524B42] mt-2 font-mono font-medium">
              <span>01 / FIRST PUBLICATION</span>
              <span>ALL {books.length} TITLES IN CURRENT EDITION</span>
              <span>FINAL MONOGRAPH →</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 4. EXPERIENCE B: DARK PUBLICATION ARTIFACT                              */}
      {/* ====================================================================== */}
      <section
        ref={artifactRef}
        id="publication-artifact"
        className="pinned-stage-container bg-[#141312] text-white border-b border-[#2A2724] flex items-center justify-center pt-24 pb-8 px-6 sm:px-12 md:px-16"
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center py-8">
          {/* Left Column: Animated Headline, Copy & 4 Progressive Cues */}
          <div ref={artifactCopyRef} className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#EED97A] uppercase block mb-1">
                ARCHIVAL SPECIMEN SPECIFICATION
              </span>
              <h2 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[#FAF9F5] leading-[1.1] tracking-tight">
                YOUR NEXT CHAPTER<br />STARTS HERE.
              </h2>
              <p className="text-xs sm:text-sm text-[#E0DCD4] font-normal leading-relaxed mt-3 max-w-lg">
                Nothing sits on a warehouse shelf in static isolation. Every monograph is bound, peer-reviewed, and verified when ordered, with archival paper and curriculum-aligned syllabi.
              </p>
            </div>

            {/* 4 Progressive Information Cues with Left Accent Pip */}
            <div className="space-y-2.5 text-xs">
              <div
                ref={cue0Ref}
                className={`p-3.5 rounded-sm border border-l-4 transition-all duration-300 ${
                  artifactPhase >= 0
                    ? 'bg-[#40383A] border-[#605256] border-l-[#EED97A] text-white'
                    : 'bg-[#2F292B] border-[#493D41] border-l-[#493D41] text-stone-300 opacity-40'
                }`}
              >
                <span className="font-serif font-bold block text-sm">
                  01 / Double-blind peer review by university faculties
                </span>
                <p className="text-[11px] text-stone-200 mt-1 font-normal">
                  Sanctioned against national higher education syllabi and accreditation guidelines.
                </p>
              </div>

              <div
                ref={cue1Ref}
                className={`p-3.5 rounded-sm border border-l-4 transition-all duration-300 ${
                  artifactPhase >= 1
                    ? 'bg-[#40383A] border-[#605256] border-l-[#EED97A] text-white'
                    : 'bg-[#2F292B] border-[#493D41] border-l-[#493D41] text-stone-300 opacity-40'
                }`}
              >
                <span className="font-serif font-bold block text-sm">
                  02 / Archival acid-free paper, Smyth-sewn library binding
                </span>
                <p className="text-[11px] text-stone-200 mt-1 font-normal">
                  Heavy-gauge interior leaves engineered for decades of active research and shelving.
                </p>
              </div>

              <div
                ref={cue2Ref}
                className={`p-3.5 rounded-sm border border-l-4 transition-all duration-300 ${
                  artifactPhase >= 2
                    ? 'bg-[#40383A] border-[#605256] border-l-[#EED97A] text-white'
                    : 'bg-[#2F292B] border-[#493D41] border-l-[#493D41] text-stone-300 opacity-40'
                }`}
              >
                <span className="font-serif font-bold block text-sm">
                  03 / Interactive 3D digital edition & chapter navigation
                </span>
                <p className="text-[11px] text-stone-200 mt-1 font-normal">
                  Natural dual-page spread folding and curriculum problem-set exploration.
                </p>
              </div>

              <div
                ref={cue3Ref}
                className={`p-3.5 rounded-sm border border-l-4 transition-all duration-300 ${
                  artifactPhase >= 3
                    ? 'bg-[#40383A] border-[#605256] border-l-[#EED97A] text-white'
                    : 'bg-[#2F292B] border-[#493D41] border-l-[#493D41] text-stone-300 opacity-40'
                }`}
              >
                <span className="font-serif font-bold block text-sm">
                  04 / Perforated archival specimen proof with verified ISBN
                </span>
                <p className="text-[11px] text-stone-200 mt-1 font-normal">
                  Official bibliographic MARC records and insured express pan-India dispatch.
                </p>
              </div>
            </div>

            {/* Bottom Status & Progress Meter */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#EED97A] mb-1.5 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EED97A] animate-pulse" />
                  {statusMessages[artifactPhase]}
                </span>
                <span className="text-stone-300">PHASE 0{artifactPhase + 1} / 04</span>
              </div>
              <div className="w-full h-1 bg-[#564B4D] rounded-full overflow-hidden">
                <div
                  ref={artifactMeterRef}
                  className="h-full bg-[#EED97A] w-full"
                  style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Large Physical Publication Artifact Proof */}
          <div className="flex justify-center">
            <div
              ref={artifactCardRef}
              className="w-full max-w-md bg-[#FAF9F5] text-[#181716] rounded-sm border-2 border-[#EED97A]/50 p-6 shadow-lg relative overflow-hidden book-paper-texture"
            >
              {/* Perforation Line across Top matching Reference */}
              <div className="relative border-b-2 border-dashed border-[#82777A]/50 pb-3 mb-4 flex items-center justify-between text-[10px] font-mono text-[#524B42]">
                <span>ARCHIVAL SPECIMEN PROOF</span>
                <span className="text-[#181716] font-bold">PERFORATION TEAR-LINE ✂</span>
                <div
                  ref={perforationRef}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EED97A]"
                  style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
                />
              </div>

              {/* Publication Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#524B42] block">
                    Dotcom Academic Press
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#181716] mt-0.5 leading-tight">
                    {featuredBook?.title || 'Foundations of Computational Mathematics'}
                  </h3>
                  <p className="text-xs text-[#524B42] italic mt-0.5 font-medium">
                    {featuredBook?.subtitle || 'An Advanced University Monograph'}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-sm bg-[#181716] text-[#EED97A] flex items-center justify-center shrink-0 p-1.5 shadow-sm border border-[#2E2B27]">
                  <img src="/logo.jpg" alt="Dotcom Logo" className="w-full h-full object-cover rounded-sm" />
                </div>
              </div>

              {/* Book Cover Specimen Frame */}
              <div className="my-4 aspect-[16/9] rounded-sm overflow-hidden bg-[#FAF9F5] border border-[#EAE3DE] shadow-inner relative">
                <img
                  src={featuredBook?.cover_image || '/covers/computational-mathematics.jpg'}
                  alt="Specimen Artwork"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-[11px] font-serif font-medium">
                  <span>Approved for National Higher Education Curricula</span>
                </div>
              </div>

              {/* Monograph Specifications */}
              <div className="space-y-2 text-xs border-t border-[#EAE3DE] pt-3 text-[#181716]">
                <div className="flex justify-between">
                  <span className="text-[#524B42] font-medium">ISBN:</span>
                  <span className="font-mono font-bold text-[#181716]">
                    {featuredBook?.isbn || '978-81-948231-1-1'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#524B42] font-medium">Edition:</span>
                  <span className="font-medium text-[#181716]">{featuredBook?.edition || '1st National Edition (2026)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#524B42] font-medium">Format:</span>
                  <span className="font-bold text-[#181716]">{featuredBook?.book_format || 'Hardbound Monograph'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#524B42] font-medium">Fulfillment:</span>
                  <span className="text-[#2D6640] font-bold">In Stock • Immediate Dispatch</span>
                </div>
              </div>

              {/* Action Button inside Artifact */}
              <div className="mt-5 pt-3 border-t border-[#EAE3DE] flex items-center justify-between gap-3">
                <div>
                  <span className="font-serif font-bold text-lg text-[#181716]">
                    ₹{featuredBook?.selling_price || 495}
                  </span>
                  <span className="text-[10px] text-[#524B42] font-medium block">Free Pan-India Institutional Shipping</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => featuredBook && onOpenReader(featuredBook)}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#181716]" />
                  <span>Launch 3D Preview</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 5. EXPERIENCE C: FAQ SECTION (Minimal Editorial Presentation)          */}
      {/* ====================================================================== */}
      <section
        ref={faqRef}
        id="faq"
        className="bg-[#FAF8F3] text-[#292326] border-b border-[#EAE3DE] py-20 px-6 sm:px-12 md:px-16"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header matching Reference frame 15 */}
          <div className="mb-10">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#524B42] uppercase block mb-1">
              ACADEMIC INQUIRIES & LIBRARY ADOPTIONS
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#292326] tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <div className="w-full h-[1px] bg-[#292326]/20 mt-6" />
          </div>

          {/* Accordion List with Thin Dividers */}
          <div className="space-y-0">
            {EDITORIAL_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="faq-editorial-item border-b border-[#EAE3DE] py-5 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-start justify-between gap-4 focus:outline-none group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif font-bold text-base sm:text-lg text-[#181716] group-hover:text-black transition-colors leading-snug">
                      {faq.q}
                    </span>
                    <span className="text-[#181716] font-mono text-lg shrink-0 mt-0.5">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-[#453F37] font-normal leading-relaxed max-w-3xl animate-in fade-in duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-[#524B42] font-semibold">
            <span>DOTCOM PUBLICATIONS • ADMISSIONS & ADOPTIONS</span>
            <span>ALL INQUIRIES PEER-REVIEWED</span>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 6. EXPERIENCE D: PRICING / PUBLICATION INFORMATION TABLE               */}
      {/* ====================================================================== */}
      <section
        ref={pricingRef}
        id="pricing"
        className="bg-[#FAF8F3] text-[#292326] border-b border-[#EAE3DE] py-20 px-6 sm:px-12 md:px-16"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#524B42] uppercase block mb-1">
              CURRENT EDITION PUBLICATION INDEX
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#292326] tracking-tight">
              INSTITUTIONAL PRICING & EDITIONS
            </h2>
            <div className="w-full h-[1px] bg-[#292326]/20 mt-4" />
          </div>

          {/* Minimal Editorial Table matching Reference frame 20 */}
          <div className="space-y-0 text-xs sm:text-sm">
            {books.slice(0, 6).map((book) => (
              <div
                key={book.id}
                className="pricing-row py-4 border-b border-[#EAE3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FFF6D9]/40 px-2 rounded-sm transition-colors"
              >
                <div className="sm:w-1/2">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#292326] block">
                    {book.title}
                  </span>
                  <span className="text-[11px] text-[#524B42] font-medium block mt-0.5">
                    {book.authors?.map((a) => a.name).join(', ') || 'Faculty Authors'}
                  </span>
                </div>

                <div className="sm:w-1/3 text-[11px] font-mono text-[#524B42] font-medium">
                  <span>{book.book_format || 'Hardbound'} · {book.pages || 480} pages · {book.edition || '1st Edition'}</span>
                </div>

                <div className="text-right font-serif font-bold text-base text-[#181716]">
                  ₹{book.selling_price.toFixed(2)}
                </div>
              </div>
            ))}

            {/* Complete Series Summary Row */}
            <div className="pricing-row py-5 border-b-2 border-[#EED97A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FAF2BA]/40 px-3 rounded-sm mt-2 font-semibold">
              <div className="sm:w-1/2">
                <span className="font-serif font-bold text-base text-[#181716] block">
                  COMPLETE ACADEMIC SERIES (ALL VOLUMES)
                </span>
                <span className="text-[11px] text-[#524B42] block font-medium mt-0.5">
                  Complete departmental library adoption grant package
                </span>
              </div>
              <div className="sm:w-1/3 text-[11px] font-mono text-[#524B42] font-semibold">
                6 Volumes · Full MARC Records Included
              </div>
              <div className="text-right font-serif font-bold text-lg text-[#181716]">
                ₹2,805.00
              </div>
            </div>
          </div>

          {/* Action Buttons below Table matching Reference */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#catalogue"
              className="px-6 py-3 rounded-sm bg-[#EED97A] hover:bg-[#F5E288] text-[#181716] border border-[#E5CE68] text-xs font-bold shadow-sm flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>EXPLORE COMPLETE CATALOGUE</span>
              <ArrowRight className="w-4 h-4 text-[#181716]" />
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-sm bg-white border border-[#EAE3DE] hover:border-[#EED97A] text-[#181716] text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              INSTITUTIONAL BULK PURCHASE
            </a>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 7. EXPERIENCE E: FINAL EDITORIAL SECTION (~22 Contour Lines Canvas)   */}
      {/* ====================================================================== */}
      <section
        ref={chaptersRef}
        id="editorial-chapters"
        className="pinned-stage-container bg-[#FAF8F3] text-[#292326] border-b border-[#EAE3DE] flex flex-col justify-between pt-24 pb-8 px-6 sm:px-12 relative overflow-hidden"
      >
        {/* Background Canvas: 22 Contour Lines */}
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
          <ContourChaptersCanvas />
        </div>

        {/* Typographic Statement matching Reference */}
        <div className="relative z-20 max-w-4xl mx-auto text-center pt-8">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#524B42] uppercase block mb-2">
            THE EDITORIAL MISSION
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-[#181716] leading-[1.1] tracking-tight">
            {landingContent?.about_title ? (
              landingContent.about_title.toUpperCase()
            ) : (
              <>KNOWLEDGE DOES NOT END<br />WHERE THE PAGE DOES.</>
            )}
          </h2>
          {landingContent?.about_description && (
            <p className="mt-4 text-xs sm:text-sm text-[#524B42] max-w-2xl mx-auto leading-relaxed">
              {landingContent.about_description}
            </p>
          )}
        </div>

        {/* Three Publication-Related Content Blocks (Exactly one active at a time) */}
        <div className="relative z-20 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
          {[
            {
              id: 0,
              num: '01',
              title: 'Academic Textbooks',
              body: 'Foundational undergraduate and postgraduate textbooks aligned with national higher education curricula and accredited university syllabi.',
              link: '#catalogue',
            },
            {
              id: 1,
              num: '02',
              title: 'Research & Monographs',
              body: 'Peer-reviewed academic monographs and treatises advancing doctoral and post-doctoral inquiry across scientific, legal, and social disciplines.',
              link: '#catalogue',
            },
            {
              id: 2,
              num: '03',
              title: 'Educational Resources',
              body: 'Comprehensive examination problem sets, digital teaching aids, faculty lecture guides, and accredited laboratory companion manuals.',
              link: '#contact',
            },
          ].map((item) => {
            const isActive = activeChapter === item.id;
            return (
              <div
                key={item.id}
                className={`p-6 rounded-sm border transition-all duration-700 ease-out flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-2 border-[#EED97A] shadow-sm opacity-100 -translate-y-2'
                    : 'bg-white border-[#EAE3DE] opacity-100 md:opacity-35 translate-y-0'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-xs text-[#181716] block mb-2">
                    {item.num} — {item.title.toUpperCase()}
                  </span>
                  <p className="text-xs sm:text-sm text-[#453F37] font-normal leading-relaxed mt-2">
                    {item.body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EAE3DE]">
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#181716] hover:text-[#524B42]"
                  >
                    <span>Explore Discipline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pillar Status Indicator */}
        <div className="relative z-20 flex justify-center items-center gap-2 text-[10px] font-mono text-[#524B42] pb-4 font-semibold">
          <span>ACTIVE PILLAR:</span>
          {['01 TEXTBOOKS', '02 MONOGRAPHS', '03 RESOURCES'].map((label, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-1 rounded-full border transition-all duration-300 ${
                activeChapter === idx
                  ? 'bg-[#EED97A] text-[#181716] border-[#E5CE68] font-bold shadow-xs'
                  : 'bg-white border-[#EAE3DE] text-[#524B42]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
