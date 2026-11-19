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

import { BookFormModal } from './components/books/BookFormModal';
import { BookPreviewModal } from './components/books/BookPreviewModal';
import { AuthorFormModal } from './components/authors/AuthorFormModal';
import { CategoryFormModal } from './components/categories/CategoryFormModal';
import { CustomerStorefront } from './components/customer/CustomerStorefront';
import { PortalLoginPage } from './components/auth/PortalLoginPage';

import { NavigationTab, DashboardStats, Book, Author, Category, Publisher, LandingPageContent, SiteSettings } from './types';
import { api } from './services/api';
import { ToastProvider, useToast } from './context/ToastContext';

// Helper to normalize current browser URL path
function getNormalizedPath(): string {
  const p = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  if (p === '/admin') return '/admin';
  if (p === '/super-admin' || p === '/superadmin') return '/super-admin';
  return '/';
}

export function DotcomPlatform() {
  const toast = useToast();

  // 1. Browser URL Routing: '/', '/admin', or '/super-admin'
  const [currentPath, setCurrentPath] = useState<string>(getNormalizedPath);

  // 2. Separate Authentication Sessions for Admin & Super Admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dotcom_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  const [isSuperAdminLoggedIn, setIsSuperAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dotcom_superadmin_session') === 'true';
    } catch {
      return false;
    }
  });

  // Navigation listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

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
  const [loading, setLoading] = useState(true);

  // Global Quick Action Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  const loadAllData = async () => {
    try {
      const [statsData, authorsData, categoriesData, publishersData, booksData, landingData, settingsData, ordersData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getAuthors().catch(() => []),
        api.getCategories(false).catch(() => []),
        api.getPublishers().catch(() => []),
        api.getBooks({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
        api.getLandingPage().catch(() => null),
        api.getSettings().catch(() => null),
        api.getOrders().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setAuthors(authorsData || []);
      setCategories(categoriesData || []);
      setPublishers(publishersData || []);
      setBooksList(booksData?.items || []);
      if (landingData) setLandingContent(landingData);
      if (settingsData) setSiteSettings(settingsData);
      if (ordersData) setOrdersCount(ordersData.length);
    } catch (err: any) {
      console.warn('Backend data load note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (query && currentTab !== 'books') {
      setCurrentTab('books');
    }
  };

  // Login handler for Admin
  const handleAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('dotcom_admin_session', 'true');
    } catch {
      // ignore
    }
    toast.success('Admin Authenticated', 'Welcome to Dotcom Publications Publisher Admin Workspace.');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('dotcom_admin_session');
    } catch {
      // ignore
    }
    toast.info('Signed Out', 'Admin workspace session ended.');
  };

  // Login handler for Super Admin
  const handleSuperAdminSuccess = () => {
    setIsSuperAdminLoggedIn(true);
    try {
      localStorage.setItem('dotcom_superadmin_session', 'true');
    } catch {
      // ignore
    }
    toast.success('Super Admin Authenticated', 'Welcome to Dotcom Publications Master Suite (TL Technologics).');
  };

  const handleSuperAdminLogout = () => {
    setIsSuperAdminLoggedIn(false);
    try {
      localStorage.removeItem('dotcom_superadmin_session');
    } catch {
      // ignore
    }
    toast.info('Signed Out', 'Super Admin master session ended.');
  };

  // ==========================================
  // ROUTE 1: /admin (Publisher Administrator)
  // ==========================================
  if (currentPath === '/admin') {
    if (!isAdminLoggedIn) {
      return (
        <PortalLoginPage
          role="admin"
          onSuccess={handleAdminSuccess}
          onNavigate={navigate}
        />
      );
    }

    return (
      <Layout
        userRole="admin"
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        counts={{
          books: stats?.total_books ?? booksList.length,
          authors: stats?.total_authors ?? authors.length,
          categories: stats?.total_categories ?? categories.length,
          publishers: stats?.total_publishers ?? publishers.length,
          orders: ordersCount,
        }}
        searchQuery={globalSearch}
        onSearchChange={handleGlobalSearch}
        onLogoutClick={handleAdminLogout}
        onSwitchToCustomer={() => navigate('/')}
      >
        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            loading={loading}
            onNavigate={setCurrentTab}
            onAddBook={() => setIsAddBookOpen(true)}
            onAddAuthor={() => setIsAddAuthorOpen(true)}
            onAddCategory={() => setIsAddCategoryOpen(true)}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {currentTab === 'orders' && <OrdersPage />}

        {currentTab === 'books' && (
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

        {currentTab === 'authors' && (
          <AuthorsPage
            onRefreshStats={loadAllData}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesPage onRefreshStats={loadAllData} />
        )}

        {currentTab === 'publishers' && (
          <PublishersPage onRefreshStats={loadAllData} />
        )}

        {currentTab === 'media' && <MediaLibraryPage />}

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
  // ROUTE 2: /super-admin (Super Administrator)
  // ==========================================
  if (currentPath === '/super-admin') {
    if (!isSuperAdminLoggedIn) {
      return (
        <PortalLoginPage
          role="super-admin"
          onSuccess={handleSuperAdminSuccess}
          onNavigate={navigate}
        />
      );
    }

    return (
      <Layout
        userRole="super-admin"
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        counts={{
          books: stats?.total_books ?? booksList.length,
          authors: stats?.total_authors ?? authors.length,
          categories: stats?.total_categories ?? categories.length,
          publishers: stats?.total_publishers ?? publishers.length,
          orders: ordersCount,
        }}
        searchQuery={globalSearch}
        onSearchChange={handleGlobalSearch}
        onLogoutClick={handleSuperAdminLogout}
        onSwitchToCustomer={() => navigate('/')}
      >
        {currentTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            loading={loading}
            onNavigate={setCurrentTab}
            onAddBook={() => setIsAddBookOpen(true)}
            onAddAuthor={() => setIsAddAuthorOpen(true)}
            onAddCategory={() => setIsAddCategoryOpen(true)}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {currentTab === 'orders' && <OrdersPage />}

        {currentTab === 'books' && (
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

        {currentTab === 'authors' && (
          <AuthorsPage
            onRefreshStats={loadAllData}
            onViewBook={(book) => setPreviewBook(book)}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesPage onRefreshStats={loadAllData} />
        )}

        {currentTab === 'publishers' && (
          <PublishersPage onRefreshStats={loadAllData} />
        )}

        {currentTab === 'media' && <MediaLibraryPage />}

        {currentTab === 'landing' && (
          <LandingPageManager books={booksList} categories={categories} />
        )}

        {currentTab === 'settings' && <SettingsPage />}

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
  // ROUTE 3: / (Default Customer Storefront Landing Page)
  // ==========================================
  return (
    <CustomerStorefront
      books={booksList}
      categories={categories}
      landingContent={landingContent}
      siteSettings={siteSettings}
      onNavigate={navigate}
      isAdminLoggedIn={isAdminLoggedIn}
      isSuperAdminLoggedIn={isSuperAdminLoggedIn}
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
