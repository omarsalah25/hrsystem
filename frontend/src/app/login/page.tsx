'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  Lock,
  Mail,
  ShieldCheck,
  Globe2,
  Building2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('admin@hrsystem.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.auth.login({ email, password });
      const user = res?.data?.user;

      if (res?.data?.token) {
        document.cookie = `hr_token=${res.data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      if (user?.role === 'SUPER_ADMIN') {
        window.location.href = '/admin';
      } else if (user?.role === 'EMPLOYEE') {
        window.location.href = '/self-service';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err?.message || (isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 text-slate-900">
      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            HR
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">HRSystem Cloud</span>
            <span className="text-[10px] text-slate-400 block font-medium">Enterprise Multi-Tenant</span>
          </div>
        </div>

        <button
          onClick={() => setLocale(isAr ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-bold text-[11px] mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>مجموعة المستقبل القابضة (demo.hrsystem.com)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {isAr ? 'تسجيل الدخول للمنظومة' : 'Sign in to your account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'أدخل بيانات الاعتماد الخاصة بك للوصول لمنصة الموارد البشرية' : 'Enter your credentials to access the HCM portal'}
            </p>

            {/* Quick Demo Role Picker */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold mb-1.5">{isAr ? 'الحسابات التجريبية السريعة (اختر دوراً):' : 'Demo Accounts (Choose Role):'}</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => { setEmail('admin@hrsystem.com'); setPassword('password123'); setErrorMessage(''); }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold transition"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('hr@hrsystem.com'); setPassword('password123'); setErrorMessage(''); }}
                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-[10px] font-bold transition"
                >
                  👥 HR Lead
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('payroll@hrsystem.com'); setPassword('password123'); setErrorMessage(''); }}
                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold transition"
                >
                  💰 Payroll
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('auditor@hrsystem.com'); setPassword('password123'); setErrorMessage(''); }}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-bold transition"
                >
                  🔍 Auditor
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('employee@hrsystem.com'); setPassword('password123'); setErrorMessage(''); }}
                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-bold transition"
                >
                  📱 Employee
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">البريد الإلكتروني الوظيفي</label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-600 hover:underline text-[11px] font-semibold"
                >
                  {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                </button>
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="remember" defaultChecked className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
              <label htmlFor="remember" className="text-slate-600 font-medium cursor-pointer">
                تذكر هذا الجهاز لمدة 30 يوماً
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? 'جاري التحقق وتسجيل الدخول...' : 'Signing in...'}</span>
                </>
              ) : (
                <span>{isAr ? 'تسجيل الدخول (Sign In)' : 'Sign In'}</span>
              )}
            </button>

            {/* Portal Switch Link */}
            <div className="pt-2 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold transition"
              >
                <span>{isAr ? 'بوابة مالك المنظومة والشركات القابضة (Platform Admin) ←' : 'Platform Owner & Group Holdings Login →'}</span>
              </Link>
            </div>
          </form>

          {/* Compliance & Security Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>اتصال مشفر بتشفير SSL/TLS 256-bit مطابق للمعايير الحكومية</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        &copy; 2026 HRSystem Cloud. جميع الحقوق محفوظة لشركات المملكة العربية السعودية ومصر.
      </footer>
    </div>
  );
}
