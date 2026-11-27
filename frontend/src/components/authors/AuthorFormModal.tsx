import React, { useState, useEffect } from 'react';
import { Author } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload, User, Globe, Mail } from 'lucide-react';

interface AuthorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  authorToEdit?: Author | null;
}

export const AuthorFormModal: React.FC<AuthorFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  authorToEdit,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (authorToEdit) {
      setName(authorToEdit.name);
      setProfilePicture(authorToEdit.profile_picture || '');
      setBio(authorToEdit.bio || '');
      setEmail(authorToEdit.email || '');
      setWebsite(authorToEdit.website || '');
    } else {
      setName('');
      setProfilePicture('');
      setBio('');
      setEmail('');
      setWebsite('');
    }
    setErrors({});
  }, [authorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Author name is required' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        profile_picture: profilePicture.trim() || undefined,
        bio: bio.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
      };

      if (authorToEdit) {
        await api.updateAuthor(authorToEdit.id, payload);
        toast.success('Author Updated', `Profile for "${name}" updated successfully`);
      } else {
        await api.createAuthor(payload);
        toast.success('Author Created', `"${name}" added to Dotcom Publications authors`);
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
        title={authorToEdit ? 'Edit Faculty / Author Profile' : 'Add New Academic Author'}
        subtitle="Scholarly contributor credentials and institutional record"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Author name and titles"
            required
            placeholder="e.g. Dr. Arvind R. Subramanian, PhD"
            value={name}
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Profile Picture */}
          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Profile Portrait Photo
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#EAE3DE] bg-[#FAF8F3] shrink-0">
                {profilePicture ? (
                  <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-[#82777A] m-auto mt-3" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Image URL or choose from library"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsMediaPickerOpen(true)}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Select from Media
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Academic Biography & Research Disciplines
            </label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] transition-colors"
              placeholder="Academic appointments, research awards, university department..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact email (Optional)"
              type="email"
              icon={<Mail className="w-3.5 h-3.5 text-[#82777A]" />}
              placeholder="author@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Website (optional)"
              icon={<Globe className="w-3.5 h-3.5 text-[#82777A]" />}
              placeholder="https://scholar.org"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#EAE3DE]">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {authorToEdit ? 'Save Changes' : 'Create Author'}
            </Button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setProfilePicture(url)}
        currentUrl={profilePicture}
        categoryFilter="authors"
      />
    </>
  );
};
