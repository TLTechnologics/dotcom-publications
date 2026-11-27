import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  User as UserIcon,
  Sliders,
  LogOut,
  Users,
  ShieldCheck,
  Check
} from 'lucide-react';
import { NavigationTab, User, NotificationItem } from '../../types';
import { api } from '../../services/api';

interface TopNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onMobileMenuToggle?: () => void;
  onOpenPreview?: () => void;
  onSwitchToCustomer?: () => void;
  onLogoutClick?: () => void;
  currentUser?: User | null;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Publishing dashboard',
    subtitle: 'Real-time catalogue statistics, active titles, and recent editorial actions',
  },
  orders: {
    title: 'Customer orders',
    subtitle: 'Track customer purchases, fulfillment status, and delivery details',
  },
  books: {
    title: 'Book catalogue',
    subtitle: 'Manage titles, authors, pricing, ISBNs, and publication statuses',
  },
  authors: {
    title: 'Authors',
    subtitle: 'Profiles, institutional affiliations, bibliographies, and authored volumes',
  },
  categories: {
    title: 'Categories and subjects',
    subtitle: 'Organize academic knowledge structures, taxonomy, and curriculum areas',
  },
  publishers: {
    title: 'Publishers',
    subtitle: 'Manage co-publishing partners, imprints, addresses, and contacts',
  },
  media: {
    title: 'Media library',
    subtitle: 'High-resolution book covers, author portraits, and editorial marketing assets',
  },
  landing: {
    title: 'Landing page',
    subtitle: 'Configure hero banners, featured titles, and public website showcase modules',
  },
  settings: {
    title: 'System settings',
    subtitle: 'Global publishing house metadata, currency rules, and infrastructure parameters',
  },
  users: {
    title: 'Admin accounts and access',
    subtitle: 'Manage staff credentials, assigned operational roles, and system permissions',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  onMobileMenuToggle,
  onOpenPreview,
  onSwitchToCustomer,
  onLogoutClick,
  currentUser,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(10);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s background check
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    if (notif.link?.includes('orders')) {
      onTabChange('orders');
    } else if (notif.link?.includes('books')) {
      onTabChange('books');
    }
    setShowNotifications(false);
  };

  const currentInfo = TAB_TITLES[currentTab] || {
    title: 'Admin portal',
    subtitle: 'Dotcom Publications',
  };

  const roleDisplayName = () => 'Admin';

  const userInitials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <header className="bg-white border-b border-[#EAE3DE] sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-none">
      {/* Left: Mobile Toggle & Title / Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden touch-target p-2 rounded-md text-[#292326] hover:bg-[#FFF6D9] border border-[#EAE3DE] transition-colors shrink-0 active:scale-95"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#82777A]">
            <span className="truncate">Dotcom Publications</span>
            <span>/</span>
            <span className="text-[#651C32] font-semibold capitalize truncate">
              {currentTab}
            </span>
          </div>

          <h2 className="text-xs sm:text-base font-serif font-bold text-[#292326] tracking-tight leading-tight mt-0.5 truncate max-w-[180px] sm:max-w-md">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Search + Storefront link + Notifications + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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

        {/* Switch to Customer storefront Button */}
        {onSwitchToCustomer && (
          <button
            onClick={onSwitchToCustomer}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-[#173B87] bg-[#EAF2FF] hover:bg-[#DCE9FF] border border-[#DCE4EF] transition-all min-h-[36px] sm:min-h-0"
            title="Open storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" />
            <span className="hidden sm:inline text-[11px]">Storefront</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="touch-target p-2 rounded-full text-[#292326] hover:bg-[#FFF6D9] relative transition-colors border border-transparent hover:border-[#EAE3DE]"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#651C32] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white border border-[#EAE3DE] shadow-lg p-3 z-50 text-left animate-in fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-2 px-1">
                <span className="text-xs font-semibold text-[#292326]">
                  Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#651C32] hover:underline cursor-pointer font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#82777A] text-center py-4">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2.5 rounded-md text-xs transition-colors cursor-pointer border ${
                        !n.is_read
                          ? 'bg-[#FFF6D9]/50 border-[#F6E7A8] hover:bg-[#FFF6D9]'
                          : 'hover:bg-[#FAF8F3] border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-[#292326] text-[11px] leading-tight">
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#651C32] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#82777A] mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-[#82777A]/80 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-1.5 py-1 rounded-full border border-[#EAE3DE] bg-[#FAF8F3] hover:border-[#651C32] transition-colors min-h-[36px]"
            aria-label="Admin profile"
          >
            <div className="w-6 h-6 rounded-full bg-[#651C32] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {userInitials}
            </div>
            <span className="text-xs font-semibold text-[#292326] hidden sm:inline max-w-[100px] truncate">
              {currentUser?.full_name || 'Admin'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#82777A]" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 sm:w-60 max-w-[calc(100vw-2rem)] rounded-lg bg-white border border-[#EAE3DE] shadow-lg py-1.5 z-50 text-xs animate-in fade-in"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-[#EAE3DE] bg-[#FAF8F3]">
                <p className="font-semibold text-[#292326] text-xs truncate">
                  {currentUser?.full_name || 'Admin'}
                </p>
                <p className="text-[10px] font-medium text-[#651C32] mt-0.5">
                  Admin
                </p>
                <p className="text-[9px] text-[#82777A] truncate">
                  {currentUser?.email || 'admin@dotcompublications.com'}
                </p>
              </div>

              {onSwitchToCustomer && (
                <button
                  onClick={onSwitchToCustomer}
                  className="w-full text-left px-3.5 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors font-medium min-h-[40px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#651C32]" /> View storefront
                </button>
              )}

              <button
                onClick={() => onTabChange('users')}
                className="w-full text-left px-3.5 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors min-h-[40px]"
              >
                <Users className="w-3.5 h-3.5 text-[#651C32]" /> Admin accounts
              </button>

              <button
                onClick={() => onTabChange('orders')}
                className="w-full text-left px-3.5 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors min-h-[40px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#651C32]" /> Customer orders
              </button>

              <button
                onClick={() => onTabChange('settings')}
                className="w-full text-left px-3.5 py-2 text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322] flex items-center gap-2 transition-colors min-h-[40px]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#651C32]" /> System settings
              </button>

              <div className="border-t border-[#EAE3DE] my-1" />

              {/* CRITICAL FIX: Logout Button properly invokes onLogoutClick to purge session */}
              <button
                onClick={() => {
                  if (onLogoutClick) {
                    onLogoutClick();
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 text-[#B94B4B] hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors min-h-[40px]"
              >
                <LogOut className="w-3.5 h-3.5 text-[#B94B4B]" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
