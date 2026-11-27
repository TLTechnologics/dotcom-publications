import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { AuthorsPage } from './pages/AuthorsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PublishersPage } from './pages/PublishersPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { LandingPageManager } from './pages/LandingPageManager';
import { SettingsPage } from './pages/SettingsPage';
import { OrdersPage } from './pages/OrdersPage';
import { UsersPage } from './pages/UsersPage';

import { BookFormModal } from './components/books/BookFormModal';
import { BookPreviewModal } from './components/books/BookPreviewModal';
import { AuthorFormModal } from './components/authors/AuthorFormModal';
import { CategoryFormModal } from './components/categories/CategoryFormModal';
import { CustomerStorefront } from './components/customer/CustomerStorefront';
import { PortalLoginPage } from './components/auth/PortalLoginPage';

import { NavigationTab, DashboardStats, Book, Author, Category, Publisher, LandingPageContent, SiteSettings, User } from './types';
import { api } from './services/api';
import { ToastProvider, useToast } from './context/ToastContext';

const VALID_ADMIN_TABS: NavigationTab[] = [
  'dashboard',
  'orders',
  'books',
  'authors',
  'categories',
  'publishers',
  'media',
  'landing',
  'users',
  'settings',
];

// Helper to normalize current browser URL path
function getNormalizedPath(): string {
  if (typeof window === 'undefined') return '/';
  const p = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  return p || '/';
}

