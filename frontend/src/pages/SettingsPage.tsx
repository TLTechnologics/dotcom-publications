import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MediaPickerModal } from '../components/media/MediaPickerModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Save,
  Building,
  Mail,
  Phone,
  MapPin,
  Share2,
  Sliders,
  Upload,
  CheckCircle,
  ShieldCheck,
  AlertTriangle
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      toast.success('Settings Saved', 'Global platform parameters updated successfully');
    } catch (err: any) {
      toast.error('Failed to save settings', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-charcoal-400">Loading system settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-serif font-bold text-charcoal-900 tracking-tight">
          System & Publishing House Settings
        </h2>
        <p className="text-xs text-charcoal-500">
          Configure corporate publisher identity, institutional contact routing, and global currency parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Identity */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-subtle space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-editorial-burgundy-700" />
              Corporate Brand Identity
            </h3>
            <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">
              Legal Imprint
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Legal Name"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Official Publisher Logo
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
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Corporate Description / Mission
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-stone-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-editorial-burgundy-500"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </div>
        </div>

        {/* Official Communications & Address */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-subtle space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-editorial-burgundy-700" />
              Headquarters & Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Contact Email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
            <Input
              label="Customer & Academic Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <Input
            label="Corporate Registered Address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        {/* Social Media Links */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-subtle space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-editorial-burgundy-700" />
              Academic Outreach & Social Media
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Twitter / X Profile"
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
              label="LinkedIn Corporate Page"
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
              label="Facebook Page"
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
              label="Instagram Profile"
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
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-subtle space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-sm font-serif font-bold text-charcoal-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-editorial-burgundy-700" />
              Catalogue & Operational Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Catalogue Base Currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={[
                { value: 'INR', label: 'INR (₹) — Indian Rupee' },
                { value: 'USD', label: 'USD ($) — US Dollar' },
                { value: 'GBP', label: 'GBP (£) — British Pound' },
                { value: 'EUR', label: 'EUR (€) — Euro' },
              ]}
            />

            <Input
              label="Complete Annual Catalogue PDF Link"
              placeholder="https://dotcompublications.com/downloads/catalogue.pdf"
              value={settings.catalogue_download_url || ''}
              onChange={(e) =>
                setSettings({ ...settings, catalogue_download_url: e.target.value })
              }
            />
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">
                  Public Website Maintenance Mode
                </span>
                <p className="text-[11px] text-charcoal-500">
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
                settings.maintenance_mode ? 'bg-amber-600' : 'bg-stone-300'
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

        {/* Agency Attribution */}
        <div className="p-4 rounded-xl bg-paper-100 border border-stone-200/80 text-xs text-charcoal-600 flex items-center justify-between">
          <div>
            <span className="font-semibold text-charcoal-900">Developed by TL Technologics</span>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Client: Dotcom Publications • Phase 01: Admin Panel & Catalogue CMS
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-editorial-burgundy-700" />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={saving} icon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>

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
