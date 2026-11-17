import React, { useState, useEffect } from 'react';
import { Book, Author, Category, Publisher } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { BookFormModal } from '../components/books/BookFormModal';
import { BookPreviewModal } from '../components/books/BookPreviewModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

interface BooksPageProps {
  authors: Author[];
  categories: Category[];
  publishers: Publisher[];
  onRefreshStats?: () => void;
  onRefreshAuthors?: () => void;
}

export const BooksPage: React.FC<BooksPageProps> = ({
  authors,
  categories,
  publishers,
  onRefreshStats,
  onRefreshAuthors,
}) => {
  const toast = useToast();

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToPreview, setBookToPreview] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [page, search, selectedCategory, selectedAuthor, selectedStatus, sortBy, sortOrder]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getBooks({
        search: search.trim() || undefined,
        category_id: selectedCategory ? Number(selectedCategory) : undefined,
        author_id: selectedAuthor ? Number(selectedAuthor) : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit,
      });
      setBooks(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load catalogue books');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (book: Book) => {
    try {
      const res = await api.togglePublishBook(book.id);
      toast.success(
        res.is_draft ? 'Changed to Draft' : 'Book Published',
        `"${book.title}" is now ${res.status}`
      );
      loadBooks();
      onRefreshStats?.();
    } catch (err: any) {
      toast.error('Error changing publication status', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteBook(bookToDelete.id);
      toast.success('Book Deleted', `"${bookToDelete.title}" removed from catalogue`);
      setBookToDelete(null);
      loadBooks();
      onRefreshStats?.();
    } catch (err: any) {
      toast.error('Failed to delete book', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setSelectedStatus('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal-900 tracking-tight">
            Book Catalogue Management
          </h2>
          <p className="text-xs text-charcoal-500">
            Total of {total} academic publications, monographs, and textbooks registered
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setBookToEdit(null);
            setIsFormOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Book
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by Title / ISBN */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title, ISBN, or subject..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filter by Category */}
          <Select
            placeholder="All Disciplines"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          {/* Filter by Author */}
          <Select
            placeholder="All Authors"
            value={selectedAuthor}
            onChange={(e) => {
              setSelectedAuthor(e.target.value);
              setPage(1);
            }}
            options={authors.map((a) => ({ value: a.id, label: a.name }))}
          />

          {/* Filter by Status */}
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Publication Statuses' },
              { value: 'published', label: 'Published / Live' },
              { value: 'draft', label: 'Draft / Peer Review' },
            ]}
          />
        </div>

        {/* Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs text-charcoal-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-charcoal-700 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort by:
            </span>
            <button
              onClick={() => {
                setSortBy('created_at');
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              }}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                sortBy === 'created_at'
                  ? 'bg-paper-200 border-paper-300 text-charcoal-900 font-semibold'
                  : 'border-transparent text-charcoal-500 hover:bg-stone-50'
              }`}
            >
              Date Added ({sortBy === 'created_at' ? (sortOrder === 'desc' ? 'Newest' : 'Oldest') : 'Date'})
            </button>
            <button
              onClick={() => {
                setSortBy('title');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                sortBy === 'title'
                  ? 'bg-paper-200 border-paper-300 text-charcoal-900 font-semibold'
                  : 'border-transparent text-charcoal-500 hover:bg-stone-50'
              }`}
            >
              Title (A-Z)
            </button>
            <button
              onClick={() => {
                setSortBy('selling_price');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                sortBy === 'selling_price'
                  ? 'bg-paper-200 border-paper-300 text-charcoal-900 font-semibold'
                  : 'border-transparent text-charcoal-500 hover:bg-stone-50'
              }`}
            >
              Price ({sortBy === 'selling_price' ? (sortOrder === 'asc' ? 'Low-High' : 'High-Low') : 'Price'})
            </button>
          </div>

          {(search || selectedCategory || selectedAuthor || selectedStatus !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-editorial-burgundy-700 hover:underline font-medium"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Professional Books Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading catalogue data...</div>
        ) : books.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="No Books Found"
            description="No publications match the current filter or search criteria. Try adjusting your query or add a new title."
            actionText="Add New Book"
            onAction={() => {
              setBookToEdit(null);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-100/80 border-b border-stone-200 text-charcoal-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Cover</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Author(s)</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Price (INR)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {books.map((book) => {
                  const discountPercent =
                    book.mrp && book.mrp > book.selling_price
                      ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
                      : 0;

                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-paper-50/60 transition-colors group"
                    >
                      {/* Cover Thumbnail */}
                      <td className="py-3 px-4">
                        <img
                          src={
                            book.cover_image ||
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow-sm border border-stone-200 shrink-0"
                        />
                      </td>

                      {/* Title & Subtitle */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => setBookToPreview(book)}
                            className="font-serif font-bold text-charcoal-900 group-hover:text-editorial-burgundy-700 cursor-pointer line-clamp-1 text-xs"
                          >
                            {book.title}
                          </span>
                          {book.is_featured && (
                            <span className="shrink-0 text-[9px] bg-editorial-burgundy-50 text-editorial-burgundy-800 font-bold px-1.5 py-0.5 rounded border border-editorial-burgundy-200">
                              Featured
                            </span>
                          )}
                        </div>
                        {book.subtitle && (
                          <p className="text-[11px] text-charcoal-500 italic line-clamp-1 mt-0.5 font-serif">
                            {book.subtitle}
                          </p>
                        )}
                        <span className="text-[10px] text-charcoal-400 mt-1 block">
                          Format: {book.book_format} • {book.edition || '1st Ed.'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-charcoal-700 max-w-[150px]">
                        <span className="line-clamp-2">
                          {book.authors?.map((a) => a.name).join(', ') || 'Unassigned'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-charcoal-600">
                        <Badge variant="category">{book.category_name || 'General'}</Badge>
                        {book.subcategory_name && (
                          <span className="text-[10px] text-charcoal-400 block mt-1">
                            {book.subcategory_name}
                          </span>
                        )}
                      </td>

                      {/* ISBN */}
                      <td className="py-3 px-4 font-mono text-[11px] text-charcoal-600">
                        {book.isbn || 'Pending'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="font-serif font-bold text-charcoal-900 text-xs">
                          ₹{book.selling_price.toLocaleString('en-IN')}
                        </div>
                        {book.mrp > book.selling_price && (
                          <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                            <span className="text-charcoal-400 line-through">
                              ₹{book.mrp.toLocaleString('en-IN')}
                            </span>
                            <span className="text-emerald-700 font-semibold">
                              {discountPercent}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Publication Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(book)}
                          title="Click to toggle publish status"
                          className="text-left"
                        >
                          <Badge variant={book.is_draft ? 'draft' : 'published'}>
                            {book.is_draft ? 'Draft' : 'Published'}
                          </Badge>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 text-charcoal-400 text-[11px]">
                        {new Date(book.updated_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setBookToPreview(book)}
                            title="Preview Book Presentation"
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setBookToEdit(book);
                              setIsFormOpen(true);
                            }}
                            title="Edit Book Details"
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-stone-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            title="Delete Book"
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          pages={pages}
          total={total}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setBookToEdit(null);
        }}
        onSuccess={() => {
          loadBooks();
          onRefreshStats?.();
        }}
        bookToEdit={bookToEdit}
        authors={authors}
        categories={categories}
        publishers={publishers}
        onRefreshAuthors={onRefreshAuthors}
      />

      {/* Book Preview Modal */}
      <BookPreviewModal
        book={bookToPreview}
        isOpen={!!bookToPreview}
        onClose={() => setBookToPreview(null)}
      />

      {/* Confirmation Dialog before deletion */}
      <ConfirmDialog
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Book Catalogue Entry"
        message={`Are you sure you want to remove "${bookToDelete?.title}" from the Dotcom Publications catalogue? This action cannot be undone.`}
        confirmText="Yes, Delete Book"
        loading={deleteLoading}
      />
    </div>
  );
};
