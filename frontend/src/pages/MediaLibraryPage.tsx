import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Upload,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Filter,
  Eye
} from 'lucide-react';

export const MediaLibraryPage: React.FC = () => {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Selected item for preview modal
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  // Item to delete
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('covers');

  useEffect(() => {
    loadMedia();
  }, [search, category]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getMediaItems(search.trim() || undefined, category !== 'all' ? category : undefined);
      setItems(data);
    } catch {
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await api.uploadMedia(file, uploadCategory);
      toast.success('Asset Uploaded', `"${file.name}" saved to ${uploadCategory} gallery`);
      setIsUploadModalOpen(false);
      loadMedia();
    } catch (err: any) {
      toast.error('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL Copied', 'Asset URL copied to clipboard');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteMedia(itemToDelete.id);
      toast.success('Asset Deleted', `"${itemToDelete.original_name}" removed`);
      setItemToDelete(null);
      loadMedia();
    } catch (err: any) {
      toast.error('Failed to delete asset', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal-900 tracking-tight">
            Centralized Media Library
          </h2>
          <p className="text-xs text-charcoal-500">
            {items.length} high-resolution book jackets, faculty portraits, and editorial marketing imagery
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload Media Asset
        </Button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search assets by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'covers', 'authors', 'banners', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-editorial-burgundy-700 text-white shadow-subtle'
                  : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'All Assets' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Asset Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-charcoal-400">Loading media library...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-8 h-8" />}
          title="No Media Assets Found"
          description="Upload book covers, author portraits, or promotional banners to populate the library."
          actionText="Upload Asset"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-subtle overflow-hidden hover:shadow-card hover:border-editorial-burgundy-300 transition-all flex flex-col justify-between group"
            >
              <div
                onClick={() => setPreviewItem(item)}
                className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.original_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-full bg-white/90 text-charcoal-800 shadow">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-charcoal-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded capitalize">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-2.5">
                <p className="text-xs font-semibold text-charcoal-900 truncate" title={item.original_name}>
                  {item.original_name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-charcoal-400 mt-1">
                  <span>{formatFileSize(item.file_size)}</span>
                  <span>{new Date(item.created_at).toLocaleDateString('en-GB')}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="flex-1 py-1 px-1.5 rounded text-[10px] font-semibold text-editorial-burgundy-700 hover:bg-paper-100 transition-colors flex items-center justify-center gap-1"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" /> Copy URL
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1 rounded text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media Asset"
        subtitle="Select image destination category and file"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Media Asset Category"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            options={[
              { value: 'covers', label: 'Book Covers & Jackets' },
              { value: 'authors', label: 'Faculty & Author Portraits' },
              { value: 'banners', label: 'Landing Page & Hero Banners' },
              { value: 'general', label: 'General Editorial Assets' },
            ]}
          />

          <label className="border-2 border-dashed border-stone-300 hover:border-editorial-burgundy-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-paper-50/50">
            <Upload className="w-10 h-10 text-editorial-burgundy-600 mb-3" />
            <span className="text-sm font-semibold text-charcoal-800">
              {uploading ? 'Uploading asset to server...' : 'Choose image file to upload'}
            </span>
            <span className="text-xs text-charcoal-400 mt-1">Supports PNG, JPG, WebP up to 10MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </Modal>

      {/* Asset Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.original_name}
          subtitle={`Category: ${previewItem.category} • Size: ${formatFileSize(previewItem.file_size)}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-stone-100 border border-stone-200 max-h-[60vh] flex items-center justify-center">
              <img
                src={previewItem.url}
                alt={previewItem.original_name}
                className="max-h-[60vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="p-3 bg-paper-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs">
              <div className="font-mono text-charcoal-700 truncate">{previewItem.url}</div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyUrl(previewItem.url)}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy URL
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Media Asset"
        message={`Are you sure you want to permanently delete "${itemToDelete?.original_name}"? Existing book covers referencing this URL may appear blank.`}
        confirmText="Yes, Delete Asset"
        loading={deleteLoading}
      />
    </div>
  );
};
