import React from 'react';
import { LandingPageContent, Book, Category } from '../../types';
import { Modal } from '../ui/Modal';
import { BookMarked, Search, ArrowRight, BookOpen, Star, Mail, Phone, MapPin } from 'lucide-react';

interface LandingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: LandingPageContent;
  books: Book[];
  categories: Category[];
}

export const LandingPreviewModal: React.FC<LandingPreviewModalProps> = ({
  isOpen,
  onClose,
  content,
  books,
  categories,
}) => {
  const featuredBooks = books.filter((b) => content.featured_book_ids.includes(b.id));
  const popularCats = categories.filter((c) => content.popular_categories.includes(c.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Public Website Live Preview"
      subtitle="How visitors experience Dotcom Publications homepage"
      size="full"
    >
      <div className="border border-stone-300 rounded-2xl overflow-hidden bg-white text-charcoal-900 shadow-xl">
        {/* Mock Browser Header Bar */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="ml-3 font-mono text-[11px] text-charcoal-600">
              https://dotcompublications.com
            </span>
          </div>
          <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded text-charcoal-600 font-medium">
            Live Preview Mode
          </span>
        </div>

        {/* Public Website Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 bg-paper-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-editorial-burgundy-700 text-white flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-charcoal-900 text-base leading-tight block">
                Dotcom Publications
              </span>
              <span className="text-[9px] uppercase tracking-wider text-charcoal-500 font-semibold block">
                Academic & Educational Publishers
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-charcoal-700">
            <span className="text-editorial-burgundy-700 font-semibold">Home</span>
            <span className="hover:text-editorial-burgundy-700 cursor-pointer">Catalogue</span>
            <span className="hover:text-editorial-burgundy-700 cursor-pointer">Scholars & Authors</span>
            <span className="hover:text-editorial-burgundy-700 cursor-pointer">About Us</span>
            <span className="hover:text-editorial-burgundy-700 cursor-pointer">Contact</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-stone-900 via-charcoal-900 to-editorial-burgundy-900 text-white p-8 md:p-12 overflow-hidden">
          {content.hero_image && (
            <img
              src={content.hero_image}
              alt="Hero Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold inline-block mb-2">
              Scholarly Excellence • Global Standard
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight mb-3">
              {content.hero_heading}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed mb-6 font-light">
              {content.hero_description}
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 rounded-lg bg-editorial-burgundy-700 hover:bg-editorial-burgundy-600 text-white text-xs font-semibold shadow-md flex items-center gap-2">
                Explore Complete Catalogue <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 backdrop-blur-sm">
                University Adoptions
              </button>
            </div>
          </div>
        </div>

        {/* Featured Titles Section */}
        <div className="p-8 bg-paper-50 border-b border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-charcoal-900">
                Featured Academic Publications
              </h2>
              <p className="text-xs text-charcoal-500">
                Peer-reviewed monographs and textbooks recommended by university boards
              </p>
            </div>
            <span className="text-xs text-editorial-burgundy-700 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              View All Titles <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-subtle hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="aspect-[2/3] overflow-hidden bg-stone-100 relative">
                  <img
                    src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-editorial-burgundy-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                    ₹{b.selling_price}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-editorial-burgundy-700 uppercase tracking-wider block">
                      {b.category_name || 'Academic'}
                    </span>
                    <h3 className="text-xs font-serif font-bold text-charcoal-900 line-clamp-2 mt-0.5 leading-snug">
                      {b.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-charcoal-500 mt-2 truncate">
                    {b.authors?.map((a) => a.name).join(', ') || 'Dotcom Faculty'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Disciplines */}
        <div className="p-8 bg-white border-b border-stone-200">
          <h2 className="text-lg font-serif font-bold text-charcoal-900 mb-1">
            Browse by Discipline
          </h2>
          <p className="text-xs text-charcoal-500 mb-6">
            Structured curricula spanning engineering, social sciences, medicine, and humanities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popularCats.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-stone-200 bg-paper-50 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <h4 className="text-sm font-serif font-bold text-charcoal-900">{cat.name}</h4>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2">{cat.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-editorial-burgundy-700 font-semibold">
                  <span>{cat.books_count || 0} Titles Published</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="p-8 bg-paper-100 border-b border-stone-200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-2">
              {content.about_title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed mb-6 font-light">
              {content.about_description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {content.about_stats.map((s, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 shadow-subtle">
                  <span className="text-xl font-serif font-bold text-editorial-burgundy-700 block">
                    {s.value}
                  </span>
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold block mt-0.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Public Footer */}
        <div className="p-6 bg-charcoal-900 text-stone-300 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-charcoal-700">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-editorial-gold" />
              <span className="font-serif font-bold text-white">Dotcom Publications</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {content.contact_email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {content.contact_phone}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-center text-stone-400 mt-4">{content.footer_text}</p>
        </div>
      </div>
    </Modal>
  );
};
