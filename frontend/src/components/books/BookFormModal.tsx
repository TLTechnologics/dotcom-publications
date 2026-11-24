import React, { useState, useEffect } from 'react';
import { Book, BookFormData, Author, Category, Publisher } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { BookPreviewModal } from './BookPreviewModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
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
  Image as ImageIcon,
  Building2,
  FolderTree,
  Book as BookIcon,
  Globe,
  Tag,
  Layers,
  Clock,
  Sparkles
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
  onRefreshCategories?: () => void;
  onRefreshPublishers?: () => void;
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
  onRefreshCategories,
  onRefreshPublishers,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Local state for publishers and categories for instant live insertion
  const [localPublishers, setLocalPublishers] = useState<Publisher[]>(publishers);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  useEffect(() => {
    setLocalPublishers(publishers);
  }, [publishers]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

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
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleRequestClose = () => {
    if (formData.title.trim().length > 0 && !loading) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Quick author create state
  const [showAuthorDrawer, setShowAuthorDrawer] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [authorCreating, setAuthorCreating] = useState(false);

  // Quick publisher imprint create state
  const [showPublisherDrawer, setShowPublisherDrawer] = useState(false);
  const [newPublisherName, setNewPublisherName] = useState('');
  const [newPublisherDescription, setNewPublisherDescription] = useState('');
  const [newPublisherEmail, setNewPublisherEmail] = useState('');
  const [newPublisherWebsite, setNewPublisherWebsite] = useState('');
  const [publisherCreating, setPublisherCreating] = useState(false);

  // Quick category & discipline create state
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState<number | undefined>(undefined);
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryCreating, setCategoryCreating] = useState(false);

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
  const selectedCategoryObj = localCategories.find((c) => c.id === Number(formData.category_id));
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

  // Quick publisher imprint creation
  const handleQuickCreatePublisher = async () => {
    if (!newPublisherName.trim()) return;
    setPublisherCreating(true);
    try {
      const created = await api.createPublisher({
        name: newPublisherName.trim(),
        description: newPublisherDescription.trim() || undefined,
        email: newPublisherEmail.trim() || undefined,
        website: newPublisherWebsite.trim() || undefined,
      });
      toast.success('Publisher Created', `"${created.name}" registered and selected`);
      setLocalPublishers((prev) => [...prev, created]);
      setFormData((prev) => ({
        ...prev,
        publisher_id: created.id,
      }));
      onRefreshPublishers?.();
      setNewPublisherName('');
      setNewPublisherDescription('');
      setNewPublisherEmail('');
      setNewPublisherWebsite('');
      setShowPublisherDrawer(false);
    } catch (err: any) {
      toast.error('Could not create publisher imprint', err.message);
    } finally {
      setPublisherCreating(false);
    }
  };

  // Quick category & discipline creation
  const handleQuickCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategoryCreating(true);
    try {
      const slug =
        newCategorySlug.trim() ||
        newCategoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const created = await api.createCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDescription.trim() || undefined,
        parent_id: newCategoryParentId ? Number(newCategoryParentId) : null,
      });
      toast.success('Discipline Created', `"${created.name}" created and selected`);

      // Refresh categories list from backend to maintain hierarchical tree
      const updatedCats = await api.getCategories(false);
      setLocalCategories(updatedCats);

      if (newCategoryParentId) {
        setFormData((prev) => ({
          ...prev,
          category_id: Number(newCategoryParentId),
          subcategory_id: created.id,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          category_id: created.id,
          subcategory_id: undefined,
        }));
      }

      onRefreshCategories?.();
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryParentId(undefined);
      setNewCategoryDescription('');
      setShowCategoryDrawer(false);
    } catch (err: any) {
      toast.error('Could not create category', err.message);
    } finally {
      setCategoryCreating(false);
    }
  };

  const previewMockBook: Book = {
    id: bookToEdit?.id || 9999,
    ...formData,
    publisher_name: localPublishers.find((p) => p.id === Number(formData.publisher_id))?.name,
    category_name: localCategories.find((c) => c.id === Number(formData.category_id))?.name,
    subcategory_name: availableSubcategories.find((s) => s.id === Number(formData.subcategory_id))?.name,
    authors: authors.filter((a) => formData.author_ids.includes(a.id)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleRequestClose}
        title={bookToEdit ? `Edit Monograph: ${bookToEdit.title}` : 'Add New Academic Title'}
        subtitle="Catalogue Entry & Metadata Specifications"
        size="full"
      >
        {/* Section Navigation Tabs */}
        <div className="flex border-b border-[#EAE3DE] overflow-x-auto touch-scroll-x gap-2 pb-2.5 mb-6 scrollbar-none">
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
              className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-[#651C32] text-white shadow-subtle'
                  : 'text-[#292326] hover:bg-[#FFF6D9] hover:text-[#431322]'
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
              <div className="p-4 rounded-xl bg-[#FFF6D9] border border-[#F6E7A8] mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#431322]">
                  Section A: Core Title & Overview
                </h4>
                <p className="text-xs text-[#651C32] mt-0.5">
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
                <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                  Short Description / Executive Summary
                </label>
                <textarea
                  rows={2}
                  className="block w-full rounded-xl border border-[#EAE3DE] bg-white text-sm text-[#292326] placeholder-[#82777A]/70 p-3 focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32]"
                  placeholder="Brief synopsis for catalogue cards and search results..."
                  value={formData.short_description || ''}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                  Full Monograph Description / Table of Contents Overview
                </label>
                <textarea
                  rows={5}
                  className="block w-full rounded-xl border border-[#EAE3DE] bg-white text-sm text-[#292326] placeholder-[#82777A]/70 p-3 focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] leading-relaxed"
                  placeholder="Complete academic synopsis, target readership, syllabus coverage, and pedagogical features..."
                  value={formData.full_description || ''}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                />
              </div>

              {/* Cover Image Upload / Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-2">
                  Book Cover Image
                </label>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-[#EAE3DE] bg-[#FAF8F3]">
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-[#EAE3DE] bg-white flex items-center justify-center shrink-0 shadow-subtle">
                    {formData.cover_image ? (
                      <img
                        src={formData.cover_image}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#82777A]" />
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
                          className="text-xs text-[#B94B4B] hover:underline font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#82777A]">
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
              <div className="p-4 rounded-xl bg-[#FFF6D9] border border-[#F6E7A8] mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#431322]">
                    Section B: Author Information
                  </h4>
                  <p className="text-xs text-[#651C32] mt-0.5">
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
                <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-2">
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
                            ? 'bg-[#FFF6D9] border-[#F6E7A8] ring-1 ring-[#F6E7A8]'
                            : 'bg-white border-[#EAE3DE] hover:border-[#651C32]'
                        }`}
                      >
                        <img
                          src={
                            author.profile_picture ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                          }
                          alt={author.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#EAE3DE]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#292326] truncate">
                            {author.name}
                          </p>
                          <p className="text-[11px] text-[#82777A] truncate">
                            {author.bio || 'Scholarly Author'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-[#651C32] focus:ring-[#651C32] w-4 h-4"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Authors Summary Badge List */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#292326] block mb-2">
                  Assigned Authors ({formData.author_ids.length}):
                </span>
                {formData.author_ids.length === 0 ? (
                  <p className="text-xs text-[#82777A] italic">No authors currently selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {authors
                      .filter((a) => formData.author_ids.includes(a.id))
                      .map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#F5E6EA] text-[#651C32] border border-[#8B4055]/30"
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
                            className="hover:text-[#431322]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick Author Drawer */}
              {showAuthorDrawer && (
                <div className="p-4 rounded-xl border border-[#F6E7A8] bg-[#FFF6D9]/70 mt-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#431322]">
                      Quick Add Author Without Leaving Form
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAuthorDrawer(false)}
                      className="text-[#82777A] hover:text-[#292326]"
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
                    <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1">
                      Brief Biography
                    </label>
                    <textarea
                      rows={2}
                      className="w-full text-xs rounded-xl border border-[#EAE3DE] bg-white p-2.5 focus:outline-none focus:ring-2 focus:ring-[#651C32]"
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
              <div className="p-4 rounded-xl bg-[#FFF6D9] border border-[#F6E7A8] mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#431322]">
                  Section C: Publication Details & Taxonomy
                </h4>
                <p className="text-xs text-[#651C32] mt-0.5">
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
                {/* Publisher Selection with New Imprint Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider">
                      Publisher Imprint
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPublisherDrawer(!showPublisherDrawer)}
                      className="text-xs font-semibold text-[#651C32] hover:text-[#431322] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Imprint
                    </button>
                  </div>
                  <Select
                    placeholder="Select publisher press"
                    value={formData.publisher_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher_id: Number(e.target.value) })
                    }
                    options={localPublishers.map((p) => ({
                      value: p.id,
                      label: p.name,
                      subtitle: p.address ? `Imprint location: ${p.address}` : (p.description || 'Publishing Imprint'),
                      icon: <Building2 className="w-4 h-4" />,
                      badge: p.books_count !== undefined ? `${p.books_count} titles` : undefined,
                    }))}
                  />
                </div>

                <Select
                  label="Book Format"
                  value={formData.book_format}
                  onChange={(e) => setFormData({ ...formData, book_format: e.target.value })}
                  options={[
                    { value: 'Paperback', label: 'Paperback', subtitle: 'Standard flexible trade binding', icon: <BookIcon className="w-4 h-4" /> },
                    { value: 'Hardcover', label: 'Hardcover', subtitle: 'Stiff board binding with dust jacket', icon: <BookOpen className="w-4 h-4" /> },
                    { value: 'E-Book', label: 'E-Book / Digital Monograph', subtitle: 'Searchable PDF & EPUB publication', icon: <FileText className="w-4 h-4" /> },
                    { value: 'Box Set', label: 'Multi-Volume Box Set', subtitle: 'Complete collection boxed edition', icon: <Layers className="w-4 h-4" /> },
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

              {/* Quick Publisher Creation Card Drawer */}
              {showPublisherDrawer && (
                <div className="p-4 rounded-xl border border-[#F6E7A8] bg-[#FFF6D9]/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#F6E7A8]/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#651C32]" />
                      <span className="text-xs font-bold text-[#431322]">
                        Create Publisher Imprint Without Leaving
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPublisherDrawer(false)}
                      className="text-[#82777A] hover:text-[#292326] p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Publisher Imprint Name *"
                      placeholder="e.g. Dotcom Academic Press"
                      value={newPublisherName}
                      onChange={(e) => setNewPublisherName(e.target.value)}
                    />
                    <Input
                      label="Contact Email (Optional)"
                      placeholder="editorial@press.org"
                      value={newPublisherEmail}
                      onChange={(e) => setNewPublisherEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Editorial Specialty / Description"
                      placeholder="e.g. Higher education, research monographs, STEM"
                      value={newPublisherDescription}
                      onChange={(e) => setNewPublisherDescription(e.target.value)}
                    />
                    <Input
                      label="Official Website (Optional)"
                      placeholder="https://press.example.org"
                      value={newPublisherWebsite}
                      onChange={(e) => setNewPublisherWebsite(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPublisherDrawer(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={publisherCreating}
                      onClick={handleQuickCreatePublisher}
                      disabled={!newPublisherName.trim()}
                    >
                      Save & Select Imprint
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Selection with New Discipline Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider">
                      Primary Discipline / Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryDrawer(!showCategoryDrawer)}
                      className="text-xs font-semibold text-[#651C32] hover:text-[#431322] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Discipline
                    </button>
                  </div>
                  <Select
                    placeholder="Select category"
                    value={formData.category_id || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        category_id: Number(e.target.value),
                        subcategory_id: undefined,
                      });
                    }}
                    options={localCategories.map((c) => ({
                      value: c.id,
                      label: c.name,
                      subtitle: c.description || (c.subcategories?.length ? `${c.subcategories.length} sub-disciplines` : 'Primary Discipline'),
                      icon: <FolderTree className="w-4 h-4" />,
                      badge: c.subcategories?.length ? `${c.subcategories.length} sub` : undefined,
                    }))}
                  />
                </div>

                <Select
                  label="Subcategory / Specialisation"
                  placeholder="Select subcategory (optional)"
                  value={formData.subcategory_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory_id: Number(e.target.value) })
                  }
                  options={availableSubcategories.map((s) => ({
                    value: s.id,
                    label: s.name,
                    subtitle: selectedCategoryObj ? `Subfield of ${selectedCategoryObj.name}` : undefined,
                    icon: <Tag className="w-4 h-4" />,
                  }))}
                  disabled={availableSubcategories.length === 0}
                />

                <Select
                  label="Language of Publication"
                  value={formData.language || 'English'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  options={[
                    { value: 'English', label: 'English', subtitle: 'Standard Academic Editorial Medium', icon: <Globe className="w-4 h-4" /> },
                    { value: 'Hindi', label: 'Hindi (हिंदी)', subtitle: 'Devanagari Script', icon: <Globe className="w-4 h-4" /> },
                    { value: 'Sanskrit', label: 'Sanskrit (संस्कृतम्)', subtitle: 'Classical Vedic & Literary Corpus', icon: <Globe className="w-4 h-4" /> },
                    { value: 'Bilingual', label: 'Bilingual (English + Hindi)', subtitle: 'Dual-Language Scholarly Edition', icon: <Globe className="w-4 h-4" /> },
                    { value: 'French', label: 'French (Français)', subtitle: 'European Humanities & Philosophy', icon: <Globe className="w-4 h-4" /> },
                    { value: 'German', label: 'German (Deutsch)', subtitle: 'Academic & Scientific Translation', icon: <Globe className="w-4 h-4" /> },
                  ]}
                />
              </div>

              {/* Quick Category & Discipline Creation Card Drawer */}
              {showCategoryDrawer && (
                <div className="p-4 rounded-xl border border-[#F6E7A8] bg-[#FFF6D9]/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#F6E7A8]/80 pb-2">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#651C32]" />
                      <span className="text-xs font-bold text-[#431322]">
                        Create Academic Discipline or Subcategory Without Leaving
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCategoryDrawer(false)}
                      className="text-[#82777A] hover:text-[#292326] p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Discipline / Category Name *"
                      placeholder="e.g. Cognitive Neuroscience"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Select
                      label="Parent Discipline (Optional)"
                      placeholder="None (Top-Level Primary Discipline)"
                      value={newCategoryParentId || ''}
                      onChange={(e) =>
                        setNewCategoryParentId(e.target.value ? Number(e.target.value) : undefined)
                      }
                      options={[
                        { value: '', label: 'None (Root Discipline)', subtitle: 'Independent top-level field', icon: <FolderTree className="w-4 h-4" /> },
                        ...localCategories
                          .filter((c) => !c.parent_id)
                          .map((c) => ({
                            value: c.id,
                            label: c.name,
                            subtitle: c.description || 'Parent Discipline',
                            icon: <FolderTree className="w-4 h-4" />,
                          })),
                      ]}
                      helper="Select parent if creating a subcategory, or leave empty for a primary discipline"
                    />
                  </div>
                  <Input
                    label="Description / Curriculum Scope (Optional)"
                    placeholder="e.g. Computational models, brain imaging, and neural systems"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCategoryDrawer(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={categoryCreating}
                      onClick={handleQuickCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Save & Select Discipline
                    </Button>
                  </div>
                </div>
              )}

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
              <div className="p-4 rounded-xl bg-[#FFF6D9] border border-[#F6E7A8] mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#431322]">
                  Section D: Pricing & Commercial Terms
                </h4>
                <p className="text-xs text-[#651C32] mt-0.5">
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
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE3DE] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#292326] block">
                    Calculated Institutional Discount
                  </span>
                  <p className="text-xs text-[#82777A] mt-0.5">
                    Calculated automatically from Selling Price vs MRP.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-serif font-bold text-[#477A58]">
                    {discountPercent}% OFF
                  </span>
                  <span className="text-[10px] text-[#82777A] block">
                    Savings: ₹{(formData.mrp - formData.selling_price > 0 ? formData.mrp - formData.selling_price : 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION E — PUBLISHING OPTIONS */}
          {activeSection === 'E' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-[#FFF6D9] border border-[#F6E7A8] mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#431322]">
                  Section E: Publication Status, Visibility & SEO
                </h4>
                <p className="text-xs text-[#651C32] mt-0.5">
                  Configure live status, availability in warehouses, and search engine metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Publication Status Toggle */}
                <div className="p-4 rounded-xl border border-[#EAE3DE] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#292326] block">
                      Publication Mode
                    </span>
                    <p className="text-xs text-[#82777A] mt-0.5">
                      {formData.is_draft
                        ? 'Draft — Hidden from public catalogue'
                        : 'Published — Visible in public catalogue'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_draft: !formData.is_draft })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      !formData.is_draft ? 'bg-[#477A58]' : 'bg-[#F6E7A8]'
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
                <div className="p-4 rounded-xl border border-[#EAE3DE] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#292326] block">
                      Featured Monograph
                    </span>
                    <p className="text-xs text-[#82777A] mt-0.5">
                      Showcase prominently on homepage & highlights
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.is_featured ? 'bg-[#651C32]' : 'bg-[#EAE3DE]'
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
                    { value: 'in_stock', label: 'In Stock (Ready to dispatch)', subtitle: 'Stored in central academic repository', icon: <CheckCircle className="w-4 h-4" /> },
                    { value: 'out_of_stock', label: 'Out of Stock (Reprint scheduled)', subtitle: 'Awaiting next press run', icon: <Clock className="w-4 h-4" /> },
                    { value: 'pre_order', label: 'Pre-Order / Advance Reservation', subtitle: 'Accept advance institutional reservations', icon: <Sparkles className="w-4 h-4" /> },
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
                <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                  Search Engine Meta Description (SEO)
                </label>
                <textarea
                  rows={2}
                  className="block w-full rounded-xl border border-[#EAE3DE] bg-white text-sm text-[#292326] placeholder-[#82777A]/70 p-3 focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32]"
                  placeholder="Search snippet summary for Google scholar and indexing robots..."
                  value={formData.seo_description || ''}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Save as Draft, Preview, Publish Book */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#EAE3DE] bg-[#FAF8F3] p-3 sm:p-4 rounded-2xl">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full sm:w-auto min-h-[44px]"
            icon={<Eye className="w-4 h-4" />}
          >
            Preview Presentation
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRequestClose}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={loading}
              onClick={() => handleSave(true)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={loading}
              onClick={() => handleSave(false)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Publish Book
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this monograph catalogue entry. Discarding will lose any changes you have made."
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        isDestructive={true}
      />

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
