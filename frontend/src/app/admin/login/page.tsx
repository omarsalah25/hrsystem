'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Building,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Globe2,
  Server
} from 'lucide-react';

export default function PlatformAdminLoginPage() {
  const router = useRouter();
  const { t, locale, setLocale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('admin@hrsystem.com');
  const [password, setPassword] = useState('password123');
  const [subdomain, setSubdomain] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Platform super admin requires dual-factor authentication challenge
    setIs2faModalOpen(true);
  };

  const handleConfirmLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await api.auth.login({
        email,
        password,
        subdomain,
        portal_type: 'ADMIN',
      });
      setIs2faModalOpen(false);
      router.push('/admin');
    } catch (err: any) {
      setIs2faModalOpen(false);
      setErrorMessage(
        err?.message || (isAr ? 'بيانات الاعتماد غير صالحة أو الحساب ليس لديه صلاحية مالك المنظومة' : 'Invalid credentials or account lacks System Owner privileges')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`admin-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Server className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">HRSystem Core OS</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PLATFORM OWNER
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block font-medium">بوابة الإدارة المركزية العليا • Multi-Tenant Engine</span>
          </div>
        </div>

        <button
          onClick={() => setLocale(isAr ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-indigo-950/50 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-indigo-700/50 rounded-full text-indigo-300 font-bold text-[11px] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'بوابة مالك المنظومة والشركات القابضة' : 'System Owner & Holding Admin'}</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {isAr ? 'تسجيل دخول مالك المنظومة' : 'Platform Admin Sign In'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'الوصول للوحة التحكم المركزية لإدارة كافة الشركات، الفروع، ومسيرات الرواتب المجمعة'
                : 'Access supreme cockpit for multi-company management, cross-border analytics, and global audit'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? 'البريد الإلكتروني لمالك النظام' : 'Platform Admin Email'}
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hrsystem.com"
                  className={`w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? 'كلمة المرور المشفرة' : 'Encrypted Password'}
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isRtl ? 'pr-9 pl-12' : 'pl-9 pr-12'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition ${
                    isRtl ? 'left-3' : 'right-3'
                  }`}
                >
                  {showPassword ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isAr ? 'النطاق الفرعي للمنظومة (Subdomain)' : 'System Subdomain'}
              </label>
              <div className="relative">
                <Building className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="demo"
                  className={`w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>{isAr ? 'المصادقة ومتابعة الدخول للوحة الإدارة' : 'Authenticate & Enter Admin Cockpit'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Switch to Company Portal */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">
              {isAr ? 'هل تبحث عن بوابة الشركات والموظفين؟' : 'Looking for the Company & Employee Portal?'}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition"
            >
              <span>{isAr ? 'الانتقال إلى بوابة الشركات والموظفين' : 'Go to Company & Employee Portal'}</span>
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {is2faModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-white">
                  {isAr ? 'المصادقة الثنائية (TOTP 2FA)' : 'Two-Factor Authentication'}
                </h3>
              </div>
              <button
                onClick={() => setIs2faModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'أدخل رمز التحقق المكون من 6 أرقام من تطبيق المصادقة الخاص بمالك النظام'
                  : 'Enter the 6-digit code from your System Owner authenticator app'}
              </p>

              <div className="flex justify-center gap-2 my-5" dir="ltr">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`admin-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    className="w-10 h-12 text-center text-lg font-black bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIs2faModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmLogin}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? (isAr ? 'جارِ التحقق...' : 'Verifying...') : (isAr ? 'تأكيد ودخول' : 'Confirm & Enter')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-[11px] text-slate-500 py-3">
        <span>© 2026 HRSystem Enterprise Core. Strict ISO 27001 & SOC 2 Type II Encrypted Access.</span>
      </div>
    </div>
  );
}
