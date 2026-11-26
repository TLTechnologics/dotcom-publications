import React, { useState, useEffect } from 'react';
import { Upload, Search, Check, Link as LinkIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { MediaItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
  categoryFilter?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  categoryFilter,
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentUrl || '');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentUrl || '');
      loadMedia();
    }
  }, [isOpen, currentUrl]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await api.getMediaItems(search || undefined, categoryFilter);
      setItems(data);
    } catch {
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await api.uploadMedia(file, categoryFilter || 'general');
      toast.success('Asset uploaded successfully');
      setItems((prev) => [uploaded, ...prev]);
      setSelectedUrl(uploaded.url);
      setActiveTab('library');
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'url' && customUrl) {
      onSelect(customUrl);
    } else if (selectedUrl) {
      onSelect(selectedUrl);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Asset" subtitle="Choose from media library or upload a new image" size="lg">
      <div className="flex gap-2 border-b border-[#EAE3DE] pb-3 mb-4">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]'
              : 'text-[#82777A] hover:bg-[#FAF8F3]'
          }`}
        >
          Media Library ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]'
              : 'text-[#82777A] hover:bg-[#FAF8F3]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]'
              : 'text-[#82777A] hover:bg-[#FAF8F3]'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Direct URL
        </button>
      </div>

      {activeTab === 'library' && (
        <div>
          <div className="mb-4">
            <Input
              placeholder="Search assets by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-[#82777A]" />}
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#82777A]">Loading media library...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#82777A]">
              No media found. Upload an image or switch to direct URL.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto p-1">
              {items.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative aspect-[3/4] rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#651C32] ring-2 ring-[#651C32] shadow-md'
                        : 'border-[#EAE3DE] hover:border-[#651C32]/40'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-[#431322]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-[#651C32] text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#292326]/90 to-transparent p-1.5 text-left">
                      <p className="text-[10px] text-white truncate font-medium">{item.original_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="py-8">
          <label className="border-2 border-dashed border-[#EAE3DE] hover:border-[#651C32] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAF8F3]">
            <Upload className="w-10 h-10 text-[#651C32] mb-3" />
            <span className="text-sm font-medium text-[#292326]">
              {uploading ? 'Uploading asset...' : 'Click to select image file'}
            </span>
            <span className="text-xs text-[#82777A] mt-1">Supports PNG, JPG, WebP up to 10MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {activeTab === 'url' && (
        <div className="py-6 space-y-4">
          <Input
            label="Image Public URL"
            placeholder="https://example.com/cover.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            helper="Enter a direct image link (e.g. from Unsplash or public CDN)"
          />
          {customUrl && (
            <div className="flex items-center gap-4 p-3 bg-[#FAF8F3] rounded-lg border border-[#EAE3DE]">
              <img
                src={customUrl}
                alt="Preview"
                className="w-16 h-20 object-cover rounded shadow-sm border border-[#EAE3DE]"
                onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
              />
              <span className="text-xs text-[#82777A] truncate">URL preview active</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#EAE3DE]">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={activeTab === 'url' ? !customUrl : !selectedUrl}
        >
          Confirm Selection
        </Button>
      </div>
    </Modal>
  );
};
