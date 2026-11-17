import React from 'react';

export interface DotcomLogoLoaderProps {
  size?: number | string;
  theme?: 'light' | 'dark' | 'auto';
  showBrandText?: boolean;
  statusText?: string;
  className?: string;
}

export const DotcomLogoLoader: React.FC<DotcomLogoLoaderProps> = ({
  size = 180,
  theme = 'auto',
  showBrandText = true,
  statusText,
  className = '',
}) => {
  // Theme stroke colors: dark charcoal for light background, soft warm white for dark background
  const strokeClass =
    theme === 'dark'
      ? 'text-[#FAF8F2]'
      : theme === 'light'
      ? 'text-[#1F1E1D]'
      : 'text-charcoal-800 dark:text-[#FAF8F2]';

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <style>{`
        /* Sunrise and Sunset Animation Cycle: 5.6s infinite loop */
        @keyframes dotcom-sunrise-sunset {
          0% {
            transform: translateY(46px);
            opacity: 0;
          }
          /* Sun emerges smoothly from behind book */
          8% {
            opacity: 0.3;
          }
          20% {
            opacity: 0.9;
          }
          /* Zenith: reaches top position at 40% - 48% */
          40% {
            transform: translateY(0px);
            opacity: 1;
          }
          48% {
            transform: translateY(0px);
            opacity: 1;
          }
          /* Sunset: slowly descends behind book */
          75% {
            opacity: 0.85;
          }
          88% {
            transform: translateY(46px);
            opacity: 0.1;
          }
          95%, 100% {
            transform: translateY(46px);
            opacity: 0;
          }
        }

        /* Progressive sun rays revelation */
        @keyframes dotcom-sun-rays {
          0%, 6% {
            opacity: 0;
            transform: scale(0.65);
          }
          22% {
            opacity: 0.6;
            transform: scale(0.85);
          }
          38%, 50% {
            opacity: 1;
            transform: scale(1);
          }
          70% {
            opacity: 0.7;
            transform: scale(0.88);
          }
          85%, 100% {
            opacity: 0;
            transform: scale(0.65);
          }
        }

        /* Subtle natural flame flicker */
        @keyframes dotcom-flame-flicker {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.96;
            filter: drop-shadow(0 0 2px rgba(245, 200, 66, 0.45));
          }
          25% {
            transform: scale(1.05, 0.96) translateY(-0.5px);
            opacity: 1;
            filter: drop-shadow(0 0 3.5px rgba(245, 200, 66, 0.65));
          }
          50% {
            transform: scale(0.97, 1.04) translateY(0.3px);
            opacity: 0.92;
            filter: drop-shadow(0 0 2px rgba(245, 200, 66, 0.4));
          }
          75% {
            transform: scale(1.03, 0.98) translateY(-0.3px);
            opacity: 0.98;
            filter: drop-shadow(0 0 4px rgba(245, 200, 66, 0.7));
          }
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .dotcom-sun-motion,
          .dotcom-rays-motion,
          .dotcom-flame-motion {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }

        .dotcom-sun-motion {
          animation: dotcom-sunrise-sunset 5.6s cubic-bezier(0.42, 0.0, 0.58, 1.0) infinite;
          transform-origin: 100px 48px;
        }

        .dotcom-rays-motion {
          animation: dotcom-sun-rays 5.6s cubic-bezier(0.42, 0.0, 0.58, 1.0) infinite;
          transform-origin: 100px 48px;
        }

        .dotcom-flame-motion {
          animation: dotcom-flame-flicker 1.4s ease-in-out infinite;
          transform-origin: 100px 88px;
        }
      `}</style>

      {/* SVG Container */}
      <svg
        width={size}
        height={typeof size === 'number' ? (size * 160) / 200 : 'auto'}
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${strokeClass} overflow-visible`}
        role="img"
        aria-label="Dotcom Publications animated emblem: sunrise over open book with candle flame"
      >
        <defs>
          {/* Sky clip path: isolates the sky above the open book so the sun disappears naturally behind pages */}
          <clipPath id="dotcom-sky-clip">
            <path d="M 0,0 L 200,0 L 200,88 C 172,83 140,78 100,94 C 60,78 28,83 0,88 Z" />
          </clipPath>

          {/* Golden Warm Glow for the sun disk and flame */}
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5C842" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. LAYER BEHIND: SUN WITH RAYS (Clipped naturally behind the book contour) */}
        <g clipPath="url(#dotcom-sky-clip)">
          <g className="dotcom-sun-motion">
            {/* Soft Ambient Golden Aura */}
            <circle cx="100" cy="48" r="28" fill="url(#sun-glow)" />

            {/* Sun Rays (Thin, smooth outlines in #F5C842) */}
            <g className="dotcom-rays-motion" stroke="#F5C842" strokeWidth="1.6" strokeLinecap="round">
              {/* Vertical / Horizontal Cardinal Rays */}
              <line x1="100" y1="21" x2="100" y2="13" />
              <line x1="100" y1="75" x2="100" y2="83" />
              <line x1="73" y1="48" x2="65" y2="48" />
              <line x1="127" y1="48" x2="135" y2="48" />

              {/* Diagonal 45-degree Rays */}
              <line x1="81" y1="29" x2="75" y2="23" />
              <line x1="119" y1="29" x2="125" y2="23" />
              <line x1="81" y1="67" x2="75" y2="73" />
              <line x1="119" y1="67" x2="125" y2="73" />

              {/* Intermediary Editorial Rays (subtle, shorter) */}
              <line x1="90" y1="23" x2="87" y2="18" strokeWidth="1.2" opacity="0.8" />
              <line x1="110" y1="23" x2="113" y2="18" strokeWidth="1.2" opacity="0.8" />
              <line x1="75" y1="38" x2="70" y2="36" strokeWidth="1.2" opacity="0.8" />
              <line x1="125" y1="38" x2="130" y2="36" strokeWidth="1.2" opacity="0.8" />
              <line x1="75" y1="58" x2="70" y2="60" strokeWidth="1.2" opacity="0.8" />
              <line x1="125" y1="58" x2="130" y2="60" strokeWidth="1.2" opacity="0.8" />
            </g>

            {/* Sun Circular Outline (Thin, smooth golden stroke) */}
            <circle
              cx="100"
              cy="48"
              r="17"
              stroke="#F5C842"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* 2. STATIONARY OPEN BOOK (Foreground horizon) */}
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Main Top Curved Page Contour */}
          {/* Left Page Top */}
          <path d="M 100,94 C 76,82 48,84 22,90" />
          {/* Right Page Top */}
          <path d="M 100,94 C 124,82 152,84 178,90" />

          {/* Outer Side Book Leaves */}
          <path d="M 22,90 L 22,118" />
          <path d="M 178,90 L 178,118" />

          {/* Bottom Page Waves to Spine Base */}
          <path d="M 22,118 C 48,113 76,115 100,126" />
          <path d="M 178,118 C 152,113 124,115 100,126" />

          {/* Central Book Spine */}
          <line x1="100" y1="94" x2="100" y2="126" strokeWidth="1.8" />

          {/* Realistic Layered Page Spreads (Lower leaf edges) */}
          <path d="M 24,122 C 48,117 76,119 98,129" strokeWidth="1.2" opacity="0.75" />
          <path d="M 176,122 C 152,117 124,119 102,129" strokeWidth="1.2" opacity="0.75" />

          {/* Book Base Stand / Spine Crest */}
          <path d="M 96,128 L 100,132 L 104,128" strokeWidth="1.5" />

          {/* Delicate page lines on left & right spreads */}
          <path d="M 36,99 C 56,95 76,97 92,103" strokeWidth="1.0" opacity="0.45" />
          <path d="M 36,106 C 56,102 76,104 92,110" strokeWidth="1.0" opacity="0.45" />
          <path d="M 164,99 C 144,95 124,97 108,103" strokeWidth="1.0" opacity="0.45" />
          <path d="M 164,106 C 144,102 124,104 108,110" strokeWidth="1.0" opacity="0.45" />
        </g>

        {/* 3. STATIONARY CANDLE & CANDLE HOLDER */}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Classical Dish / Candle Holder Base */}
          <path
            d="M 87,121 C 92,123 108,123 113,121"
            strokeWidth="1.8"
          />
          <path
            d="M 89,121 L 91,125 C 96,127 104,127 109,125 L 111,121"
            strokeWidth="1.4"
          />
          {/* Left Finger Ring Handle */}
          <path
            d="M 87,121 C 82,120 80,123 83,126 C 85,128 89,126 89,124"
            strokeWidth="1.4"
          />

          {/* Candle Pillar */}
          <rect
            x="96.5"
            y="94"
            width="7"
            height="27"
            rx="1.5"
            strokeWidth="1.6"
          />

          {/* Candle Wick */}
          <path d="M 100,94 C 100,91 99.5,89 100,87.5" strokeWidth="1.5" />
        </g>

        {/* 4. GENTLY FLICKERING CANDLE FLAME (#F5C842) */}
        <g className="dotcom-flame-motion">
          {/* Outer Tear Flame Stroke */}
          <path
            d="M 100,72 C 95,80 96,86 98,87.5 C 99.2,88.4 100.8,88.4 102,87.5 C 104,86 105,80 100,72 Z"
            fill="#F5C842"
            fillOpacity="0.25"
            stroke="#F5C842"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Golden Flame Core */}
          <path
            d="M 100,77 C 98,82 98.5,85 99.5,86 C 100,86.4 100.5,86.4 100.5,86 C 101.5,85 102,82 100,77 Z"
            fill="#F5C842"
          />
        </g>
      </svg>

      {/* Optional Minimalist Brand Typography */}
      {showBrandText && (
        <div className="mt-3 text-center">
          <h4
            className={`font-serif font-bold tracking-wider text-xs uppercase leading-tight ${
              theme === 'dark' ? 'text-[#FAF8F2]' : 'text-charcoal-900'
            }`}
          >
            Dotcom Publications
          </h4>
          <p
            className={`text-[9px] uppercase tracking-widest font-semibold mt-0.5 ${
              theme === 'dark' ? 'text-stone-400' : 'text-editorial-burgundy-700'
            }`}
          >
            {statusText || 'Academic & Educational Publishers'}
          </p>
        </div>
      )}
    </div>
  );
};
