import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UrbanGaonLogo } from '../common/UrbanGaonLogo';

export const AuthPage: React.FC = () => {
  const { login, register, error, clearError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Single default urbangaon email & easy password
  const [email, setEmail] = useState('admin@urbangaon.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');

  const handleQuickFill = () => {
    setEmail('admin@urbangaon.com');
    setPassword('admin123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login({ email: email.trim(), password });
      } else {
        if (!name.trim()) throw new Error('Please enter your name.');
        if (!email.trim()) throw new Error('Please enter a valid email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'admin',
          department: 'Recruitment'
        });
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UrbanGaonLogo size="sm" />
          <div className="border-l border-slate-200 pl-3">
            <span className="font-semibold text-slate-800 text-sm tracking-tight">Recruitment Dashboard</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-sm">
          
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-3">
              <Lock size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign In to Urban Gaon' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access the recruitment portal
            </p>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1">{activeError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Urban Gaon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@urbangaon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} />
                  <span>Auto-fill</span>
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick credentials note */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Email: <strong>admin@urbangaon.com</strong></span>
              <span>Pass: <strong>admin123</strong></span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

          </form>

          {/* Toggle Login / Register */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setLocalError(null);
                clearError();
              }}
              className="text-xs text-slate-500 hover:text-blue-600 font-medium transition cursor-pointer"
            >
              {mode === 'login' 
                ? 'Need a new account? Create one' 
                : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        Urban Gaon • Recruitment Portal
      </footer>

    </div>
  );
};
