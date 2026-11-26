import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NavigationTab, User } from '../../types';

interface LayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
  currentUser?: User | null;
  counts?: {
    books?: number;
    authors?: number;
    categories?: number;
    publishers?: number;
    orders?: number;
    users?: number;
  };
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onLogoutClick?: () => void;
  onSwitchToCustomer?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  currentUser,
  counts,
  searchQuery,
  onSearchChange,
  onLogoutClick,
  onSwitchToCustomer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock background scrolling and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] font-sans text-[#222321] w-full max-w-full overflow-x-hidden">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onTabChange={onTabChange}
          onLogoutClick={onLogoutClick}
          onSwitchToCustomer={onSwitchToCustomer}
          currentUser={currentUser}
          counts={counts}
        />
      </div>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Admin Navigation">
          {/* Backdrop with Blur and Fade Animation */}
          <div
            className="fixed inset-0 bg-[#172033]/55 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Slide-In Panel */}
          <div className="relative flex-1 flex flex-col max-w-[280px] sm:max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-300 ease-out h-full">
            <Sidebar
              isMobile={true}
              currentTab={currentTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                setMobileMenuOpen(false);
              }}
              onClose={() => setMobileMenuOpen(false)}
              onLogoutClick={() => {
                setMobileMenuOpen(false);
                onLogoutClick?.();
              }}
              onSwitchToCustomer={() => {
                setMobileMenuOpen(false);
                onSwitchToCustomer?.();
              }}
              currentUser={currentUser}
              counts={counts}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <TopNav
          currentTab={currentTab}
          onTabChange={onTabChange}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSwitchToCustomer={onSwitchToCustomer}
          onLogoutClick={onLogoutClick}
          currentUser={currentUser}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
