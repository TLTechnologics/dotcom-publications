import React, { useState, useEffect } from 'react';
import { DashboardStats, DashboardAnalytics, Book, NavigationTab } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
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
  ChevronRight,
  ShoppingBag,
  IndianRupee,
  BarChart3,
  Package,
  Activity,
  ArrowUpRight
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
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const data = await api.getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.warn('Analytics loading note:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-[#EAE3DE]/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-lg bg-[#EAE3DE]/60" />
          <div className="h-96 rounded-lg bg-[#EAE3DE]/60" />
        </div>
      </div>
    );
  }

  // Calculate highest monthly revenue for relative bar heights
  const maxMonthlyRevenue = analytics?.monthly_revenue?.reduce(
    (max, item) => (item.revenue > max ? item.revenue : max),
    1
  ) || 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Platform Status Banner */}
      <div className="bg-[#FFF6D9] border border-[#F6E7A8] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-md bg-[#651C32] text-[#F6E7A8] flex items-center justify-center shadow-none shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-serif font-bold text-[#431322] tracking-tight truncate">
              Publishing dashboard
            </h4>
            <p className="text-[11px] text-[#651C32] mt-0.5 font-medium line-clamp-2">
              Catalogue totals, customer orders and recent publishing activity.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('landing')} className="flex-1 sm:flex-initial">
            Landing page
          </Button>
          <Button variant="primary" size="sm" onClick={onAddBook} icon={<Plus className="w-3.5 h-3.5" />} className="flex-1 sm:flex-initial">
            New Title
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid (Revenue, Orders, Books, Authors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none hover:shadow-none hover:border-[#651C32] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#82777A] leading-tight">Gross revenue</span>
            <div className="p-2 sm:p-2.5 rounded-md bg-[#FFF6D9] text-[#651C32] group-hover:scale-105 transition-transform shadow-none shrink-0">
              <span className="font-serif font-bold text-sm">₹</span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#292326] block tracking-tight truncate">
              ₹{(stats.total_revenue || 0).toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#82777A]">
              <span>Real-time processed sales</span>
              <span className="text-[#651C32] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                Orders <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Total Customer orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none hover:shadow-none hover:border-[#651C32] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#82777A] leading-tight">Customer orders</span>
            <div className="p-2 sm:p-2.5 rounded-md bg-[#EAF1F7] text-[#557A9C] group-hover:scale-105 transition-transform shadow-none shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#292326] block tracking-tight">
              {stats.total_orders || 0}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#82777A]">
              <span className="truncate">
                {stats.completed_orders || 0} delivered • {stats.pending_orders || 0} active
              </span>
              <span className="text-[#651C32] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                Manage <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Catalogue Titles */}
        <div
          onClick={() => onNavigate('books')}
          className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none hover:shadow-none hover:border-[#651C32] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#82777A] leading-tight">Published books</span>
            <div className="p-2 sm:p-2.5 rounded-md bg-[#F5E6EA] text-[#651C32] group-hover:scale-105 transition-transform shadow-none shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#292326] block tracking-tight">
              {stats.published_books} <span className="text-xs sm:text-sm font-normal text-[#82777A]">/ {stats.total_books} total</span>
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#82777A]">
              <span>{stats.draft_books} draft manuscripts</span>
              <span className="text-[#651C32] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                Catalogue <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Authors */}
        <div
          onClick={() => onNavigate('authors')}
          className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none hover:shadow-none hover:border-[#651C32] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#82777A] leading-tight">Faculty Authors & Imprints</span>
            <div className="p-2 sm:p-2.5 rounded-md bg-[#FAF0E2] text-[#C58B35] group-hover:scale-105 transition-transform shadow-none shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-[#292326] block tracking-tight">
              {stats.total_authors}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#82777A]">
              <span className="truncate">{stats.total_publishers} imprints • {stats.total_categories} disciplines</span>
              <span className="text-[#651C32] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                Faculty <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row: Monthly Revenue Chart & Order Status Distribution */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Monthly Revenue Bars (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6 pb-3 border-b border-[#EAE3DE]">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#292326] tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#651C32]" />
                  Monthly Publication Sales & Revenue
                </h3>
                <p className="text-[11px] sm:text-xs text-[#82777A]">
                  Track fiscal performance across academic terms and institutional procurement cycles
                </p>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8] self-start sm:self-auto">
                Last 6 Months
              </span>
            </div>

            {/* Bar Visualizer with horizontal scrolling on small mobile */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
              <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-44 pt-4 min-w-[300px]">
                {analytics.monthly_revenue.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.revenue / maxMonthlyRevenue) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[9px] sm:text-[10px] font-bold text-[#651C32] opacity-0 group-hover:opacity-100 transition-opacity text-center truncate">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </div>
                      <div className="w-full max-w-[44px] bg-[#FAF8F3] rounded-t-xl overflow-hidden flex flex-col justify-end p-1 border border-[#EAE3DE] group-hover:border-[#651C32] transition-all">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-[#651C32] to-[#8C2745] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm"
                        />
                      </div>
                      <div className="text-center w-full">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-[#292326] block truncate">
                          {item.month}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-[#82777A] block truncate">
                          {item.orders_count} {item.orders_count === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Status Distribution (4 cols) */}
          <div className="lg:col-span-4 p-4 sm:p-6 rounded-lg bg-white border border-[#EAE3DE] shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE3DE]">
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#292326] tracking-tight">
                  Fulfillment Pipeline
                </h3>
                <Package className="w-4 h-4 text-[#651C32]" />
              </div>

              <div className="space-y-3 pt-1">
                {analytics.order_status_distribution.map((dist, idx) => {
                  const percent = stats.total_orders > 0 ? Math.round((dist.count / stats.total_orders) * 100) : 0;
                  const getStatusColor = (s: string) => {
                    switch (s) {
                      case 'Confirmed':
                        return 'bg-emerald-500';
                      case 'Processing':
                        return 'bg-amber-500';
                      case 'Shipped':
                        return 'bg-blue-500';
                      case 'Delivered':
                        return 'bg-purple-500';
                      case 'Cancelled':
                        return 'bg-rose-500';
                      default:
                        return 'bg-stone-500';
                    }
                  };

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-[#292326] flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(dist.status)}`} />
                          {dist.status}
                        </span>
                        <span className="text-[#82777A]">
                          {dist.count} orders ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#FAF8F3] border border-[#EAE3DE] overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full ${getStatusColor(dist.status)} transition-all`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('orders')}
              className="w-full mt-6 min-h-[40px]"
            >
              Manage All Orders
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Sections: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Recently Added Books + Featured titles */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Recently Added Books */}
          <div className="p-4 sm:p-6 rounded-lg bg-white border border-[#EAE3DE] shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5 pb-3 border-b border-[#EAE3DE]">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#292326] tracking-tight">
                  Recently Registered Titles
                </h3>
                <p className="text-[11px] sm:text-xs text-[#82777A]">
                  Newest academic monographs registered in the catalogue database
                </p>
              </div>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-semibold text-[#651C32] hover:text-[#431322] flex items-center gap-1 group transition-colors self-start sm:self-auto touch-target"
              >
                <span>View catalogue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-[#EAE3DE]/60">
              {stats.recently_added_books.map((book) => (
                <div
                  key={book.id}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F3] px-2 sm:px-2.5 rounded-md transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <img
                      src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-11 h-15 sm:w-12 sm:h-16 object-cover rounded-lg shadow-none border border-[#EAE3DE] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#651C32] bg-[#F5E6EA] px-2 py-0.5 rounded tracking-wider">
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
                      <p className="text-[10px] sm:text-[11px] text-[#82777A] truncate mt-0.5">
                        By {book.authors?.map((a) => a.name).join(', ') || 'Faculty'} • ISBN: {book.isbn || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE3DE]/40">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-serif font-bold text-[#651C32] block">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <Badge variant={book.is_draft ? 'draft' : 'published'}>
                        {book.is_draft ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => onViewBook(book)}
                      className="touch-target p-2 rounded-lg text-[#82777A] hover:text-[#651C32] hover:bg-[#FFF6D9] transition-colors"
                      title="Quick preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Academic Titles */}
          <div className="p-4 sm:p-6 rounded-lg bg-white border border-[#EAE3DE] shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5 pb-3 border-b border-[#EAE3DE]">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#292326] tracking-tight">
                  Featured Academic Titles
                </h3>
                <p className="text-[11px] sm:text-xs text-[#82777A]">
                  Titles highlighted on the Dotcom Publications public homepage showcase
                </p>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF6D9] text-[#431322] border border-[#F6E7A8] self-start sm:self-auto">
                {stats.featured_books.length} Active Showcases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {stats.featured_books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onViewBook(book)}
                  className="p-3 sm:p-3.5 rounded-md border border-[#EAE3DE] bg-[#FAF8F3] hover:bg-white hover:border-[#651C32] hover:shadow-none transition-all cursor-pointer group flex items-start gap-3"
                >
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-12 h-18 sm:w-14 sm:h-20 object-cover rounded-lg shadow-none border border-[#EAE3DE] shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex flex-col justify-between h-18 sm:h-20">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#651C32]">
                        {book.category_name}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-[#292326] line-clamp-2 mt-0.5 group-hover:text-[#651C32] leading-snug">
                        {book.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1 border-t border-[#EAE3DE]/50">
                      <span className="font-serif font-bold text-[#651C32]">
                        ₹{book.selling_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#477A58] font-semibold">
                        {book.availability_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Publishing Actions + Recent System Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Publishing Actions */}
          <div className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#82777A] mb-3">
              Publishing Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={onAddBook}
                className="w-full min-h-[50px] flex items-center justify-between p-3 rounded-md border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5E6EA] text-[#651C32] flex items-center justify-center font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Add New Title
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Catalogue editor & ISBN setup
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                onClick={onAddAuthor}
                className="w-full min-h-[50px] flex items-center justify-between p-3 rounded-md border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF1F7] text-[#557A9C] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Add Faculty Author
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Faculty credentials & bio
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                onClick={onAddCategory}
                className="w-full min-h-[50px] flex items-center justify-between p-3 rounded-md border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0E2] text-[#C58B35] flex items-center justify-center shrink-0">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Create Discipline
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Discipline classification
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('landing')}
                className="w-full min-h-[50px] flex items-center justify-between p-3 rounded-md border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#477A58] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#292326] block group-hover:text-[#651C32]">
                      Landing page
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      Hero banners & showcases
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#82777A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="p-4 sm:p-5 rounded-lg bg-white border border-[#EAE3DE] shadow-none">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE3DE]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#82777A]">
                Recent System Activity
              </h3>
              <Clock className="w-4 h-4 text-[#651C32]" />
            </div>

            <div className="space-y-3.5">
              {stats.recent_activity.slice(0, 8).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#651C32] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#292326] font-medium leading-snug">
                      {act.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#82777A]">
                      <span>
                        {new Date(act.timestamp).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {act.user_name && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FAF8F3] border border-[#EAE3DE] text-[#651C32] font-semibold">
                          {act.user_name}
                        </span>
                      )}
                    </div>
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
