import React, { useState, useEffect } from 'react';
import { LandingPageContent, Book, Category } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MediaPickerModal } from '../components/media/MediaPickerModal';
import { LandingPreviewModal } from '../components/landing/LandingPreviewModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  Eye,
  Save,
  Plus,
  Trash2,
  BookOpen,
  FolderTree,
  Mail,
  Sparkles
} from 'lucide-react';

interface LandingPageManagerProps {
  books: Book[];
  categories: Category[];
}

export const LandingPageManager: React.FC<LandingPageManagerProps> = ({ books, categories }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [content, setContent] = useState<LandingPageContent>({
    hero_heading: '',
    hero_description: '',
    hero_image: '',
    featured_book_ids: [],
    latest_publications: [],
    popular_categories: [],
    about_title: '',
    about_description: '',
    about_stats: [],
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    footer_text: '',
  });

  useEffect(() => {
    loadLandingContent();
  }, []);

  const loadLandingContent = async () => {
    setLoading(true);
    try {
      const data = await api.getLandingPage();
      setContent(data);
    } catch {
      toast.error('Failed to load landing page configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateLandingPage(content);
      setContent(updated);
      toast.success('Landing Page Published', 'Public homepage content updated dynamically');
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedBook = (bookId: number) => {
    setContent((prev) => {
      const exists = prev.featured_book_ids.includes(bookId);
      return {
        ...prev,
        featured_book_ids: exists
          ? prev.featured_book_ids.filter((id) => id !== bookId)
          : [...prev.featured_book_ids, bookId],
      };
    });
  };

  const togglePopularCategory = (catId: number) => {
    setContent((prev) => {
      const exists = prev.popular_categories.includes(catId);
      return {
        ...prev,
        popular_categories: exists
          ? prev.popular_categories.filter((id) => id !== catId)
          : [...prev.popular_categories, catId],
      };
    });
  };

  const updateStat = (index: number, field: 'label' | 'value', value: string) => {
    setContent((prev) => {
      const newStats = [...prev.about_stats];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, about_stats: newStats };
    });
  };

  const addStat = () => {
    setContent((prev) => ({
      ...prev,
      about_stats: [...prev.about_stats, { label: 'Add statistic', value: '100+' }],
    }));
  };

  const removeStat = (index: number) => {
    setContent((prev) => ({
      ...prev,
      about_stats: prev.about_stats.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#82777A]">Loading landing page CMS...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#292326] tracking-tight">
            Landing page Studio
          </h2>
          <p className="text-xs text-[#82777A]">
            Dynamically powers the future public-facing website at dotcompublications.com
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full sm:w-auto min-h-[44px]"
            icon={<Eye className="w-4 h-4" />}
          >
            Live Website Preview
          </Button>
          <Button
            variant="primary"
            loading={saving}
            onClick={handleSave}
            className="w-full sm:w-auto min-h-[44px]"
            icon={<Save className="w-4 h-4" />}
          >
            Save & Publish Homepage
          </Button>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {/* Section 1: Hero Section */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#292326]">
                1. Hero Presentation Banner
              </h3>
              <p className="text-xs text-[#82777A]">
                Primary headline, vision statement, and panoramic banner backdrop
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#651C32] bg-[#FFF6D9] px-2.5 py-1 rounded-md border border-[#F6E7A8]">
              Homepage Header
            </span>
          </div>

          <div className="space-y-4">
            <Input
              label="Hero headline"
              value={content.hero_heading}
              onChange={(e) => setContent({ ...content, hero_heading: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                Hero Supporting Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] leading-relaxed transition-colors"
                value={content.hero_description}
                onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                Hero Background Image
              </label>
              <div className="flex gap-2">
                <Input
                  value={content.hero_image || ''}
                  onChange={(e) => setContent({ ...content, hero_image: e.target.value })}
                  placeholder="Image URL for banner background"
                />
                <Button
                  variant="secondary"
                  onClick={() => setIsMediaPickerOpen(true)}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Media library
                </Button>
              </div>
              {content.hero_image && (
                <div className="mt-2 h-28 rounded-md overflow-hidden border border-[#EAE3DE]">
                  <img
                    src={content.hero_image}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Featured Books Selector */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#292326]">
                2. Choose featured books
              </h3>
              <p className="text-xs text-[#82777A]">
                Select which books from the catalogue appear prominently in the homepage spotlight ({content.featured_book_ids.length} selected)
              </p>
            </div>
            <BookOpen className="w-5 h-5 text-[#651C32]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
            {books.map((book) => {
              const isSelected = content.featured_book_ids.includes(book.id);
              return (
                <div
                  key={book.id}
                  onClick={() => toggleFeaturedBook(book.id)}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFF6D9]/50 border-[#F6E7A8] ring-1 ring-[#F6E7A8]'
                      : 'bg-white border-[#EAE3DE] hover:border-[#651C32]/40'
                  }`}
                >
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded shadow-sm border border-[#EAE3DE] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-serif font-bold text-[#292326] truncate">
                      {book.title}
                    </p>
                    <p className="text-[10px] text-[#82777A] mt-0.5 truncate">
                      ₹{book.selling_price} • {book.category_name}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="rounded text-[#651C32] focus:ring-[#651C32] accent-[#651C32] w-4 h-4"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Choose popular subjects */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#292326]">
                3. Popular Disciplines & Faculties
              </h3>
              <p className="text-xs text-[#82777A]">
                Choose primary subject disciplines highlighted for prospective students and faculty ({content.popular_categories.length} selected)
              </p>
            </div>
            <FolderTree className="w-5 h-5 text-[#651C32]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const isSelected = content.popular_categories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => togglePopularCategory(cat.id)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFF6D9]/50 border-[#F6E7A8] ring-1 ring-[#F6E7A8]'
                      : 'bg-[#FAF8F3] border-[#EAE3DE] hover:border-[#651C32]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#292326] truncate">
                      {cat.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-[#651C32] focus:ring-[#651C32] accent-[#651C32] w-3.5 h-3.5"
                    />
                  </div>
                  <span className="text-[10px] text-[#82777A] block mt-1">
                    {cat.books_count || 0} Titles
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: About Dotcom Publications & Impact Metrics */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#292326]">
                4. About Dotcom Publications & Key Metrics
              </h3>
              <p className="text-xs text-[#82777A]">
                Company mission, pedagogical philosophy, and dynamic impact counters
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-[#651C32]" />
          </div>

          <Input
            label="Section heading"
            value={content.about_title}
            onChange={(e) => setContent({ ...content, about_title: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Institutional story
            </label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] leading-relaxed transition-colors"
              value={content.about_description}
              onChange={(e) => setContent({ ...content, about_description: e.target.value })}
            />
          </div>

          {/* Dynamic Metrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider">
                Impact Metric Badges
              </label>
              <button
                type="button"
                onClick={addStat}
                className="text-xs font-semibold text-[#651C32] hover:text-[#431322] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Metric
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {content.about_stats.map((st, idx) => (
                <div key={idx} className="p-3 bg-[#FAF8F3] rounded-md border border-[#EAE3DE] relative group">
                  <Input
                    label="Value"
                    value={st.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                  />
                  <div className="mt-2">
                    <Input
                      label="Label"
                      value={st.label}
                      onChange={(e) => updateStat(idx, 'label', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    className="absolute top-2 right-2 text-[#82777A] hover:text-[#B94B4B] p-1"
                    title="Remove statistic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Contact Information & Public Footer */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#292326]">
                5. Contact Information & Footer Content
              </h3>
              <p className="text-xs text-[#82777A]">
                Official editorial inquiries, customer service line, and legal copyright text
              </p>
            </div>
            <Mail className="w-5 h-5 text-[#651C32]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact email"
              type="email"
              value={content.contact_email}
              onChange={(e) => setContent({ ...content, contact_email: e.target.value })}
            />
            <Input
              label="Contact phone"
              value={content.contact_phone}
              onChange={(e) => setContent({ ...content, contact_phone: e.target.value })}
            />
          </div>

          <Input
            label="Head office address"
            value={content.contact_address}
            onChange={(e) => setContent({ ...content, contact_address: e.target.value })}
          />

          <Input
            label="Footer and legal text"
            value={content.footer_text}
            onChange={(e) => setContent({ ...content, footer_text: e.target.value })}
          />
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-20 p-4 bg-white rounded-lg border border-[#EAE3DE] shadow-xl flex items-center justify-between">
        <span className="text-xs text-[#82777A] font-medium">
          Changes will dynamically reflect on the public website upon saving.
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            loading={saving}
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setContent({ ...content, hero_image: url })}
        currentUrl={content.hero_image || ''}
        categoryFilter="banners"
      />

      {/* Public Landing Preview Modal */}
      <LandingPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={content}
        books={books}
        categories={categories}
      />
    </div>
  );
};
