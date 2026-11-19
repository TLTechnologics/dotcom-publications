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
  UserCheck
} from 'lucide-react';
import { NavigationTab, User } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onLogoutClick?: () => void;
  onSwitchToCustomer?: () => void;
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onLogoutClick,
  onSwitchToCustomer,
  currentUser,
  userRole = 'super-admin',
  counts,
}) => {
  const role = currentUser?.role || userRole;

  const allNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
    allowedRoles?: string[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['super-admin', 'content_manager', 'order_manager', 'viewer'],
    },
    {
      id: 'orders',
      label: 'Customer Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: counts?.orders,
      allowedRoles: ['super-admin', 'order_manager', 'viewer'],
    },
    {
      id: 'books',
      label: 'Books Catalogue',
      icon: <BookOpen className="w-4 h-4" />,
      count: counts?.books,
      allowedRoles: ['super-admin', 'content_manager', 'viewer'],
    },
    {
      id: 'authors',
      label: 'Faculty & Authors',
      icon: <Users className="w-4 h-4" />,
      count: counts?.authors,
      allowedRoles: ['super-admin', 'content_manager', 'viewer'],
    },
    {
      id: 'categories',
      label: 'Disciplines & Categories',
      icon: <FolderTree className="w-4 h-4" />,
      count: counts?.categories,
      allowedRoles: ['super-admin', 'content_manager', 'viewer'],
    },
    {
      id: 'publishers',
      label: 'Publisher Imprints',
      icon: <Building2 className="w-4 h-4" />,
      count: counts?.publishers,
      allowedRoles: ['super-admin', 'content_manager', 'viewer'],
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: <ImageIcon className="w-4 h-4" />,
      allowedRoles: ['super-admin', 'content_manager', 'viewer'],
    },
    {
      id: 'landing',
      label: 'Landing Page CMS',
      icon: <Globe className="w-4 h-4" />,
      allowedRoles: ['super-admin', 'content_manager'],
    },
    {
      id: 'users',
      label: 'Admin Accounts',
      icon: <UserCheck className="w-4 h-4" />,
      count: counts?.users,
      allowedRoles: ['super-admin'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['super-admin'],
    },
  ];

  const navItems = allNavItems.filter((item) =>
    !item.allowedRoles || item.allowedRoles.includes(role)
  );

  const roleLabel = (r: string) => {
    switch (r) {
      case 'super-admin':
        return 'Super Administrator';
      case 'content_manager':
        return 'Content Manager';
      case 'order_manager':
        return 'Order Manager';
      case 'viewer':
        return 'Auditor (Viewer)';
      default:
        return 'Administrator';
    }
  };

  const userInitials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DP';

  return (
    <aside className="w-64 bg-[#651C32] text-white flex flex-col h-screen select-none shrink-0 sticky top-0 border-r border-[#431322] shadow-elevated">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#431322]/80 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white border border-[#F6E7A8]/60 overflow-hidden shadow-md shrink-0 p-0.5">
          <img
            src="/logo.jpg"
            alt="Dotcom Publications"
            className="w-full h-full object-cover rounded-[9px]"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-serif font-bold text-white text-base leading-tight truncate tracking-tight">
            Dotcom Publications
          </h1>
          <p className="text-[10px] uppercase font-semibold text-[#F6E7A8] tracking-widest mt-0.5">
            Admin Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#F6E7A8]/70 uppercase tracking-widest">
          Publishing Core
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#F6E7A8] text-[#431322] font-semibold shadow-pastel'
                  : 'text-white/85 hover:bg-[#431322]/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span
                  className={`transition-colors ${
                    isActive
                      ? 'text-[#431322]'
                      : 'text-[#F6E7A8]/80 group-hover:text-[#F6E7A8]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#651C32] text-white'
                      : 'bg-[#431322] text-[#F6E7A8]'
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
            onClick={onSwitchToCustomer}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F3] text-[#431322] hover:bg-[#FFF6D9] transition-all shadow-subtle border border-[#F6E7A8]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" />
            <span>Customer Storefront</span>
          </button>
        </div>
      )}

      {/* Sidebar Footer — User Identity and Sign Out */}
      <div className="p-3 border-t border-[#431322] bg-[#431322]/60">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#431322] transition-colors group">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F3] border-2 border-[#F6E7A8] flex items-center justify-center text-[#651C32] font-serif font-bold text-xs shadow-sm">
              {userInitials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#477A58] border-2 border-[#651C32] rounded-full" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => role === 'super-admin' && onTabChange('users')}
          >
            <p className="text-xs font-semibold text-white truncate group-hover:text-[#F6E7A8] transition-colors">
              {currentUser?.full_name || 'Administrator'}
            </p>
            <p className="text-[10px] text-[#F6E7A8]/80 truncate">
              {roleLabel(role)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogoutClick?.();
            }}
            title="Sign Out of Portal"
            className="p-1.5 rounded-lg text-white/70 hover:text-[#B94B4B] hover:bg-[#300D18] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
