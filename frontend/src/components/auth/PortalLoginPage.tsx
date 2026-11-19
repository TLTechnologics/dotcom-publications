import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, KeyRound, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { User } from '../../types';

interface PortalLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
  initialRole?: 'admin' | 'super-admin';
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({
  onSuccess,
  onNavigate,
  initialRole = 'super-admin',
}) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('DotcomAdmin@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.login(identifier.trim(), password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between font-sans text-[#292326]">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-[#EAE3DE] bg-white/90 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-[#651C32] hover:text-[#431322] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Customer Storefront</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#651C32] text-white flex items-center justify-center font-bold text-[10px]">
            TL
          </div>
          <span className="text-xs font-semibold text-[#292326]">Dotcom Publishing Management</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE3DE] shadow-card p-8 sm:p-10 space-y-6">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#EAE3DE] overflow-hidden shadow-sm p-1 mx-auto">
              <img
                src="/logo.jpg"
                alt="Dotcom Publications"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#651C32]" />
                <span>Enterprise Authentication</span>
              </span>

              <h1 className="font-serif font-bold text-2xl text-[#292326]">
                Publishing Administration
              </h1>
              <p className="text-xs text-[#82777A] mt-1 font-light">
                Sign in with verified administrator credentials to access publishing tools.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1.5">
                Username or Official Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin or user@dotcompublications.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
                />
                <UserIcon className="w-4 h-4 text-[#82777A] absolute left-3 top-3" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#292326]">
                  Account Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-16 py-2.5 text-xs rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
                />
                <Lock className="w-4 h-4 text-[#82777A] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[10px] font-semibold text-[#82777A] hover:text-[#292326]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && (
                <div className="p-2.5 mt-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F6E7A8]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#F6E7A8]" />
                  <span>Sign In to Admin Workspace</span>
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-[#EAE3DE] space-y-2">
            <p className="text-[10px] font-semibold text-[#82777A] uppercase tracking-wider text-center">
              Quick Test Profiles (Pre-configured)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setPreset('admin', 'DotcomAdmin@2026')}
                className="p-2 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/50 transition-colors text-left font-medium text-[#431322]"
              >
                <span className="block font-bold">Super Admin</span>
                <span className="text-[9px] text-[#82777A]">Full access</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset('editor', 'DotcomEditor@2026')}
                className="p-2 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/50 transition-colors text-left font-medium text-[#431322]"
              >
                <span className="block font-bold">Content Editor</span>
                <span className="text-[9px] text-[#82777A]">Books, CMS, Media</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset('fulfillment', 'DotcomOrders@2026')}
                className="p-2 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/50 transition-colors text-left font-medium text-[#431322]"
              >
                <span className="block font-bold">Order Manager</span>
                <span className="text-[9px] text-[#82777A]">Orders & Invoices</span>
              </button>
              <button
                type="button"
                onClick={() => setPreset('viewer', 'DotcomViewer@2026')}
                className="p-2 rounded-xl border border-[#EAE3DE] hover:border-[#651C32] hover:bg-[#FFF6D9]/50 transition-colors text-left font-medium text-[#431322]"
              >
                <span className="block font-bold">Auditor</span>
                <span className="text-[9px] text-[#82777A]">Read-only</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#82777A] border-t border-[#EAE3DE] bg-white/60">
        <p>© 2026 Dotcom Publications • Developed with pride by <strong className="text-[#651C32]">TL Technologics</strong></p>
      </footer>
    </div>
  );
};
