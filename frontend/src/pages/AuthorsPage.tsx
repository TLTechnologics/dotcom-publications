import React, { useState, useEffect } from 'react';
import { Author, Book } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AuthorFormModal } from '../components/authors/AuthorFormModal';
import { AuthorDetailModal } from '../components/authors/AuthorDetailModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Mail,
  Globe,
  ExternalLink
} from 'lucide-react';

interface AuthorsPageProps {
  onRefreshStats?: () => void;
  onViewBook?: (book: Book) => void;
}

export const AuthorsPage: React.FC<AuthorsPageProps> = ({ onRefreshStats, onViewBook }) => {
  const toast = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorToEdit, setAuthorToEdit] = useState<Author | null>(null);
  const [authorToView, setAuthorToView] = useState<Author | null>(null);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAuthors();
  }, [search]);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const data = await api.getAuthors(search.trim() || undefined);
      setAuthors(data);
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!authorToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteAuthor(authorToDelete.id);
      toast.success('Author Removed', `Profile for "${authorToDelete.name}" has been deleted`);
      setAuthorToDelete(null);
      loadAuthors();
      onRefreshStats?.();
    } catch (err: any) {
      toast.error('Failed to delete author', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-charcoal-900 tracking-tight">
            Academic Faculty & Authors Registry
          </h2>
          <p className="text-xs text-charcoal-500">
            {authors.length} scholars, researchers, and editorial contributors
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setAuthorToEdit(null);
            setIsFormOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Author
        </Button>
      </div>

      {/* Search Header */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-subtle flex items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search scholars by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-charcoal-400">Loading authors registry...</div>
      ) : authors.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Authors Registered"
          description="No authors match your search criteria. Create a new author profile to begin associating monographs."
          actionText="Add New Author"
          onAction={() => {
            setAuthorToEdit(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-subtle hover:shadow-card hover:border-editorial-burgundy-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      author.profile_picture ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                    }
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border border-stone-300 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => setAuthorToView(author)}
                      className="text-sm font-serif font-bold text-charcoal-900 group-hover:text-editorial-burgundy-700 cursor-pointer truncate"
                    >
                      {author.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-charcoal-500">
                      <BookOpen className="w-3.5 h-3.5 text-editorial-burgundy-600" />
                      <span className="font-semibold text-charcoal-800">
                        {author.books_count || 0}
                      </span>
                      <span>Volumes Authored</span>
                    </div>
                  </div>
                </div>

                {author.bio && (
                  <p className="text-xs text-charcoal-600 mt-3 line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                )}

                {/* Email / Website */}
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-charcoal-500">
                  {author.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
                      <span className="truncate">{author.email}</span>
                    </div>
                  )}
                  {author.website && (
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
                      <a
                        href={author.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-editorial-burgundy-700 hover:underline"
                      >
                        {author.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setAuthorToView(author)}
                  className="text-xs font-semibold text-editorial-burgundy-700 hover:text-editorial-burgundy-800 flex items-center gap-1"
                >
                  View Associated Works ({author.books_count || 0}) →
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setAuthorToEdit(author);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-stone-100 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAuthorToDelete(author)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Author"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Author Edit Form Modal */}
      <AuthorFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setAuthorToEdit(null);
        }}
        onSuccess={() => {
          loadAuthors();
          onRefreshStats?.();
        }}
        authorToEdit={authorToEdit}
      />

      {/* Author Detail / Associated Books Modal */}
      <AuthorDetailModal
        author={authorToView}
        isOpen={!!authorToView}
        onClose={() => setAuthorToView(null)}
        onBookClick={(book) => onViewBook?.(book)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!authorToDelete}
        onClose={() => setAuthorToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Author Profile"
        message={`Are you sure you want to delete profile for "${authorToDelete?.name}"? Books associated will remain in the catalogue.`}
        confirmText="Yes, Delete Author"
        loading={deleteLoading}
      />
    </div>
  );
};
