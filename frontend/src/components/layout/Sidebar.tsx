import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderTree,
  Building2,
  Image as ImageIcon,
  Globe,
  Settings,
  LogOut,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onLogoutClick?: () => void;
  counts?: {
    books?: number;
    authors?: number;
    categories?: number;
    publishers?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onLogoutClick,
  counts,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'books', label: 'Books Catalogue', icon: <BookOpen className="w-4 h-4" />, count: counts?.books },
    { id: 'authors', label: 'Faculty & Authors', icon: <Users className="w-4 h-4" />, count: counts?.authors },
    { id: 'categories', label: 'Disciplines & Categories', icon: <FolderTree className="w-4 h-4" />, count: counts?.categories },
    { id: 'publishers', label: 'Publisher Imprints', icon: <Building2 className="w-4 h-4" />, count: counts?.publishers },
    { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'landing', label: 'Landing Page CMS', icon: <Globe className="w-4 h-4" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-paper-50 border-r border-stone-200/90 flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-200/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-editorial-burgundy-700 text-white flex items-center justify-center shadow-subtle shrink-0">
          <BookMarked className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-serif font-bold text-charcoal-900 text-base leading-tight truncate tracking-tight">
            Dotcom Publications
          </h1>
          <p className="text-[10px] uppercase font-semibold text-editorial-burgundy-700 tracking-wider mt-0.5">
            Phase 01 • Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-charcoal-400 uppercase tracking-widest">
          Publishing Core
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-editorial-burgundy-700 text-white shadow-subtle'
                  : 'text-charcoal-700 hover:bg-stone-200/60 hover:text-charcoal-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span className={`${isActive ? 'text-white' : 'text-charcoal-500 group-hover:text-charcoal-800'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-editorial-burgundy-800 text-white/90' : 'bg-stone-200 text-charcoal-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System info note */}
      <div className="mx-3 mb-2 p-2.5 rounded-xl bg-editorial-burgundy-50 border border-editorial-burgundy-100 text-[11px] text-editorial-burgundy-900">
        <p className="font-semibold text-editorial-burgundy-900">TL Technologics</p>
        <p className="text-[10px] text-editorial-burgundy-700 mt-0.5">Commercial Publishing Platform v1.0</p>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-stone-200/90 bg-white/50">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer group">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-9 h-9 rounded-full object-cover border border-stone-300"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0" onClick={() => onTabChange('settings')}>
            <p className="text-xs font-semibold text-charcoal-900 truncate">Dr. Alistair Finch</p>
            <p className="text-[10px] text-charcoal-500 truncate">Editorial Director</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogoutClick?.();
            }}
            title="Account Options / Sign Out"
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
