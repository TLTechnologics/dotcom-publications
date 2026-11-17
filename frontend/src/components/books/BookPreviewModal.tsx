import React from 'react';
import { Book } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { BookOpen, Calendar, Building, Globe, Hash, CheckCircle, ExternalLink } from 'lucide-react';

interface BookPreviewModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({ book, isOpen, onClose }) => {
  if (!book) return null;

  const discountPercent =
    book.mrp && book.mrp > book.selling_price
      ? Math.round(((book.mrp - book.selling_price) / book.mrp) * 100)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catalogue Book Preview"
      subtitle="Public-facing preview presentation for Dotcom Publications"
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-2">
        {/* Cover Column */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative w-full aspect-[2/3] max-w-[260px] rounded-xl overflow-hidden shadow-2xl border border-stone-200 bg-stone-100 group">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-charcoal-400 bg-paper-100">
                <BookOpen className="w-12 h-12 stroke-[1.2] mb-2" />
                <span className="text-xs font-serif">No Cover Image</span>
              </div>
            )}
            {book.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge variant="featured">Featured Scholarly Title</Badge>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Badge variant={book.is_draft ? 'draft' : 'published'}>
              {book.is_draft ? 'Draft Catalogue Entry' : 'Live / Published'}
            </Badge>
            <Badge variant={book.availability_status}>
              {book.availability_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Details Column */}
        <div className="md:col-span-8 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-editorial-burgundy-700 uppercase tracking-wider">
              <span>{book.category_name || 'Academic Series'}</span>
              {book.subcategory_name && <span>• {book.subcategory_name}</span>}
            </div>

            <h2 className="text-2xl font-serif font-bold text-charcoal-900 mt-1 leading-snug">
              {book.title}
            </h2>

            {book.subtitle && (
              <p className="text-sm text-charcoal-600 font-serif italic mt-1">{book.subtitle}</p>
            )}

            {/* Authors */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100">
              <span className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold">
                Authors:
              </span>
              <div className="flex flex-wrap gap-2">
                {book.authors && book.authors.length > 0 ? (
                  book.authors.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200"
                    >
                      {a.profile_picture && (
                        <img
                          src={a.profile_picture}
                          alt={a.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      {a.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-charcoal-400 italic">No author assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-paper-100 border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-semibold block">
                Publisher Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-serif font-bold text-charcoal-900">
                  ₹{book.selling_price.toLocaleString('en-IN')}
                </span>
                {book.mrp > book.selling_price && (
                  <span className="text-sm text-charcoal-400 line-through">
                    ₹{book.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {discountPercent}% Institutional Savings
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-charcoal-500 block">Currency</span>
              <span className="text-xs font-semibold text-charcoal-800">INR (₹)</span>
            </div>
          </div>

          {/* Synopsis */}
          {book.short_description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Executive Overview
              </h4>
              <p className="text-xs text-charcoal-700 leading-relaxed bg-white p-3 rounded-lg border border-stone-100">
                {book.short_description}
              </p>
            </div>
          )}

          {book.full_description && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Monograph Description
              </h4>
              <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-4">
                {book.full_description}
              </p>
            </div>
          )}

          {/* Metadata Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">ISBN</span>
              <span className="font-mono text-charcoal-800 mt-0.5 block truncate">
                {book.isbn || 'Pending'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Format</span>
              <span className="font-medium text-charcoal-800 mt-0.5 block">{book.book_format}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Pages</span>
              <span className="font-medium text-charcoal-800 mt-0.5 block">
                {book.pages ? `${book.pages} pp.` : 'N/A'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Edition</span>
              <span className="font-medium text-charcoal-800 mt-0.5 block truncate">
                {book.edition || '1st Edition'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
