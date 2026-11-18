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

import { BookFormModal } from './components/books/BookFormModal';
import { BookPreviewModal } from './components/books/BookPreviewModal';
import { AuthorFormModal } from './components/authors/AuthorFormModal';
import { CategoryFormModal } from './components/categories/CategoryFormModal';

import { NavigationTab, DashboardStats, Book, Author, Category, Publisher } from './types';
import { api } from './services/api';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Modal } from './components/ui/Modal';
import { DotcomLogoLoader } from './components/ui/DotcomLogoLoader';
import { Button } from './components/ui/Button';

export function AdminApp() {
  const toast = useToast();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Shared Core Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [showLoaderModal, setShowLoaderModal] = useState(false);
  const [loaderModalTheme, setLoaderModalTheme] = useState<'light' | 'dark' | 'transparent'>('light');

  // Global Quick Action Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  const loadAllData = async () => {
    const startTime = Date.now();
    try {
      const [statsData, authorsData, categoriesData, publishersData, booksData] = await Promise.all([
        api.getDashboardStats(),
        api.getAuthors(),
        api.getCategories(false),
        api.getPublishers(),
        api.getBooks({ limit: 100 }),
      ]);
      setStats(statsData);
      setAuthors(authorsData);
      setCategories(categoriesData);
      setPublishers(publishersData);
      setBooksList(booksData.items);
    } catch (err: any) {
      console.warn('Backend data load note:', err);
    } finally {
      // Ensure smooth entrance transition
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1400 - elapsed);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setShowPreloader(false), 300);
      }, remaining);
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

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      counts={{
        books: stats?.total_books ?? booksList.length,
        authors: stats?.total_authors ?? authors.length,
        categories: stats?.total_categories ?? categories.length,
        publishers: stats?.total_publishers ?? publishers.length,
      }}
      searchQuery={globalSearch}
      onSearchChange={handleGlobalSearch}
      onLogoutClick={() => {
        toast.info('Active Session', 'Dotcom Publications single-tenant admin workspace active.');
      }}
      onOpenLoaderPreview={() => setShowLoaderModal(true)}
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

      {/* Animated Loading Screen Demonstration Modal */}
      {showLoaderModal && (
        <Modal
          isOpen={showLoaderModal}
          onClose={() => setShowLoaderModal(false)}
          title="Dotcom Publications Animated Emblem"
          subtitle="Sunrise & sunset loop with flickering candle flame outline"
          size="lg"
        >
          <div className="space-y-4">
            {/* Background Theme Selector */}
            <div className="flex items-center justify-between border-b border-[#EAE3DE] pb-3">
              <span className="text-xs text-[#82777A] font-medium">Background preview mode:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoaderModalTheme('light')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    loaderModalTheme === 'light'
                      ? 'bg-[#651C32] text-white shadow-subtle'
                      : 'bg-[#FAF8F3] text-[#82777A] border border-[#EAE3DE]'
                  }`}
                >
                  Warm Paper
                </button>
                <button
                  type="button"
                  onClick={() => setLoaderModalTheme('dark')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    loaderModalTheme === 'dark'
                      ? 'bg-[#651C32] text-white shadow-subtle'
                      : 'bg-[#FAF8F3] text-[#82777A] border border-[#EAE3DE]'
                  }`}
                >
                  Charcoal Dark
                </button>
                <button
                  type="button"
                  onClick={() => setLoaderModalTheme('transparent')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    loaderModalTheme === 'transparent'
                      ? 'bg-[#651C32] text-white shadow-subtle'
                      : 'bg-[#FAF8F3] text-[#82777A] border border-[#EAE3DE]'
                  }`}
                >
                  Transparent
                </button>
              </div>
            </div>

            {/* Display Box */}
            <div
              className={`p-12 rounded-2xl flex flex-col items-center justify-center transition-colors min-h-[280px] border ${
                loaderModalTheme === 'dark'
                  ? 'bg-[#431322] border-[#651C32] text-white'
                  : loaderModalTheme === 'transparent'
                  ? 'bg-transparent border-dashed border-[#EAE3DE]'
                  : 'bg-[#FAF8F3] border-[#EAE3DE]'
              }`}
            >
              <DotcomLogoLoader
                size={220}
                theme={loaderModalTheme === 'dark' ? 'dark' : 'light'}
                showBrandText={true}
                statusText="Sunrise & Sunset Animation Cycle"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#82777A] pt-2">
              <a
                href="/logo-animation-demo.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#651C32] hover:underline font-semibold"
              >
                Open Fullscreen Standalone Page ↗
              </a>
              <Button variant="secondary" size="sm" onClick={() => setShowLoaderModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fullscreen Initial Preloader */}
      {showPreloader && (
        <LoadingScreen
          message="Advancing Scholarly Knowledge"
          subtext="Dotcom Publications Editorial System"
          theme="light"
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AdminApp />
    </ToastProvider>
  );
}
