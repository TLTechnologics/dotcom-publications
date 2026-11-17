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
  onOpenLoaderPreview?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Publishing Executive Dashboard',
    subtitle: 'Real-time catalogue statistics, active titles, and recent editorial actions',
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
  onOpenLoaderPreview,
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
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/90 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title / Breadcrumbs */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-charcoal-600 hover:bg-stone-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-charcoal-400">
            <span>Dotcom Publications</span>
            <span>/</span>
            <span className="text-editorial-burgundy-700 font-semibold capitalize">
              {currentTab}
            </span>
          </div>

          <h2 className="text-base font-serif font-bold text-charcoal-900 tracking-tight leading-tight mt-0.5">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search catalogue..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-full border border-stone-200 bg-paper-50 focus:bg-white text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
        </div>

        {/* Animated Loading Screen Preview Trigger */}
        {onOpenLoaderPreview && (
          <button
            onClick={onOpenLoaderPreview}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-colors"
            title="Preview Animated Emblem & Loading Screen"
          >
            <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
            <span className="hidden sm:inline text-[11px] font-semibold">Emblem Loader</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-charcoal-600 hover:bg-stone-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-editorial-burgundy-600 rounded-full" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-stone-200 shadow-elevated p-3 z-50 text-left animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
                <span className="text-xs font-semibold text-charcoal-900">Notifications</span>
                <span className="text-[10px] text-editorial-burgundy-700 hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-xl hover:bg-paper-50 text-xs transition-colors">
                    <p className="font-medium text-charcoal-800">{n.title}</p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-charcoal-400 mt-1 block">{n.time}</span>
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
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-300 transition-colors"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-charcoal-800 hidden sm:inline">
              Dr. Finch
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-stone-200 shadow-elevated py-1.5 z-50 text-xs"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3 py-2 border-b border-stone-100">
                <p className="font-semibold text-charcoal-900">Dr. Alistair Finch</p>
                <p className="text-[10px] text-charcoal-500">director@dotcompublications.com</p>
              </div>
              <button
                onClick={() => onTabChange('settings')}
                className="w-full text-left px-3 py-2 text-charcoal-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-charcoal-400" /> Account Settings
              </button>
              <button
                onClick={() => onTabChange('landing')}
                className="w-full text-left px-3 py-2 text-charcoal-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" /> View Public Preview
              </button>
              <div className="border-t border-stone-100 my-1" />
              <button
                onClick={() => alert('Demo Session Active: To switch administrator account, adjust backend permissions.')}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" /> Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
