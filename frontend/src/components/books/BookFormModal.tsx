import React, { useState, useEffect } from 'react';
import { Book, BookFormData, Author, Category, Publisher } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { BookPreviewModal } from './BookPreviewModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Upload,
  Plus,
  X,
  Eye,
  BookOpen,
  DollarSign,
  FileText,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookToEdit?: Book | null;
  authors: Author[];
  categories: Category[];
  publishers: Publisher[];
  onRefreshAuthors?: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookToEdit,
  authors,
  categories,
  publishers,
  onRefreshAuthors,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    subtitle: '',
    short_description: '',
    full_description: '',
    cover_image: '',
    additional_images: [],
    isbn: '',
    edition: '1st Edition',
    publication_year: new Date().getFullYear(),
    publisher_id: undefined,
    pages: undefined,
    language: 'English',
    book_format: 'Paperback',
    subject: '',
    category_id: undefined,
    subcategory_id: undefined,
    selling_price: 0,
    mrp: 0,
    currency: 'INR',
    is_draft: false,
    is_featured: false,
    availability_status: 'in_stock',
    seo_title: '',
    seo_description: '',
    author_ids: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Media picker modal state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'additional'>('cover');

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Quick author create state
  const [showAuthorDrawer, setShowAuthorDrawer] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [authorCreating, setAuthorCreating] = useState(false);

  // Populate data when editing
  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        subtitle: bookToEdit.subtitle || '',
        short_description: bookToEdit.short_description || '',
        full_description: bookToEdit.full_description || '',
        cover_image: bookToEdit.cover_image || '',
        additional_images: bookToEdit.additional_images || [],
        isbn: bookToEdit.isbn || '',
        edition: bookToEdit.edition || '1st Edition',
        publication_year: bookToEdit.publication_year || new Date().getFullYear(),
        publisher_id: bookToEdit.publisher_id || undefined,
        pages: bookToEdit.pages || undefined,
        language: bookToEdit.language || 'English',
        book_format: bookToEdit.book_format || 'Paperback',
        subject: bookToEdit.subject || '',
        category_id: bookToEdit.category_id || undefined,
        subcategory_id: bookToEdit.subcategory_id || undefined,
        selling_price: bookToEdit.selling_price || 0,
        mrp: bookToEdit.mrp || 0,
        currency: bookToEdit.currency || 'INR',
        is_draft: bookToEdit.is_draft,
        is_featured: bookToEdit.is_featured,
        availability_status: bookToEdit.availability_status || 'in_stock',
        seo_title: bookToEdit.seo_title || '',
        seo_description: bookToEdit.seo_description || '',
        author_ids: bookToEdit.authors ? bookToEdit.authors.map((a) => a.id) : [],
      });
    } else {
      // Default reset
      setFormData({
        title: '',
        subtitle: '',
        short_description: '',
        full_description: '',
        cover_image: '',
        additional_images: [],
        isbn: '',
        edition: '1st Edition',
        publication_year: new Date().getFullYear(),
        publisher_id: publishers[0]?.id || undefined,
        pages: undefined,
        language: 'English',
        book_format: 'Paperback',
        subject: '',
        category_id: categories[0]?.id || undefined,
        subcategory_id: undefined,
        selling_price: 0,
        mrp: 0,
        currency: 'INR',
        is_draft: false,
        is_featured: false,
        availability_status: 'in_stock',
        seo_title: '',
        seo_description: '',
        author_ids: [],
      });
    }
    setFormErrors({});
    setActiveSection('A');
  }, [bookToEdit, isOpen]);

  // Auto calculate discount percentage
  const discountPercent =
    formData.mrp && formData.mrp > formData.selling_price
      ? Math.round(((formData.mrp - formData.selling_price) / formData.mrp) * 100)
      : 0;

  // Selected category subcategories
  const selectedCategoryObj = categories.find((c) => c.id === Number(formData.category_id));
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Book title is mandatory';
    if (formData.selling_price < 0) errors.selling_price = 'Price must be non-negative';
    if (formData.mrp < 0) errors.mrp = 'MRP must be non-negative';
    if (formData.selling_price > formData.mrp && formData.mrp > 0) {
      errors.selling_price = 'Selling price should not exceed MRP';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (forceDraft?: boolean) => {
    if (!validate()) {
      toast.error('Validation Error', 'Please check required fields in all sections');
      return;
    }

    setLoading(true);
    try {
      const payload: BookFormData = {
        ...formData,
        is_draft: forceDraft !== undefined ? forceDraft : formData.is_draft,
        selling_price: Number(formData.selling_price),
        mrp: Number(formData.mrp),
        pages: formData.pages ? Number(formData.pages) : undefined,
        publication_year: formData.publication_year ? Number(formData.publication_year) : undefined,
        publisher_id: formData.publisher_id ? Number(formData.publisher_id) : undefined,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : undefined,
      };

      if (bookToEdit) {
        await api.updateBook(bookToEdit.id, payload);
        toast.success('Book Updated', `Successfully updated "${payload.title}"`);
      } else {
        await api.createBook(payload);
        toast.success(
          payload.is_draft ? 'Draft Saved' : 'Book Published',
          `"${payload.title}" has been saved in the catalogue`
        );
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Save Failed', err.message || 'Could not save book record');
    } finally {
      setLoading(false);
    }
  };

  // Quick author addition
  const handleQuickCreateAuthor = async () => {
    if (!newAuthorName.trim()) return;
    setAuthorCreating(true);
    try {
      const created = await api.createAuthor({
        name: newAuthorName.trim(),
        bio: newAuthorBio.trim(),
        email: newAuthorEmail.trim() || undefined,
      });
      toast.success('Author Created', `${created.name} added to authors registry`);
      onRefreshAuthors?.();
      setFormData((prev) => ({
        ...prev,
        author_ids: [...prev.author_ids, created.id],
      }));
      setNewAuthorName('');
      setNewAuthorBio('');
      setNewAuthorEmail('');
      setShowAuthorDrawer(false);
    } catch (err: any) {
      toast.error('Could not create author', err.message);
    } finally {
      setAuthorCreating(false);
    }
  };

  const previewMockBook: Book = {
    id: bookToEdit?.id || 9999,
    ...formData,
    publisher_name: publishers.find((p) => p.id === Number(formData.publisher_id))?.name,
    category_name: categories.find((c) => c.id === Number(formData.category_id))?.name,
    subcategory_name: availableSubcategories.find((s) => s.id === Number(formData.subcategory_id))?.name,
    authors: authors.filter((a) => formData.author_ids.includes(a.id)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={bookToEdit ? `Edit Monograph: ${bookToEdit.title}` : 'Add New Academic Title'}
        subtitle="Catalogue Entry & Metadata Specifications"
        size="full"
      >
        {/* Section Navigation Tabs */}
        <div className="flex border-b border-stone-200 overflow-x-auto gap-2 pb-2 mb-6">
          {[
            { id: 'A', label: 'Section A — Basic Information', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'B', label: 'Section B — Author Information', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'C', label: 'Section C — Publication Details', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'D', label: 'Section D — Pricing & Currency', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'E', label: 'Section E — Publishing & SEO', icon: <CheckCircle className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-editorial-burgundy-700 text-white shadow-subtle'
                  : 'text-charcoal-600 hover:bg-stone-100 hover:text-charcoal-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body Divided into 5 Defined Sections */}
        <div className="space-y-6">
          {/* SECTION A — BASIC INFORMATION */}
          {activeSection === 'A' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-paper-50 border border-stone-200/80 mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-burgundy-800">
                  Section A: Core Title & Overview
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Provide primary identification, book synopsis, cover imagery, and visual media.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Book Title"
                  required
                  placeholder="e.g. Principles of Modern Deep Learning"
                  value={formData.title}
                  error={formErrors.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="Subtitle / Monograph Sub-heading"
                  placeholder="e.g. A Rigorous Mathematical and Algorithmic Exposition"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Short Description / Executive Summary
                </label>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-stone-300 bg-white text-sm text-charcoal-900 placeholder-charcoal-400 p-3 focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500"
                  placeholder="Brief synopsis for catalogue cards and search results..."
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Full Monograph Description / Table of Contents Overview
                </label>
                <textarea
                  rows={5}
                  className="block w-full rounded-lg border border-stone-300 bg-white text-sm text-charcoal-900 placeholder-charcoal-400 p-3 focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500 leading-relaxed"
                  placeholder="Complete academic synopsis, target readership, syllabus coverage, and pedagogical features..."
                  value={formData.full_description || ''}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                />
              </div>

              {/* Cover Image Upload / Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Book Cover Image
                </label>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-paper-50/70">
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center shrink-0 shadow-sm">
                    {formData.cover_image ? (
                      <img
                        src={formData.cover_image}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-charcoal-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Image URL or choose from library below..."
                      value={formData.cover_image || ''}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setMediaTarget('cover');
                          setIsMediaPickerOpen(true);
                        }}
                        icon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Choose from Media Library / Upload
                      </Button>
                      {formData.cover_image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cover_image: '' })}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-400">
                      Standard academic book cover ratio: 1:1.5 or 2:3. Recommended: 800x1200px.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION B — AUTHOR INFORMATION */}
          {activeSection === 'B' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-paper-50 border border-stone-200/80 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-burgundy-800">
                    Section B: Author Information
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Assign lead authors, editors, and contributing scholars. Supports multi-authorship.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAuthorDrawer(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create New Author Without Leaving
                </Button>
              </div>

              {/* Multi-Select Existing Authors */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Select Contributing Authors
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {authors.map((author) => {
                    const isSelected = formData.author_ids.includes(author.id);
                    return (
                      <div
                        key={author.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              author_ids: formData.author_ids.filter((id) => id !== author.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              author_ids: [...formData.author_ids, author.id],
                            });
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-editorial-burgundy-50/70 border-editorial-burgundy-400 ring-1 ring-editorial-burgundy-300'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <img
                          src={
                            author.profile_picture ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                          }
                          alt={author.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-charcoal-900 truncate">
                            {author.name}
                          </p>
                          <p className="text-[11px] text-charcoal-500 truncate">
                            {author.bio || 'Scholarly Author'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-editorial-burgundy-700 focus:ring-editorial-burgundy-500 w-4 h-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Authors Summary Badge List */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-charcoal-700 block mb-2">
                  Assigned Authors ({formData.author_ids.length}):
                </span>
                {formData.author_ids.length === 0 ? (
                  <p className="text-xs text-charcoal-400 italic">No authors currently selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {authors
                      .filter((a) => formData.author_ids.includes(a.id))
                      .map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-editorial-burgundy-100/70 text-editorial-burgundy-900 border border-editorial-burgundy-200"
                        >
                          {a.name}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                author_ids: formData.author_ids.filter((id) => id !== a.id),
                              })
                            }
                            className="hover:text-editorial-burgundy-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick Author Drawer / Inline Form Modal */}
              {showAuthorDrawer && (
                <div className="p-4 rounded-xl border border-editorial-burgundy-200 bg-editorial-burgundy-50/50 mt-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-editorial-burgundy-900">
                      Quick Add Author Without Leaving Form
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAuthorDrawer(false)}
                      className="text-charcoal-400 hover:text-charcoal-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Author Name"
                      placeholder="e.g. Dr. Jane Doe"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                    />
                    <Input
                      label="Email (Optional)"
                      placeholder="author@university.edu"
                      value={newAuthorEmail}
                      onChange={(e) => setNewAuthorEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                      Brief Biography
                    </label>
                    <textarea
                      rows={2}
                      className="w-full text-xs rounded-lg border border-stone-300 p-2"
                      placeholder="Affiliation, department, research specialisation..."
                      value={newAuthorBio}
                      onChange={(e) => setNewAuthorBio(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAuthorDrawer(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={authorCreating}
                      onClick={handleQuickCreateAuthor}
                    >
                      Save & Attach Author
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION C — PUBLICATION DETAILS */}
          {activeSection === 'C' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-paper-50 border border-stone-200/80 mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-burgundy-800">
                  Section C: Publication Details & Taxonomy
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Academic cataloging numbers, publisher press, edition, discipline, and format.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="ISBN Number"
                  placeholder="e.g. 978-81-945621-0-4"
                  value={formData.isbn || ''}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  helper="International Standard Book Number"
                />
                <Input
                  label="Edition"
                  placeholder="e.g. 3rd Revised Edition"
                  value={formData.edition || ''}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                />
                <Input
                  label="Publication Year"
                  type="number"
                  placeholder="2026"
                  value={formData.publication_year || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, publication_year: Number(e.target.value) })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Publisher Imprint"
                  placeholder="Select publisher press"
                  value={formData.publisher_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, publisher_id: Number(e.target.value) })
                  }
                  options={publishers.map((p) => ({ value: p.id, label: p.name }))}
                />
                <Select
                  label="Book Format"
                  value={formData.book_format}
                  onChange={(e) => setFormData({ ...formData, book_format: e.target.value })}
                  options={[
                    { value: 'Paperback', label: 'Paperback' },
                    { value: 'Hardcover', label: 'Hardcover' },
                    { value: 'E-Book', label: 'E-Book / Digital Monograph' },
                    { value: 'Box Set', label: 'Multi-Volume Box Set' },
                  ]}
                />
                <Input
                  label="Number of Pages"
                  type="number"
                  placeholder="e.g. 640"
                  value={formData.pages || ''}
                  onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Primary Category / Discipline"
                  placeholder="Select category"
                  value={formData.category_id || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      category_id: Number(e.target.value),
                      subcategory_id: undefined,
                    });
                  }}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />

                <Select
                  label="Subcategory / Specialisation"
                  placeholder="Select subcategory (optional)"
                  value={formData.subcategory_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory_id: Number(e.target.value) })
                  }
                  options={availableSubcategories.map((s) => ({ value: s.id, label: s.name }))}
                  disabled={availableSubcategories.length === 0}
                />

                <Input
                  label="Language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Subject / Academic Field Tags"
                  placeholder="e.g. Machine Learning, Distributed Systems, Neural Computing"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  helper="Comma-separated keywords for scholarly cataloging"
                />
              </div>
            </div>
          )}

          {/* SECTION D — PRICING */}
          {activeSection === 'D' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-paper-50 border border-stone-200/80 mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-burgundy-800">
                  Section D: Pricing & Commercial Terms
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Set institutional selling price, MRP, and review computed academic discount rates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Selling Price (INR ₹)"
                  type="number"
                  step="0.01"
                  required
                  placeholder="1495.00"
                  value={formData.selling_price}
                  error={formErrors.selling_price}
                  onChange={(e) =>
                    setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Maximum Retail Price (MRP ₹)"
                  type="number"
                  step="0.01"
                  placeholder="1850.00"
                  value={formData.mrp}
                  error={formErrors.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Currency Code"
                  value={formData.currency}
                  disabled
                  helper="Default publication currency for Dotcom Publications"
                />
              </div>

              {/* Automatic Discount Calculation Box */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-charcoal-700 block">
                    Calculated Institutional Discount
                  </span>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Calculated automatically from Selling Price vs MRP.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-serif font-bold text-emerald-700">
                    {discountPercent}% OFF
                  </span>
                  <span className="text-[10px] text-charcoal-400 block">
                    Savings: ₹{(formData.mrp - formData.selling_price > 0 ? formData.mrp - formData.selling_price : 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION E — PUBLISHING OPTIONS */}
          {activeSection === 'E' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-paper-50 border border-stone-200/80 mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-burgundy-800">
                  Section E: Publication Status, Visibility & SEO
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Configure live status, availability in warehouses, and search engine metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Publication Status Toggle */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Publication Mode
                    </span>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      {formData.is_draft
                        ? 'Draft — Hidden from public catalogue'
                        : 'Published — Visible in public catalogue'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_draft: !formData.is_draft })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      !formData.is_draft ? 'bg-emerald-600' : 'bg-amber-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        !formData.is_draft ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Featured Monograph
                    </span>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Showcase prominently on homepage & highlights
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.is_featured ? 'bg-editorial-burgundy-700' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        formData.is_featured ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Warehouse Availability Status"
                  value={formData.availability_status}
                  onChange={(e) =>
                    setFormData({ ...formData, availability_status: e.target.value as any })
                  }
                  options={[
                    { value: 'in_stock', label: 'In Stock (Ready to dispatch)' },
                    { value: 'out_of_stock', label: 'Out of Stock (Reprint scheduled)' },
                    { value: 'pre_order', label: 'Pre-Order / Advance Reservation' },
                  ]}
                />
                <Input
                  label="Search Engine Title (SEO)"
                  placeholder="e.g. Principles of Modern Deep Learning | Dotcom Publications"
                  value={formData.seo_title || ''}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Search Engine Meta Description (SEO)
                </label>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg border border-stone-300 bg-white text-sm text-charcoal-900 placeholder-charcoal-400 p-3 focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500"
                  placeholder="Search snippet summary for Google scholar and indexing robots..."
                  value={formData.seo_description || ''}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Save as Draft, Preview, Publish Book */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 bg-stone-50/50 p-2 rounded-xl">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsPreviewOpen(true)}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview Presentation
          </Button>

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={loading}
              onClick={() => handleSave(true)}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={loading}
              onClick={() => handleSave(false)}
            >
              Publish Book
            </Button>
          </div>
        </div>
      </Modal>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (mediaTarget === 'cover') {
            setFormData({ ...formData, cover_image: url });
          }
        }}
        currentUrl={formData.cover_image}
        categoryFilter="covers"
      />

      {/* Interactive Live Book Preview Modal */}
      <BookPreviewModal
        book={previewMockBook}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};
