import React, { useState, useEffect } from 'react';
import { Publisher } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PublisherFormModal } from '../components/publishers/PublisherFormModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  BookOpen
} from 'lucide-react';

interface PublishersPageProps {
  onRefreshStats?: () => void;
}

export const PublishersPage: React.FC<PublishersPageProps> = ({ onRefreshStats }) => {
  const toast = useToast();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [publisherToEdit, setPublisherToEdit] = useState<Publisher | null>(null);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadPublishers();
  }, [search]);

  const loadPublishers = async () => {
    setLoading(true);
    try {
      const data = await api.getPublishers(search.trim() || undefined);
      setPublishers(data);
    } catch {
      toast.error('Failed to load publishers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!publisherToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deletePublisher(publisherToDelete.id);
      toast.success('Publisher Deleted', `"${publisherToDelete.name}" removed from imprints`);
      setPublisherToDelete(null);
      loadPublishers();
      onRefreshStats?.();
    } catch (err: any) {
      toast.error('Failed to delete publisher', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal-900 tracking-tight">
            Publisher Imprints & Presses
          </h2>
          <p className="text-xs text-charcoal-500">
            {publishers.length} scholarly imprints, university presses, and co-publishing partners
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setPublisherToEdit(null);
            setIsFormOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Publisher Imprint
        </Button>
      </div>

      {/* Search Header */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-subtle flex items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search imprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Publishers Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-charcoal-400">Loading publishers...</div>
      ) : publishers.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No Publishers Registered"
          description="Register academic publishers and imprints to associate monographs."
          actionText="Add Publisher"
          onAction={() => {
            setPublisherToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishers.map((pub) => (
            <div
              key={pub.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-subtle hover:shadow-card hover:border-editorial-burgundy-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {pub.logo_url ? (
                    <img
                      src={pub.logo_url}
                      alt={pub.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-paper-200 text-charcoal-700 flex items-center justify-center shrink-0 border border-stone-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-serif font-bold text-charcoal-900 group-hover:text-editorial-burgundy-700 truncate">
                      {pub.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-charcoal-500">
                      <BookOpen className="w-3.5 h-3.5 text-editorial-burgundy-600" />
                      <span className="font-semibold text-charcoal-800">{pub.books_count || 0}</span>
                      <span>Titles in Catalogue</span>
                    </div>
                  </div>
                </div>

                {pub.description && (
                  <p className="text-xs text-charcoal-600 mt-3 line-clamp-3 leading-relaxed">
                    {pub.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-charcoal-500">
                  {pub.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
                      <span className="truncate">{pub.email}</span>
                    </div>
                  )}
                  {pub.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
                      <span>{pub.phone}</span>
                    </div>
                  )}
                  {pub.address && (
                    <div className="flex items-start gap-2 text-[11px] leading-tight text-charcoal-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-charcoal-400 mt-0.5" />
                      <span className="line-clamp-2">{pub.address}</span>
                    </div>
                  )}
                  {pub.website && (
                    <div className="flex items-center gap-2 truncate pt-1">
                      <Globe className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
                      <a
                        href={pub.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-editorial-burgundy-700 hover:underline"
                      >
                        {pub.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setPublisherToEdit(pub);
                    setIsFormOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-stone-100 transition-colors"
                  title="Edit Publisher"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPublisherToDelete(pub)}
                  className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Publisher"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publisher Form Modal */}
      <PublisherFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPublisherToEdit(null);
        }}
        onSuccess={() => {
          loadPublishers();
          onRefreshStats?.();
        }}
        publisherToEdit={publisherToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!publisherToDelete}
        onClose={() => setPublisherToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Publisher Imprint"
        message={`Are you sure you want to delete "${publisherToDelete?.name}"? Publications associated with this imprint will need an updated publisher.`}
        confirmText="Yes, Delete Publisher"
        loading={deleteLoading}
      />
    </div>
  );
};
