import React, { useEffect, useState } from 'react';
import { Author, Book } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { Mail, Globe, BookOpen, ExternalLink } from 'lucide-react';

interface AuthorDetailModalProps {
  author: Author | null;
  isOpen: boolean;
  onClose: () => void;
  onBookClick?: (book: Book) => void;
}

export const AuthorDetailModal: React.FC<AuthorDetailModalProps> = ({
  author,
  isOpen,
  onClose,
  onBookClick,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (author && isOpen) {
      loadAuthorBooks();
    }
  }, [author, isOpen]);

  const loadAuthorBooks = async () => {
    if (!author) return;
    setLoading(true);
    try {
      const res = await api.getBooks({ author_id: author.id, limit: 50 });
      setBooks(res.items);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!author) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={author.name}
      subtitle="Faculty Member & Author Bibliography"
      size="lg"
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl bg-paper-100 border border-stone-200">
          <img
            src={
              author.profile_picture ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt={author.name}
            className="w-20 h-20 rounded-xl object-cover border border-stone-300 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-serif font-bold text-charcoal-900">{author.name}</h3>
            {author.bio && (
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{author.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-stone-200/60 text-xs text-charcoal-600">
              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="flex items-center gap-1.5 hover:text-editorial-burgundy-700"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{author.email}</span>
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-editorial-burgundy-700"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate">{author.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Associated Books */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
              Published Works in Dotcom Catalogue ({books.length})
            </h4>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal-400">Loading bibliography...</div>
          ) : books.length === 0 ? (
            <div className="p-6 text-center text-xs text-charcoal-400 bg-stone-50 rounded-xl border border-stone-200">
              No books currently linked to this author.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {books.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    onClose();
                    onBookClick?.(b);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-editorial-burgundy-300 hover:bg-paper-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                      alt={b.title}
                      className="w-10 h-14 object-cover rounded shadow-sm shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-charcoal-900 group-hover:text-editorial-burgundy-700 truncate">
                        {b.title}
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        ISBN: {b.isbn || 'N/A'} • {b.edition || '1st Ed.'} • {b.publication_year || '2026'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-serif font-bold text-charcoal-800">
                      ₹{b.selling_price.toLocaleString('en-IN')}
                    </span>
                    <Badge variant={b.is_draft ? 'draft' : 'published'}>
                      {b.is_draft ? 'Draft' : 'Published'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
