import React, { useState, useEffect } from 'react';
import { Publisher } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload } from 'lucide-react';

interface PublisherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  publisherToEdit?: Publisher | null;
}

export const PublisherFormModal: React.FC<PublisherFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  publisherToEdit,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (publisherToEdit) {
      setName(publisherToEdit.name);
      setLogoUrl(publisherToEdit.logo_url || '');
      setDescription(publisherToEdit.description || '');
      setEmail(publisherToEdit.email || '');
      setPhone(publisherToEdit.phone || '');
      setAddress(publisherToEdit.address || '');
      setWebsite(publisherToEdit.website || '');
    } else {
      setName('');
      setLogoUrl('');
      setDescription('');
      setEmail('');
      setPhone('');
      setAddress('');
      setWebsite('');
    }
    setErrors({});
  }, [publisherToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Publisher name is required' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        logo_url: logoUrl.trim() || undefined,
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        website: website.trim() || undefined,
      };

      if (publisherToEdit) {
        await api.updatePublisher(publisherToEdit.id, payload);
        toast.success('Publisher Updated', `Imprint "${name}" updated successfully`);
      } else {
        await api.createPublisher(payload);
        toast.success('Publisher Added', `"${name}" registered in publication presses`);
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
        title={publisherToEdit ? 'Edit Publisher Imprint' : 'Add Academic Press / Publisher'}
        subtitle="Editorial partner imprint and physical press records"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Publisher / Imprint Name"
            required
            placeholder="e.g. Dotcom Academic Imprints"
            value={name}
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Press Logo
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Description & Imprint Specialty
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] transition-colors"
              placeholder="Scholarly domain, history, peer review board..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              placeholder="editorial@press.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+91 11 4567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Physical Office / Headquarter Address"
            placeholder="Institutional Area, Greater Noida..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Official Website"
            placeholder="https://press.example.org"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#EAE3DE]">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {publisherToEdit ? 'Save Changes' : 'Create Publisher'}
            </Button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setLogoUrl(url)}
        currentUrl={logoUrl}
        categoryFilter="banners"
      />
    </>
  );
};
