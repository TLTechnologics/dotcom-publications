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
  Layers,
  ChevronRight
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
            <div key={i} className="h-28 rounded-2xl bg-[#EAE3DE]/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-[#EAE3DE]/60" />
          <div className="h-96 rounded-2xl bg-[#EAE3DE]/60" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Titles in Catalogue',
      value: stats.total_books,
      icon: <BookOpen className="w-5 h-5 text-[#651C32]" />,
      iconBg: 'bg-[#F5E6EA]',
      subtext: `${stats.total_publishers} active imprints`,
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Published Titles',
      value: stats.published_books,
      icon: <CheckCircle2 className="w-5 h-5 text-[#477A58]" />,
      iconBg: 'bg-[#EAF3ED]',
      subtext: 'Publicly discoverable',
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Draft Manuscripts',
      value: stats.draft_books,
      icon: <FileEdit className="w-5 h-5 text-[#C58B35]" />,
      iconBg: 'bg-[#FFF6D9]',
      subtext: 'Under editorial peer review',
      tab: 'books' as NavigationTab,
    },
    {
      title: 'Faculty & Authors',
      value: stats.total_authors,
      icon: <Users className="w-5 h-5 text-[#557A9C]" />,
      iconBg: 'bg-[#EAF1F7]',
      subtext: 'Contributing professors',
      tab: 'authors' as NavigationTab,
    },
    {
      title: 'Disciplines & Categories',
      value: stats.total_categories,
      icon: <FolderTree className="w-5 h-5 text-[#651C32]" />,
      iconBg: 'bg-[#FBEFC4]',
      subtext: 'Curriculum areas',
      tab: 'categories' as NavigationTab,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Demonstration Banner — Maroon & Pastel Yellow */}
      <div className="bg-[#FFF6D9] border border-[#F6E7A8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#651C32] text-[#F6E7A8] flex items-center justify-center shadow-subtle shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-[#431322] tracking-tight text-sm">
              Demonstration Environment Active — Dotcom Publications
            </h4>
            <p className="text-[11px] text-[#651C32] mt-0.5 font-medium">
              Live database state rendered with dynamic counters and persistent CRUD workflows.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')}>
            Landing Page CMS
          </Button>
          <Button variant="primary" size="sm" onClick={onAddBook} icon={<Plus className="w-3.5 h-3.5" />}>
            New Title
          </Button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(card.tab)}
            className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle hover:shadow-card hover:border-[#651C32] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#82777A] leading-tight">{card.title}</span>
              <div className={`p-2.5 rounded-xl ${card.iconBg} transition-transform group-hover:scale-105 shadow-subtle`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#292326] block tracking-tight">
                {card.value}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-[#82777A]">
                <span>{card.subtext}</span>
                <span className="text-[#651C32] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
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
          <div className="p-6 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EAE3DE]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#292326] tracking-tight">
                  Recently Added Books
                </h3>
                <p className="text-xs text-[#82777A]">
                  Newest academic monographs registered in the catalogue
                </p>
              </div>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-semibold text-[#651C32] hover:text-[#431322] flex items-center gap-1 group transition-colors"
              >
                <span>View Complete Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-[#EAE3DE]/60">
              {stats.recently_added_books.map((book) => (
                <div
                  key={book.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF8F3] px-2.5 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-subtle border border-[#EAE3DE] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#651C32] bg-[#F5E6EA] px-2 py-0.5 rounded tracking-wider">
                          {book.category_name || 'Academic'}
                        </span>
                        {book.is_featured && <Badge variant="featured">Featured</Badge>}
                      </div>
                      <h4
                        onClick={() => onViewBook(book)}
                        className="text-xs font-serif font-bold text-[#292326] group-hover:text-[#651C32] truncate cursor-pointer mt-1"
                      >
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-[#82777A] truncate mt-0.5">
                        By {book.authors?.map((a) => a.name).join(', ') || 'Dotcom Faculty'} • ISBN: {book.isbn || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-[#651C32] block">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <Badge variant={book.is_draft ? 'draft' : 'published'}>
                        {book.is_draft ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => onViewBook(book)}
                      className="p-1.5 rounded-lg text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
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
          <div className="p-6 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#EAE3DE]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#292326] tracking-tight">
                  Featured Academic Titles
                </h3>
                <p className="text-xs text-[#82777A]">
                  Titles highlighted on the Dotcom Publications public homepage showcase
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF6D9] text-[#431322] border border-[#F6E7A8]">
                {stats.featured_books.length} Active Showcases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.featured_books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onViewBook(book)}
                  className="p-3.5 rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] hover:bg-white hover:border-[#651C32] hover:shadow-subtle transition-all cursor-pointer group flex items-start gap-3"
                >
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow-subtle border border-[#EAE3DE] shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between h-20">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#651C32]">
                        {book.category_name}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-[#292326] line-clamp-2 mt-0.5 group-hover:text-[#651C32] leading-snug">
                        {book.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#EAE3DE]/50">
                      <span className="font-serif font-bold text-[#651C32]">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#477A58] font-semibold">
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
          <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#82777A] mb-3">
              Section D: Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={onAddBook}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5E6EA] text-[#651C32] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Add New Book
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      5-section catalogue editor
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onAddAuthor}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF1F7] text-[#557A9C] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Add New Author
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Faculty credentials & bio
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={onAddCategory}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0E2] text-[#C58B35] flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Create Category
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Discipline classification
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('landing')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#477A58] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Edit Landing Page
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Hero banners & showcases
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* SECTION C — Recent Administrative Activity */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAE3DE] shadow-subtle">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE3DE]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#82777A]">
                Section C: Recent Activity
              </h3>
              <Clock className="w-4 h-4 text-[#651C32]" />
            </div>

            <div className="space-y-4">
              {stats.recent_activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#651C32] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#292326] font-medium leading-snug">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-[#82777A] block mt-1">
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
