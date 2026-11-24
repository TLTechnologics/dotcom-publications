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
  ExternalLink,
  Users,
  User,
  FolderTree,
  Globe,
  Clock,
  Layers,
  Coins
} from 'lucide-react';

interface BooksPageProps {
  authors: Author[];
  categories: Category[];
  publishers: Publisher[];
  onRefreshStats?: () => void;
  onRefreshAuthors?: () => void;
  onRefreshCategories?: () => void;
  onRefreshPublishers?: () => void;
}

export const BooksPage: React.FC<BooksPageProps> = ({
  authors,
  categories,
  publishers,
  onRefreshStats,
  onRefreshAuthors,
  onRefreshCategories,
  onRefreshPublishers,
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
          <h2 className="text-lg font-serif font-bold text-[#292326] tracking-tight text-xl">
            Book Catalogue Management
          </h2>
          <p className="text-xs text-[#82777A]">
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
      <div className="p-4 bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle space-y-3">
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
            options={[
              { value: '', label: 'All Disciplines', subtitle: 'View entire curriculum catalogue', icon: <Layers className="w-4 h-4" /> },
              ...categories.map((c) => ({
                value: c.id,
                label: c.name,
                subtitle: c.description || (c.subcategories?.length ? `${c.subcategories.length} sub-disciplines available` : 'Primary Discipline'),
                icon: <BookOpen className="w-4 h-4" />,
                badge: c.subcategories?.length ? `${c.subcategories.length} sub` : undefined,
              })),
            ]}
          />

          {/* Filter by Author */}
          <Select
            placeholder="All Authors"
            value={selectedAuthor}
            onChange={(e) => {
              setSelectedAuthor(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Authors & Faculty', subtitle: 'All contributing scholars', icon: <Users className="w-4 h-4" /> },
              ...authors.map((a) => ({
                value: a.id,
                label: a.name,
                subtitle: a.bio || a.email || 'Academic Author & Researcher',
                icon: <User className="w-4 h-4" />,
                badge: a.books_count ? `${a.books_count} titles` : undefined,
              })),
            ]}
          />

          {/* Filter by Status */}
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Publication Statuses', subtitle: 'Published and draft titles', icon: <Layers className="w-4 h-4" /> },
              { value: 'published', label: 'Published / Live', subtitle: 'Live on public website', icon: <Globe className="w-4 h-4" /> },
              { value: 'draft', label: 'Draft / Peer Review', subtitle: 'Internal review / unreleased', icon: <Clock className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EAE3DE] text-xs text-[#82777A]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <span className="font-semibold text-[#292326] flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#651C32]" /> Sort catalogue by:
            </span>
            <div className="w-full sm:w-64">
              <Select
                size="sm"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const parts = String(e.target.value).split('-');
                  if (parts.length === 2) {
                    setSortBy(parts[0] as any);
                    setSortOrder(parts[1] as any);
                  }
                }}
                options={[
                  { value: 'created_at-desc', label: 'Date Added (Newest First)', subtitle: 'Latest catalogue publications', icon: <Clock className="w-3.5 h-3.5" /> },
                  { value: 'created_at-asc', label: 'Date Added (Oldest First)', subtitle: 'Earliest registered monographs', icon: <Clock className="w-3.5 h-3.5" /> },
                  { value: 'title-asc', label: 'Title (Alphabetical A → Z)', subtitle: 'A to Z index', icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
                  { value: 'title-desc', label: 'Title (Reverse Z → A)', subtitle: 'Z to A index', icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
                  { value: 'selling_price-asc', label: 'Price (Lowest First)', subtitle: 'Student & entry edition', icon: <Coins className="w-3.5 h-3.5" /> },
                  { value: 'selling_price-desc', label: 'Price (Highest First)', subtitle: 'Premium & reference sets', icon: <Coins className="w-3.5 h-3.5" /> },
                ]}
              />
            </div>
          </div>

          {(search || selectedCategory || selectedAuthor || selectedStatus !== 'all') && (
            <button
              onClick={resetFilters}
              className="touch-target text-[#651C32] hover:text-[#431322] hover:underline font-semibold self-start sm:self-auto py-1"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Professional Books Data: Responsive Cards on Mobile (<md) & Table on Desktop (>=md) */}
      <div className="bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#82777A]">Loading catalogue data...</div>
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
          <>
            {/* Mobile Card-Based View (<md) */}
            <div className="block md:hidden divide-y divide-[#EAE3DE]/60">
              {books.map((book) => {
                const discountPercent =
                  book.mrp && book.mrp > book.selling_price
                    ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
                    : 0;

                return (
                  <div key={book.id} className="p-4 space-y-3 hover:bg-[#FAF8F3] transition-colors">
                    <div className="flex items-start gap-3">
                      <img
                        src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                        alt={book.title}
                        className="w-16 h-22 object-cover rounded-xl shadow-subtle border border-[#EAE3DE] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] uppercase font-bold text-[#651C32] bg-[#F5E6EA] px-2 py-0.5 rounded tracking-wider">
                            {book.category_name || 'Academic'}
                          </span>
                          {book.is_featured && <Badge variant="featured">Featured</Badge>}
                        </div>
                        <h3
                          onClick={() => setBookToPreview(book)}
                          className="font-serif font-bold text-sm text-[#292326] mt-1 cursor-pointer line-clamp-2 hover:text-[#651C32]"
                        >
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-[#82777A] mt-0.5 truncate">
                          By {book.authors?.map((a) => a.name).join(', ') || 'Unassigned'}
                        </p>
                        <p className="text-[10px] text-[#82777A] mt-0.5 font-mono">
                          ISBN: {book.isbn || 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE3DE]/50">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif font-bold text-base text-[#651C32]">
                            ₹{book.selling_price.toLocaleString('en-IN')}
                          </span>
                          {book.mrp > book.selling_price && (
                            <span className="text-xs text-[#82777A] line-through">
                              ₹{book.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="text-[10px] text-[#477A58] font-bold">
                              ({discountPercent}% off)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleTogglePublish(book)}
                          className="mt-1 block text-left"
                        >
                          <Badge variant={book.is_draft ? 'draft' : 'published'}>
                            {book.is_draft ? 'Draft' : 'Published'}
                          </Badge>
                        </button>
                      </div>

                      {/* Touch-Friendly Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setBookToPreview(book)}
                          title="Preview Book Presentation"
                          className="touch-target p-2.5 rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setBookToEdit(book);
                            setIsFormOpen(true);
                          }}
                          title="Edit Book Details"
                          className="touch-target p-2.5 rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBookToDelete(book)}
                          title="Delete Book"
                          className="touch-target p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-[#82777A] hover:text-[#B94B4B] hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table-Based View (>=md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[#FAF8F3] border-b border-[#EAE3DE] text-[#82777A] uppercase font-semibold text-[10px] tracking-wider">
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
                <tbody className="divide-y divide-[#EAE3DE]/60">
                  {books.map((book) => {
                    const discountPercent =
                      book.mrp && book.mrp > book.selling_price
                        ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
                        : 0;

                    return (
                      <tr
                        key={book.id}
                        className="hover:bg-[#FFF6D9]/25 transition-colors group"
                      >
                        {/* Cover Thumbnail */}
                        <td className="py-3 px-4">
                          <img
                            src={
                              book.cover_image ||
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow-subtle border border-[#EAE3DE] shrink-0"
                          />
                        </td>

                        {/* Title & Subtitle */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => setBookToPreview(book)}
                              className="font-serif font-bold text-[#292326] group-hover:text-[#651C32] cursor-pointer line-clamp-1 text-xs"
                            >
                              {book.title}
                            </span>
                            {book.is_featured && (
                              <span className="shrink-0 text-[9px] bg-[#F5E6EA] text-[#651C32] font-bold px-1.5 py-0.5 rounded border border-[#8B4055]/30">
                                Featured
                              </span>
                            )}
                          </div>
                          {book.subtitle && (
                            <p className="text-[11px] text-[#82777A] italic line-clamp-1 mt-0.5 font-serif">
                              {book.subtitle}
                            </p>
                          )}
                          <span className="text-[10px] text-[#82777A]/80 mt-1 block">
                            Format: {book.book_format} • {book.edition || '1st Ed.'}
                          </span>
                        </td>

                        {/* Author */}
                        <td className="py-3 px-4 text-[#292326] max-w-[150px]">
                          <span className="line-clamp-2">
                            {book.authors?.map((a) => a.name).join(', ') || 'Unassigned'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-[#82777A]">
                          <Badge variant="category">{book.category_name || 'General'}</Badge>
                          {book.subcategory_name && (
                            <span className="text-[10px] text-[#82777A] block mt-1">
                              {book.subcategory_name}
                            </span>
                          )}
                        </td>

                        {/* ISBN */}
                        <td className="py-3 px-4 font-mono text-[11px] text-[#292326]">
                          {book.isbn || 'Pending'}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-[#651C32] text-xs">
                            ₹{book.selling_price.toLocaleString('en-IN')}
                          </div>
                          {book.mrp > book.selling_price && (
                            <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                              <span className="text-[#82777A] line-through">
                                ₹{book.mrp.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[#477A58] font-semibold">
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
                        <td className="py-3 px-4 text-[#82777A] text-[11px]">
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
                              className="p-1.5 rounded-lg text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setBookToEdit(book);
                                setIsFormOpen(true);
                              }}
                              title="Edit Book Details"
                              className="p-1.5 rounded-lg text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setBookToDelete(book)}
                              title="Delete Book"
                              className="p-1.5 rounded-lg text-[#82777A] hover:text-[#B94B4B] hover:bg-rose-50 transition-colors"
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
          </>
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
        onRefreshCategories={onRefreshCategories}
        onRefreshPublishers={onRefreshPublishers}
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
