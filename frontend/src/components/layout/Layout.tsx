import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NavigationTab } from '../../types';

interface LayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
  counts?: {
    books?: number;
    authors?: number;
    categories?: number;
    publishers?: number;
  };
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onLogoutClick?: () => void;
  onOpenLoaderPreview?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  counts,
  searchQuery,
  onSearchChange,
  onLogoutClick,
  onOpenLoaderPreview,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper-100 font-sans text-charcoal-800">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onTabChange={onTabChange}
          onLogoutClick={onLogoutClick}
          counts={counts}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10">
            <Sidebar
              currentTab={currentTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                setMobileMenuOpen(false);
              }}
              onLogoutClick={onLogoutClick}
              counts={counts}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          currentTab={currentTab}
          onTabChange={onTabChange}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenLoaderPreview={onOpenLoaderPreview}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
