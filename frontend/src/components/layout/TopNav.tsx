import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  User,
  Sliders,
  LogOut,
  Sun
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface TopNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onMobileMenuToggle?: () => void;
  onOpenPreview?: () => void;
  onSwitchToCustomer?: () => void;
  userRole?: 'admin' | 'super-admin';
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Publishing Executive Dashboard',
    subtitle: 'Real-time catalogue statistics, active titles, and recent editorial actions',
  },
  orders: {
    title: 'Customer Book Orders',
    subtitle: 'Track customer purchases, fulfillment status, and delivery details',
  },
  books: {
    title: 'Books & Monograph Catalogue',
    subtitle: 'Manage titles, authors, pricing, ISBNs, and publication statuses',
  },
  authors: {
    title: 'Academic Faculty & Authors',
    subtitle: 'Profiles, institutional affiliations, bibliographies, and authored volumes',
  },
  categories: {
    title: 'Disciplines & Subject Categories',
    subtitle: 'Organize academic knowledge structures, taxonomy, and curriculum areas',
  },
  publishers: {
    title: 'Publisher Imprints & Presses',
    subtitle: 'Manage co-publishing partners, imprints, addresses, and contacts',
  },
  media: {
    title: 'Centralized Media Library',
    subtitle: 'High-resolution book covers, author portraits, and editorial marketing assets',
  },
  landing: {
    title: 'Landing Page CMS',
    subtitle: 'Configure hero banners, featured titles, and public website showcase modules',
  },
  settings: {
    title: 'System & Publisher Settings',
    subtitle: 'Global publishing house metadata, currency rules, and infrastructure parameters',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  onMobileMenuToggle,
  onOpenPreview,
  onSwitchToCustomer,
  userRole = 'super-admin',
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'New Monograph Published', desc: 'Principles of Modern Deep Learning is now live', time: '10m ago' },
    { id: 2, title: 'Pricing Updated', desc: 'Macroeconomic Modeling discounted rate adjusted', time: '2h ago' },
    { id: 3, title: 'Draft Review Required', desc: 'Contemporary Behavioral Econometrics awaiting ISBN', time: '1d ago' },
  ];

  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'Admin Portal',
    subtitle: 'Dotcom Publications',
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#EAE3DE] sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-subtle">
      {/* Left: Mobile Toggle & Title / Breadcrumbs */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-[#292326] hover:bg-[#FFF6D9]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#82777A]">
            <span>Dotcom Publications</span>
            <span>/</span>
            <span className="text-[#651C32] font-semibold capitalize">
              {currentTab}
            </span>
          </div>

          <h2 className="text-base font-serif font-bold text-[#292326] tracking-tight leading-tight mt-0.5">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Search + Emblem Loader + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search catalogue..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#82777A] absolute left-3 top-2.5" />
        </div>

        {/* Switch to Customer Storefront Button */}
        {onSwitchToCustomer && (
          <button
            onClick={onSwitchToCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#431322] bg-[#F6E7A8] hover:bg-[#FFF6D9] border border-[#F6E7A8] transition-all shadow-subtle"
            title="Switch to Customer Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" />
            <span className="hidden sm:inline text-[11px]">Storefront</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-[#292326] hover:bg-[#FFF6D9] relative transition-colors border border-transparent hover:border-[#EAE3DE]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#651C32] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#EAE3DE] shadow-elevated p-3 z-50 text-left animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-2 px-1">
                <span className="text-xs font-semibold text-[#292326]">Notifications</span>
                <span className="text-[10px] text-[#651C32] hover:underline cursor-pointer font-medium">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl hover:bg-[#FFF6D9]/50 text-xs transition-colors border border-transparent hover:border-[#F6E7A8]/50">
                    <p className="font-semibold text-[#292326]">{n.title}</p>
                    <p className="text-[11px] text-[#82777A] mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-[#82777A]/70 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-[#EAE3DE] bg-[#FAF8F3] hover:border-[#651C32] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#651C32] text-white flex items-center justify-center text-[10px] font-bold">
              TL
            </div>
            <span className="text-xs font-semibold text-[#292326] hidden sm:inline">
              TL Technologics
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#82777A]" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EAE3DE] shadow-elevated py-1.5 z-50 text-xs animate-in fade-in"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-[#EAE3DE] bg-[#FAF8F3]/60">
                <p className="font-semibold text-[#292326]">TL Technologics</p>
                <p className="text-[10px] text-[#82777A]">
                  {userRole === 'super-admin' ? 'Super Administrator' : 'Publisher Administrator'}
                </p>
              </div>
              {onSwitchToCustomer && (
                <button
                  onClick={onSwitchToCustomer}
                  className="w-full text-left px-3 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" /> View Storefront
                </button>
              )}
              <button
                onClick={() => onTabChange('orders')}
                className="w-full text-left px-3 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#651C32]" /> Customer Orders
              </button>
              <button
                onClick={() => onTabChange('settings')}
                className="w-full text-left px-3 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[#651C32]" /> Account Settings
              </button>
              <div className="border-t border-[#EAE3DE] my-1" />
              <button
                onClick={() => {
                  if (onSwitchToCustomer) onSwitchToCustomer();
                }}
                className="w-full text-left px-3 py-2 text-[#B94B4B] hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-[#B94B4B]" /> Exit Admin Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
