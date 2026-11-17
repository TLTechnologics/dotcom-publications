import React from 'react';
import { DashboardStats, Book, NavigationTab } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BookOpen,
  CheckCircle2,
  FileEdit,
  Users,
  FolderTree,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  BookMarked,
  Eye,
  Layers
} from 'lucide-react';

interface DashboardPageProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: NavigationTab) => void;
  onAddBook: () => void;
  onAddAuthor: () => void;
  onAddCategory: () => void;
  onViewBook: (book: Book) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  loading,
  onNavigate,
  onAddBook,
  onAddAuthor,
  onAddCategory,
  onViewBook,
}) => {
  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-stone-200/70" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-stone-200/70" />
          <div className="h-96 rounded-2xl bg-stone-200/70" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Titles in Catalogue',
      value: stats.total_books,
      icon: <BookOpen className="w-5 h-5 text-editorial-burgundy-700" />,
      subtext: `${stats.total_publishers} active imprints`,
      badge: 'All Media',
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Published Titles',
      value: stats.published_books,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      subtext: 'Publicly discoverable',
      badge: 'Live',
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Draft Manuscripts',
      value: stats.draft_books,
      icon: <FileEdit className="w-5 h-5 text-amber-600" />,
      subtext: 'Under editorial peer review',
      badge: 'In Review',
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Faculty & Authors',
      value: stats.total_authors,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      subtext: 'Contributing professors',
      badge: 'Scholars',
      tab: 'authors' as NavigationTab,
    },
    {
      title: 'Disciplines & Categories',
      value: stats.total_categories,
      icon: <FolderTree className="w-5 h-5 text-purple-600" />,
      subtext: 'Curriculum areas',
      badge: 'Taxonomy',
      tab: 'categories' as NavigationTab,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Demonstration Banner */}
      <div className="bg-editorial-burgundy-50 border border-editorial-burgundy-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-editorial-burgundy-700 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-editorial-burgundy-900">
              Demonstration Environment Active — Dotcom Publications Phase 1
            </h4>
            <p className="text-[11px] text-editorial-burgundy-700 mt-0.5">
              Live database state rendered with dynamic counters and full CRUD support. All statistics derive from persistent records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')}>
            Landing Page CMS
          </Button>
          <Button variant="primary" size="sm" onClick={onAddBook} icon={<Plus className="w-3.5 h-3.5" />}>
            New Title
          </Button>
        </div>
      </div>

      {/* Primary Statistics Grid (Derived from Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(card.tab)}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-subtle hover:shadow-card hover:border-editorial-burgundy-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-charcoal-500">{card.title}</span>
              <div className="p-2 rounded-xl bg-stone-50 group-hover:bg-paper-100 transition-colors">
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-serif font-bold text-charcoal-900 block tracking-tight">
                {card.value}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-charcoal-400">
                <span>{card.subtext}</span>
                <span className="text-editorial-burgundy-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Section A (Recently Added) + Section B (Featured) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION A — Recently Added Books */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal-900 tracking-tight">
                  Recently Added Books
                </h3>
                <p className="text-xs text-charcoal-500">
                  Newest monographs added to the catalogue and pending publication
                </p>
              </div>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-semibold text-editorial-burgundy-700 hover:text-editorial-burgundy-800 flex items-center gap-1"
              >
                View Complete Catalogue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {stats.recently_added_books.map((book) => (
                <div
                  key={book.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-paper-50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-editorial-burgundy-700 tracking-wider">
                          {book.category_name || 'Academic'}
                        </span>
                        {book.is_featured && <Badge variant="featured">Featured</Badge>}
                      </div>
                      <h4
                        onClick={() => onViewBook(book)}
                        className="text-xs font-serif font-bold text-charcoal-900 group-hover:text-editorial-burgundy-700 truncate cursor-pointer mt-0.5"
                      >
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                        By {book.authors?.map((a) => a.name).join(', ') || 'Dotcom Faculty'} • ISBN: {book.isbn || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-charcoal-900 block">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <Badge variant={book.is_draft ? 'draft' : 'published'}>
                        {book.is_draft ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => onViewBook(book)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-stone-100"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B — Popular / Featured Books */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal-900 tracking-tight">
                  Featured Academic Titles
                </h3>
                <p className="text-xs text-charcoal-500">
                  Titles marked as featured for the public website homepage showcase
                </p>
              </div>
              <span className="text-xs text-charcoal-400">
                {stats.featured_books.length} Titles Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.featured_books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onViewBook(book)}
                  className="p-3.5 rounded-xl border border-stone-200 bg-paper-50/70 hover:bg-stone-50 hover:border-editorial-burgundy-300 transition-all cursor-pointer group flex items-start gap-3"
                >
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow-sm border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between h-20">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-editorial-burgundy-700">
                        {book.category_name}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-charcoal-900 line-clamp-2 mt-0.5 group-hover:text-editorial-burgundy-700">
                        {book.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-serif font-bold text-charcoal-900">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {book.availability_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Section D (Quick Actions) + Section C (Recent Activity) */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION D — Quick Actions */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-subtle">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-3">
              Section D: Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={onAddBook}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-editorial-burgundy-300 hover:bg-paper-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-editorial-burgundy-100 text-editorial-burgundy-800 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block group-hover:text-editorial-burgundy-700">
                      Add New Book
                    </span>
                    <span className="text-[10px] text-charcoal-500">
                      5-section catalogue editor
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-editorial-burgundy-700" />
              </button>

              <button
                onClick={onAddAuthor}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-editorial-burgundy-300 hover:bg-paper-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block group-hover:text-editorial-burgundy-700">
                      Add New Author
                    </span>
                    <span className="text-[10px] text-charcoal-500">
                      Faculty bio and credentials
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-editorial-burgundy-700" />
              </button>

              <button
                onClick={onAddCategory}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-editorial-burgundy-300 hover:bg-paper-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block group-hover:text-editorial-burgundy-700">
                      Create Category
                    </span>
                    <span className="text-[10px] text-charcoal-500">
                      Subject classification
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-editorial-burgundy-700" />
              </button>

              <button
                onClick={() => onNavigate('landing')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-editorial-burgundy-300 hover:bg-paper-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block group-hover:text-editorial-burgundy-700">
                      Edit Landing Page
                    </span>
                    <span className="text-[10px] text-charcoal-500">
                      Hero banners & showcases
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-editorial-burgundy-700" />
              </button>
            </div>
          </div>

          {/* SECTION C — Recent Administrative Activity */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                Section C: Recent Activity
              </h3>
              <Clock className="w-4 h-4 text-charcoal-400" />
            </div>

            <div className="space-y-4">
              {stats.recent_activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-1 w-2 h-2 rounded-full bg-editorial-burgundy-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal-800 font-medium leading-snug">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-charcoal-400 block mt-1">
                      {new Date(act.timestamp).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
