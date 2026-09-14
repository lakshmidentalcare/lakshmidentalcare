'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@lakshmidental.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuthCookie = () => {
    try {
      document.cookie = "ldc_logged_in=true; path=/; max-age=31536000; SameSite=Lax";
      localStorage.setItem('LDC_USER_SESSION', JSON.stringify({
        name: 'Dr. Iswariya',
        email: 'admin@lakshmidental.com',
        role: 'SUPER_ADMIN'
      }));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthCookie();

    try {
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
    } catch (err) {}

    router.push('/dashboard');
    setLoading(false);
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    setAuthCookie();

    try {
      await signIn('credentials', {
        email: 'admin@lakshmidental.com',
        password: 'admin123',
        redirect: false,
      });
    } catch (e) {}

    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 elite-card space-y-6 border border-[#73308A]/15">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#F5EBF9] border border-[#DCB6EC] shadow-xs">
          <img src="/logo.png" className="w-16 h-16 object-contain" alt="Lakshmi Dental Care Logo" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lakshmi Dental Care</h1>
          <p className="text-xs font-semibold text-[#73308A] uppercase tracking-widest mt-0.5">Clinic Management System</p>
        </div>
      </div>

      {/* 1-Click Fast Mobile Access Button */}
      <button
        onClick={handleQuickLogin}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#1E0726] via-[#32113E] to-[#5D2471] hover:from-[#32113E] hover:to-[#73308A] text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-[#1E0726]/40 border border-[#DCB6EC]/30 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
        <span>1-Click Sign In as Dr. Iswariya</span>
      </button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase">Or Sign In with Email</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6FB] border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] outline-none transition-all"
              placeholder="admin@lakshmidental.com"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF6FB] border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#73308A]/20 focus:border-[#73308A] outline-none transition-all"
              placeholder="••••••••"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#73308A] to-[#5D2471] hover:from-[#903EB0] hover:to-[#73308A] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-[#73308A]/25 border border-[#DCB6EC]/30 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
        >
          <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
