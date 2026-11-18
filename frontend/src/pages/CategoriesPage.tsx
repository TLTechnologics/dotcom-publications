import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FolderTree,
  Search,
  Plus,
  Edit2,
  Trash2,
  CornerDownRight
} from 'lucide-react';

interface CategoriesPageProps {
  onRefreshStats?: () => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onRefreshStats }) => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [search]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const [hierarchical, flat] = await Promise.all([
        api.getCategories(false, search.trim() || undefined),
        api.getCategories(true),
      ]);
      setCategories(hierarchical);
      setFlatCategories(flat);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteCategory(categoryToDelete.id);
      toast.success('Category Deleted', `Discipline "${categoryToDelete.name}" removed`);
      setCategoryToDelete(null);
      loadCategories();
      onRefreshStats?.();
    } catch (err: any) {
      toast.error('Failed to delete category', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#292326] tracking-tight">
            Disciplines & Categories Taxonomy
          </h2>
          <p className="text-xs text-[#82777A]">
            Hierarchical academic knowledge classifications, syllabi, and research clusters
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setCategoryToEdit(null);
            setIsFormOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Discipline / Category
        </Button>
      </div>

      {/* Search Header */}
      <div className="p-4 bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle flex items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search disciplines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#82777A]" />}
          />
        </div>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#82777A]">Loading disciplines...</div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="w-8 h-8" />}
          title="No Categories Configured"
          description="Create primary disciplines and subcategories to organise the Dotcom Publications library."
          actionText="Create Category"
          onAction={() => {
            setCategoryToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {categories.map((parent) => (
            <div
              key={parent.id}
              className="bg-white rounded-2xl border border-[#EAE3DE] shadow-subtle overflow-hidden"
            >
              {/* Parent Category Header */}
              <div className="p-4 sm:p-5 bg-[#FAF8F3] border-b border-[#EAE3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  {parent.image_url ? (
                    <img
                      src={parent.image_url}
                      alt={parent.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#EAE3DE] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8] flex items-center justify-center shrink-0">
                      <FolderTree className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-serif font-bold text-[#292326] truncate">
                        {parent.name}
                      </h3>
                      <span className="text-[10px] bg-[#FAF8F3] text-[#82777A] font-mono px-2 py-0.5 rounded-md border border-[#EAE3DE]">
                        /{parent.slug}
                      </span>
                    </div>
                    {parent.description && (
                      <p className="text-xs text-[#82777A] line-clamp-1 mt-0.5">
                        {parent.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#292326] block">
                      {parent.books_count || 0} Titles
                    </span>
                    <span className="text-[10px] text-[#82777A]">
                      {parent.subcategories?.length || 0} Subcategories
                    </span>
                  </div>

                  <div className="flex items-center gap-1 border-l border-[#EAE3DE] pl-3">
                    <button
                      onClick={() => {
                        setCategoryToEdit(parent);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#82777A] hover:text-[#292326] hover:bg-[#FFF6D9] transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(parent)}
                      className="p-1.5 rounded-lg text-[#82777A] hover:text-[#B94B4B] hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              {parent.subcategories && parent.subcategories.length > 0 ? (
                <div className="divide-y divide-[#EAE3DE] px-4 py-1">
                  {parent.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-3 px-2 flex items-center justify-between hover:bg-[#FFF6D9]/40 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CornerDownRight className="w-4 h-4 text-[#651C32] shrink-0 ml-2" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-[#292326] group-hover:text-[#651C32]">
                            {sub.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#82777A] ml-2">
                            {sub.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-[#82777A]">
                          {sub.books_count || 0} titles
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setCategoryToEdit(sub);
                              setIsFormOpen(true);
                            }}
                            className="p-1 rounded-md text-[#82777A] hover:text-[#292326] hover:bg-[#FFF6D9]"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(sub)}
                            className="p-1 rounded-md text-[#82777A] hover:text-[#B94B4B] hover:bg-rose-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-[11px] text-[#82777A] bg-[#FAF8F3]">
                  No subcategories assigned yet to this discipline.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCategoryToEdit(null);
        }}
        onSuccess={() => {
          loadCategories();
          onRefreshStats?.();
        }}
        categoryToEdit={categoryToEdit}
        parentCategories={flatCategories.filter((c) => !c.parent_id)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Discipline Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Subcategories and associated books will need reassignment.`}
        confirmText="Yes, Delete Category"
        loading={deleteLoading}
      />
    </div>
  );
};
