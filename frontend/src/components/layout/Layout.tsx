import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NavigationTab, User } from '../../types';

interface LayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
  currentUser?: User | null;
  userRole?: string;
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
  userRole = 'super-admin',
  counts,
  searchQuery,
  onSearchChange,
  onLogoutClick,
  onSwitchToCustomer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF8F3] font-sans text-[#292326] w-full max-w-full overflow-x-hidden">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onTabChange={onTabChange}
          onLogoutClick={onLogoutClick}
          onSwitchToCustomer={onSwitchToCustomer}
          currentUser={currentUser}
          userRole={userRole}
          counts={counts}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#431322]/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#651C32] z-10 shadow-elevated">
            <Sidebar
              currentTab={currentTab}
              onTabChange={(tab) => {
                onTabChange(tab);
                setMobileMenuOpen(false);
              }}
              onLogoutClick={onLogoutClick}
              onSwitchToCustomer={onSwitchToCustomer}
              currentUser={currentUser}
              userRole={userRole}
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
          userRole={userRole}
        />

        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
