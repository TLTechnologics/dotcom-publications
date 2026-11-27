import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, KeyRound, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { User } from '../../types';

interface PortalLoginPageProps {
  onSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({
  onSuccess,
  onNavigate,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="admin-workspace min-h-screen bg-[#FAF8F3] flex flex-col justify-between font-sans text-[#292326]">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-[#EAE3DE] bg-white flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="touch-target flex items-center gap-2 text-xs font-semibold text-[#651C32] hover:text-[#431322] transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer storefront</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#651C32] text-white flex items-center justify-center font-bold text-[10px]">
            DP
          </div>
          <span className="text-xs font-semibold text-[#292326] hidden sm:inline">Dotcom Publications</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-lg border border-[#EAE3DE] shadow-none p-6 sm:p-10 space-y-6">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-lg bg-white border border-[#EAE3DE] overflow-hidden shadow-sm p-1 mx-auto">
              <img
                src="/logo.jpg"
                alt="Dotcom Publications"
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-normal mb-2 bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#651C32]" />
                <span>Admin sign in</span>
              </span>

              <h1 className="font-serif font-bold text-2xl text-[#292326]">
                Publishing admin
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
                Username or email
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
                  className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs rounded-md border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
                />
                <UserIcon className="w-4 h-4 text-[#82777A] absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#292326]">
                  Password
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
                  className="w-full pl-9 pr-16 py-2.5 min-h-[44px] text-xs rounded-md border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32]"
                />
                <Lock className="w-4 h-4 text-[#82777A] absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="touch-target absolute right-2 top-1 text-xs font-semibold text-[#82777A] hover:text-[#292326] px-2"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && (
                <div className="p-2.5 mt-2 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F6E7A8]" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#F6E7A8]" />
                  <span>Sign in to admin</span>
                </>
              )}
            </Button>
          </form>

          {/* Secure Admin Access Notice */}
          <div className="pt-4 border-t border-[#EAE3DE] text-center">
            <p className="text-[11px] text-[#82777A]">
              Authorized personnel only. All access attempts are logged and monitored.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#82777A] border-t border-[#EAE3DE] bg-white">
        <p>© 2026 Dotcom Publications • All rights reserved</p>
      </footer>
    </div>
  );
};
