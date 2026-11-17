import React from 'react';
import { DotcomLogoLoader } from './DotcomLogoLoader';

export interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  isFullScreen?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  transparent?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Advancing Scholarly Knowledge',
  subtext = 'Dotcom Publications Editorial System',
  isFullScreen = true,
  theme = 'light',
  transparent = false,
}) => {
  const containerBg = transparent
    ? 'bg-transparent'
    : theme === 'dark'
    ? 'bg-[#181817]'
    : 'bg-[#FAF8F2]/95 backdrop-blur-sm';

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <DotcomLogoLoader size={200} theme={theme} showBrandText={false} />

      <div className="mt-5 space-y-1">
        <h3
          className={`font-serif font-bold text-sm sm:text-base tracking-tight ${
            theme === 'dark' ? 'text-[#FAF8F2]' : 'text-charcoal-900'
          }`}
        >
          {message}
        </h3>
        {subtext && (
          <p
            className={`text-xs uppercase tracking-widest font-semibold ${
              theme === 'dark' ? 'text-stone-400' : 'text-editorial-burgundy-700'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>

      {/* Minimalist Progress Pulse Indicator */}
      <div className="w-28 h-0.5 bg-stone-200/80 rounded-full mt-6 overflow-hidden">
        <div className="w-full h-full bg-[#F5C842] origin-left animate-pulse" />
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${containerBg}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`w-full min-h-[300px] flex items-center justify-center ${containerBg}`}>
      {content}
    </div>
  );
};
