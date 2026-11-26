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
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  UserCheck,
  X
} from 'lucide-react';
import { NavigationTab, User } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onLogoutClick?: () => void;
  onSwitchToCustomer?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  currentUser?: User | null;
  counts?: {
    books?: number;
    authors?: number;
    categories?: number;
    publishers?: number;
    orders?: number;
    users?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onLogoutClick,
  onSwitchToCustomer,
  onClose,
  isMobile = false,
  currentUser,
  counts,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Customer Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: counts?.orders,
    },
    {
      id: 'books',
      label: 'Books Catalogue',
      icon: <BookOpen className="w-4 h-4" />,
      count: counts?.books,
    },
    {
      id: 'authors',
      label: 'Faculty & Authors',
      icon: <Users className="w-4 h-4" />,
      count: counts?.authors,
    },
    {
      id: 'categories',
      label: 'Disciplines & Categories',
      icon: <FolderTree className="w-4 h-4" />,
      count: counts?.categories,
    },
    {
      id: 'publishers',
      label: 'Publisher Imprints',
      icon: <Building2 className="w-4 h-4" />,
      count: counts?.publishers,
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'landing',
      label: 'Landing Page CMS',
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Admin Accounts',
      icon: <UserCheck className="w-4 h-4" />,
      count: counts?.users,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const userInitials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <aside
      className={`${
        isMobile ? 'w-full h-full' : 'w-64 h-screen sticky top-0 shrink-0'
      } bg-white text-[#172033] flex flex-col select-none border-r border-[#DCE4EF] shadow-elevated`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#DCE4EF] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#F6E7A8]/60 overflow-hidden shadow-md shrink-0 p-0.5">
            <img
              src="/logo.jpg"
              alt="Dotcom Publications"
              className="w-full h-full object-cover rounded-[9px]"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-sans font-bold text-[#172033] text-base leading-tight truncate tracking-tight">
              Dotcom Publications
            </h1>
            <p className="text-[10px] font-semibold text-[#65728A] mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Mobile Drawer Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden touch-target rounded-xl text-white/80 hover:text-white hover:bg-[#431322] transition-colors p-2"
            aria-label="Close Navigation Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#65728A]">
          Publishing Core
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose?.();
              }}
              className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group active:scale-[0.98] ${
                isActive
                  ? 'bg-[#EAF2FF] text-[#173B87] font-semibold'
                  : 'text-[#526079] hover:bg-[#F4F7FB] hover:text-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span
                  className={`transition-colors shrink-0 ${
                    isActive
                      ? 'text-[#2457C5]'
                      : 'text-[#8190A8] group-hover:text-[#2457C5]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#2457C5] text-white'
                      : 'bg-[#F4F7FB] text-[#526079]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storefront Switch Button */}
      {onSwitchToCustomer && (
        <div className="px-3 mb-2">
          <button
            onClick={() => {
              onSwitchToCustomer();
              onClose?.();
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#EAF2FF] text-[#173B87] hover:bg-[#DCE9FF] active:scale-[0.98] transition-all border border-[#DCE4EF]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" />
            <span>Customer Storefront</span>
          </button>
        </div>
      )}

      {/* Sidebar Footer — User Identity and Sign Out */}
      <div className="p-3 border-t border-[#DCE4EF] bg-[#F8FAFD]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#431322] transition-colors group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#EAF2FF] border border-[#DCE4EF] flex items-center justify-center text-[#2457C5] font-sans font-bold text-xs">
              {userInitials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#477A58] border-2 border-[#651C32] rounded-full" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              onTabChange('settings');
              onClose?.();
            }}
          >
            <p className="text-xs font-semibold text-white truncate group-hover:text-[#F6E7A8] transition-colors">
              {currentUser?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-[#F6E7A8]/80 truncate">
              Admin
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogoutClick?.();
              onClose?.();
            }}
            title="Sign Out of Portal"
            className="touch-target p-2 rounded-lg text-white/70 hover:text-[#B94B4B] hover:bg-[#300D18] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
