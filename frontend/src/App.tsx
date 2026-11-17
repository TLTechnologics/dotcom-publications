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

  // Global Quick Action Modals
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  const loadAllData = async () => {
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

export default function App() {
  return (
    <ToastProvider>
      <AdminApp />
    </ToastProvider>
  );
}
