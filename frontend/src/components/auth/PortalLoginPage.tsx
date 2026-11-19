import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowLeft, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { Button } from '../ui/Button';

interface PortalLoginPageProps {
  role: 'admin' | 'super-admin';
  onSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({
  role,
  onSuccess,
  onNavigate,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSuperAdmin = role === 'super-admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password as requested: tl04
    if (password === 'tl04') {
      setError('');
      onSuccess();
    } else {
      setError('Invalid security access key. (Default key: tl04)');
    }
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
          <span className="text-xs font-semibold text-[#292326]">TL Technologics Workspace</span>
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
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                  isSuperAdmin
                    ? 'bg-[#431322] text-[#F6E7A8] border border-[#F6E7A8]/40'
                    : 'bg-[#FFF6D9] text-[#651C32] border border-[#F6E7A8]'
                }`}
              >
                {isSuperAdmin ? (
                  <>
                    <Sparkles className="w-3 h-3 text-[#F6E7A8]" />
                    <span>Super Admin Console</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#651C32]" />
                    <span>Publisher Admin Portal</span>
                  </>
                )}
              </span>

              <h1 className="font-serif font-bold text-2xl text-[#292326]">
                {isSuperAdmin ? 'Super Administrator Access' : 'Editorial Administrator Sign In'}
              </h1>
              <p className="text-xs text-[#82777A] mt-1 font-light">
                {isSuperAdmin
                  ? 'Master console for global catalogue, CMS, settings, and orders.'
                  : 'Authorized access for publishing operations, book catalogue, and orders.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#292326] mb-1.5">
                {isSuperAdmin ? 'Master Password' : 'Admin Access Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter security key (tl04)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#EAE3DE] bg-[#FAF8F3] focus:bg-white text-[#292326] focus:outline-none focus:ring-2 focus:ring-[#651C32] pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[10px] font-semibold text-[#82777A] hover:text-[#292326]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-[#F6E7A8]" />
              <span>
                {isSuperAdmin ? 'Unlock Super Admin Console' : 'Sign In as Administrator'}
              </span>
            </Button>
          </form>

          {/* Switch Role Hint */}
          <div className="pt-4 border-t border-[#EAE3DE] text-center text-xs">
            {isSuperAdmin ? (
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="text-[#651C32] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <span>Switch to Standard Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/super-admin')}
                className="text-[#651C32] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <span>Are you a Super Admin? Login here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#82777A] border-t border-[#EAE3DE] bg-white/60">
        <p>© 2026 Dotcom Publications • Developed by <strong className="text-[#651C32]">TL Technologics</strong></p>
      </footer>
    </div>
  );
};
