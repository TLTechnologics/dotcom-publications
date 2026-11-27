import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload, FolderTree } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category | null;
  parentCategories: Category[];
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
  parentCategories,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setDescription(categoryToEdit.description || '');
      setImageUrl(categoryToEdit.image_url || '');
      setParentId(categoryToEdit.parent_id || undefined);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      setParentId(undefined);
    }
    setErrors({});
  }, [categoryToEdit, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }
    if (!slug.trim()) {
      setErrors({ slug: 'Slug identifier is required' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        parent_id: parentId ? Number(parentId) : null,
      };

      if (categoryToEdit) {
        await api.updateCategory(categoryToEdit.id, payload);
        toast.success('Category Updated', `Discipline "${name}" updated successfully`);
      } else {
        await api.createCategory(payload);
        toast.success('Category Created', `"${name}" added to academic taxonomy`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={categoryToEdit ? 'Edit Discipline / Category' : 'Create Academic Discipline'}
        subtitle="Taxonomy, parent hierarchies, and catalogue classification"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category name"
            required
            placeholder="e.g. Pure & Applied Mathematics"
            value={name}
            error={errors.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <Input
            label="URL slug"
            required
            placeholder="pure-applied-mathematics"
            value={slug}
            error={errors.slug}
            onChange={(e) => setSlug(e.target.value)}
            helper="Clean URL identifier for public category browsing"
          />

          <Select
            label="Parent subject (for subcategories)"
            placeholder="None (This is a Top-Level Root Discipline)"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
            options={[
              { value: '', label: 'None (top-level subject)', subtitle: 'Independent primary academic field', icon: <FolderTree className="w-4 h-4" /> },
              ...parentCategories
                .filter((c) => !categoryToEdit || c.id !== categoryToEdit.id)
                .map((c) => ({
                  value: c.id,
                  label: c.name,
                  subtitle: c.description || (c.subcategories?.length ? `${c.subcategories.length} sub-disciplines` : 'Parent Academic Discipline'),
                  icon: <FolderTree className="w-4 h-4" />,
                  badge: c.subcategories?.length ? `${c.subcategories.length} sub` : undefined,
                })),
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Category Description & Scope
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] transition-colors"
              placeholder="Curriculum coverage, academic subjects included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Banner / Discipline Header Image
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsMediaPickerOpen(true)}
                icon={<Upload className="w-3.5 h-3.5" />}
              >
                Media
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#EAE3DE]">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {categoryToEdit ? 'Save Changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setImageUrl(url)}
        currentUrl={imageUrl}
        categoryFilter="banners"
      />
    </>
  );
};