export function DotcomPlatform() {
  const toast = useToast();

  // 1. Browser URL Routing: '/', '/books', '/cart', '/checkout', '/admin', '/admin/dashboard', etc.
  const [currentPath, setCurrentPath] = useState<string>(getNormalizedPath);

  // 2. Current Authenticated Admin User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Navigation listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const [requestedPath, requestedHash] = path.split('#', 2);
    const cleanPath = requestedPath.toLowerCase().replace(/\/+$/, '') || '/';
    const destination = `${cleanPath}${requestedHash ? `#${requestedHash}` : ''}`;
    if (`${window.location.pathname}${window.location.hash}` !== destination) {
      window.history.pushState({}, '', destination);
    }
    setCurrentPath(cleanPath);
    window.requestAnimationFrame(() => {
      if (requestedHash) {
        document.getElementById(decodeURIComponent(requestedHash))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // Verify authentication token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getAuthToken();
      if (!token) {
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }
      try {
        const user = await api.getProfile();
        setCurrentUser(user);
      } catch (err) {
        // Token invalid or expired
        api.clearAuthToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Shared Core Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Global Quick Action Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Determine if path belongs to the Admin Portal namespace
  const isAdminPath =
    currentPath === '/admin' ||
    currentPath.startsWith('/admin/') ||
    currentPath === '/super-admin' ||
    currentPath.startsWith('/super-admin/');

  const loadAllData = async () => {
    const shouldLoadAdminData = isAdminPath && !!currentUser;
    try {
      const [
        statsData,
        authorsData,
        categoriesData,
        publishersData,
        booksData,
        landingData,
        settingsData,
        ordersData,
        usersData,
      ] = await Promise.all([
        shouldLoadAdminData ? api.getDashboardStats().catch(() => null) : Promise.resolve(null),
        api.getAuthors().catch(() => []),
        api.getCategories(false).catch(() => []),
        api.getPublishers().catch(() => []),
        api.getBooks({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
        api.getLandingPage().catch(() => null),
        api.getSettings().catch(() => null),
        shouldLoadAdminData ? api.getOrders().catch(() => []) : Promise.resolve([]),
        shouldLoadAdminData ? api.getUsers().catch(() => []) : Promise.resolve([]),
      ]);

      if (statsData) setStats(statsData);
      setAuthors(authorsData || []);
      setCategories(categoriesData || []);
      setPublishers(publishersData || []);
      setBooksList(booksData?.items || []);
      if (landingData) setLandingContent(landingData);
      if (settingsData) setSiteSettings(settingsData);
      if (ordersData) {
        const count = Array.isArray(ordersData) ? ordersData.length : (ordersData as any)?.total || 0;
        setOrdersCount(count);
      }
      if (usersData) setUsersCount(Array.isArray(usersData) ? usersData.length : 0);
    } catch (err: any) {
      console.warn('Backend data load note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser, isAdminPath]);

  // When authenticated, auto-redirect /admin or /super-admin to /admin/dashboard
  useEffect(() => {
    if (currentUser && (currentPath === '/admin' || currentPath === '/super-admin')) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, currentPath]);

  // Extract active tab from URL (/admin/:tab)
  const pathSegments = currentPath.split('/').filter(Boolean);
  let activeTab: NavigationTab = 'dashboard';
  if (pathSegments.length > 1) {
    const sub = pathSegments[1] as NavigationTab;
    if (VALID_ADMIN_TABS.includes(sub)) {
      activeTab = sub;
    }
  }

  const handleTabChange = (tab: NavigationTab) => {
    navigate('/admin/' + tab);
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (query && activeTab !== 'books') {
      navigate('/admin/books');
    }
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    toast.success('Authenticated Successfully', 'Welcome back, Admin.');
    navigate('/admin/dashboard');
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Continue client cleanup
    }
    api.clearAuthToken();
    setCurrentUser(null);
    toast.info('Signed Out', 'Administrator session ended.');
    navigate('/admin');
  };

  // ==========================================
  // ROUTE: Admin Portal (/admin or /admin/*)
  // ==========================================
  if (isAdminPath) {
    if (authChecking) {
      return (
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#651C32] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#82777A] font-medium">Verifying administrator credentials...</p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <PortalLoginPage
          onSuccess={handleLoginSuccess}
          onNavigate={navigate}
        />
      );
    }

    return (
      <Layout
        currentUser={currentUser}
        currentTab={activeTab}
        onTabChange={handleTabChange}
        counts={{
          books: stats?.total_books ?? booksList.length,
          authors: stats?.total_authors ?? authors.length,
          categories: stats?.total_categories ?? categories.length,
          publishers: stats?.total_publishers ?? publishers.length,
          orders: ordersCount,
          users: usersCount,
        }}
        searchQuery={globalSearch}
        onSearchChange={handleGlobalSearch}
        onLogoutClick={handleLogout}
        onSwitchToCustomer={() => navigate('/')}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            loading={loading}
            onNavigate={handleTabChange}
            onAddBook={() => setIsAddBookOpen(true)}
            onAddAuthor={() => setIsAddAuthorOpen(true)}
            onAddCategory={() => setIsAddCategoryOpen(true)}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {activeTab === 'orders' && <OrdersPage />}

        {activeTab === 'books' && (
          <BooksPage
            authors={authors}
            categories={categories}
            publishers={publishers}
            onRefreshStats={loadAllData}
            onRefreshAuthors={loadAllData}
            onRefreshCategories={loadAllData}
            onRefreshPublishers={loadAllData}
          />
        )}

        {activeTab === 'authors' && (
          <AuthorsPage
            onRefreshStats={loadAllData}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesPage onRefreshStats={loadAllData} />
        )}

        {activeTab === 'publishers' && (
          <PublishersPage onRefreshStats={loadAllData} />
        )}

        {activeTab === 'media' && <MediaLibraryPage />}

        {activeTab === 'landing' && (
          <LandingPageManager books={booksList} categories={categories} />
        )}

        {activeTab === 'users' && (
          <UsersPage
            currentUser={currentUser}
            onRefreshCounts={loadAllData}
          />
        )}

        {activeTab === 'settings' && <SettingsPage />}

        {/* Global Quick Modals */}
        <BookFormModal
          isOpen={isAddBookOpen}
          onClose={() => setIsAddBookOpen(false)}
          onSuccess={() => {
            loadAllData();
            setIsAddBookOpen(false);
          }}
          authors={authors}
          categories={categories}
          publishers={publishers}
          onRefreshAuthors={loadAllData}
          onRefreshCategories={loadAllData}
          onRefreshPublishers={loadAllData}
        />

        <AuthorFormModal
          isOpen={isAddAuthorOpen}
          onClose={() => setIsAddAuthorOpen(false)}
          onSuccess={() => {
            loadAllData();
            setIsAddAuthorOpen(false);
          }}
        />

        <CategoryFormModal
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onSuccess={() => {
            loadAllData();
            setIsAddCategoryOpen(false);
          }}
          parentCategories={categories}
        />

        <BookPreviewModal
          book={previewBook}
          isOpen={!!previewBook}
          onClose={() => setPreviewBook(null)}
        />
      </Layout>
    );
  }

  // ==========================================
  // ROUTE: Customer Storefront (Default at '/')
  // ==========================================
  return (
    <CustomerStorefront
      books={booksList}
      categories={categories}
      landingContent={landingContent}
      siteSettings={siteSettings}
      onNavigate={navigate}
      isAdminLoggedIn={!!currentUser}
      currentPath={currentPath}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DotcomPlatform />
    </ToastProvider>
  );
}
