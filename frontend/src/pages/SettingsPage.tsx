import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MediaPickerModal } from '../components/media/MediaPickerModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Save,
  Building,
  Mail,
  Share2,
  Sliders,
  Upload,
  ShieldCheck,
  AlertTriangle,
  Coins,
  KeyRound,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    company_name: 'Dotcom Publications',
    logo_url: '',
    description: 'Educational and Academic Book Publisher',
    contact_email: 'contact@dotcompublications.com',
    phone: '+91 11 4567 8900',
    address: 'Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India',
    social_links: {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: '',
    },
    currency: 'INR',
    catalogue_download_url: '',
    maintenance_mode: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!oldPassword || !newPassword) {
      setPasswordError('Please provide both current and new passwords.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      toast.success('Password updated', 'Your administrator password has been securely changed.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      toast.success('Settings saved', 'Global platform parameters updated successfully');
    } catch (err: any) {
      toast.error('Failed to save settings', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#82777A]">Loading system settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-serif font-bold text-[#292326] tracking-tight">
          Publishing house settings
        </h2>
        <p className="text-xs text-[#82777A]">
          Configure corporate publisher identity, institutional contact routing, and global currency parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Identity */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#292326] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#651C32]" />
              Brand identity
            </h3>
            <span className="text-[10px] font-bold text-[#82777A] uppercase tracking-wider">
              Legal imprint
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Publishing house"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
                Publisher logo
              </label>
              <div className="flex gap-2">
                <Input
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="URL to logo"
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292326] uppercase tracking-wider mb-1.5">
              Description and mission
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-[#EAE3DE] bg-white p-3 text-sm text-[#292326] placeholder-[#82777A] focus:outline-none focus:ring-2 focus:ring-[#651C32] focus:border-[#651C32] transition-colors"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </div>
        </div>

        {/* Official Communications & Address */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#292326] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#651C32]" />
              Address and contact
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
            <Input
              label="Customer phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <Input
            label="Registered address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        {/* Social Media Links */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#292326] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#651C32]" />
              Outreach and social media
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Social media profile"
              placeholder="https://twitter.com/dotcombooks"
              value={settings.social_links?.twitter || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, twitter: e.target.value },
                })
              }
            />
            <Input
              label="LinkedIn page"
              placeholder="https://linkedin.com/company/dotcom-publications"
              value={settings.social_links?.linkedin || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, linkedin: e.target.value },
                })
              }
            />
            <Input
              label="Facebook page"
              placeholder="https://facebook.com/dotcombooks"
              value={settings.social_links?.facebook || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, facebook: e.target.value },
                })
              }
            />
            <Input
              label="Instagram profile"
              placeholder="https://instagram.com/dotcombooks"
              value={settings.social_links?.instagram || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social_links: { ...settings.social_links, instagram: e.target.value },
                })
              }
            />
          </div>
        </div>

        {/* Website Configuration & Operations */}
        <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
          <div className="border-b border-[#EAE3DE] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#292326] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#651C32]" />
              Catalogue settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Base currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={[
                { value: 'INR', label: 'INR (₹) — Indian Rupee', subtitle: 'Standard billing for domestic institutional orders', icon: <Coins className="w-4 h-4" /> },
                { value: 'USD', label: 'USD ($) — US Dollar', subtitle: 'Global academic institution invoicing', icon: <Coins className="w-4 h-4" /> },
                { value: 'GBP', label: 'GBP (£) — British Pound', subtitle: 'UK and Commonwealth university distribution', icon: <Coins className="w-4 h-4" /> },
                { value: 'EUR', label: 'EUR (€) — Euro', subtitle: 'Continental European academic procurement', icon: <Coins className="w-4 h-4" /> },
              ]}
            />

            <Input
              label="Annual catalogue PDF"
              placeholder="https://dotcompublications.com/downloads/catalogue.pdf"
              value={settings.catalogue_download_url || ''}
              onChange={(e) =>
                setSettings({ ...settings, catalogue_download_url: e.target.value })
              }
            />
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="p-4 rounded-md border border-[#EAE3DE] bg-[#FAF8F3] flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#C58B35]" />
              <div>
                <span className="text-xs font-bold text-[#292326] block">
                  Public website maintenance
                </span>
                <p className="text-[11px] text-[#82777A]">
                  When enabled, visitors to the public site see an under-construction announcement.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.maintenance_mode ? 'bg-[#C58B35]' : 'bg-[#EAE3DE]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Institutional System Status */}
        <div className="p-4 rounded-md bg-[#FFF6D9]/40 border border-[#F6E7A8] text-xs text-[#292326] flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#651C32]">Dotcom Publications</span>
            <p className="text-[11px] text-[#82777A] mt-0.5">
              Dotcom Publications • Secure Admin Workspace & Catalogue CMS
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#651C32]" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            className="w-full sm:w-auto min-h-[44px]"
            icon={<Save className="w-4 h-4" />}
          >
            Save settings
          </Button>
        </div>
      </form>

      {/* Security & Password Management Form */}
      <div className="p-6 bg-white rounded-lg border border-[#EAE3DE] shadow-none space-y-4">
        <div className="border-b border-[#EAE3DE] pb-3 flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-[#292326] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#651C32]" />
            Security and password
          </h3>
          <span className="text-[10px] font-bold text-[#651C32] bg-[#FFF6D9] px-2.5 py-0.5 rounded-full border border-[#F6E7A8]">
            Password protected
          </span>
        </div>

        <p className="text-xs text-[#82777A]">
          Ensure your administrator account uses a strong, unique password with at least 8 characters.
        </p>

        {passwordError && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <Input
            label="Current password"
            type="password"
            placeholder="Enter your current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-start pt-1">
            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
              className="w-full sm:w-auto min-h-[44px]"
              icon={<KeyRound className="w-4 h-4" />}
            >
              Update password
            </Button>
          </div>
        </form>
      </div>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setSettings({ ...settings, logo_url: url })}
        currentUrl={settings.logo_url || ''}
        categoryFilter="banners"
      />
    </div>
  );
};
