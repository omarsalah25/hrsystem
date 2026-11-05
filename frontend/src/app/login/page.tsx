'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/translations';
import {
  Lock,
  Mail,
  ShieldCheck,
  Globe2,
  Building2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  X
} from 'lucide-react';

export default function LoginPage() {
  const { t, locale, setLocale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('admin@hrsystem.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prompt 2FA for privileged admin/HR accounts
    setIs2faModalOpen(true);
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
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
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">البريد الإلكتروني للعمل</label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                    isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">كلمة المرور</label>
                <a href="#" className="text-blue-600 hover:underline text-[11px] font-semibold">نسيت كلمة المرور؟</a>
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20"
            >
              تسجيل الدخول (Sign In)
            </button>
          </form>

          {/* Compliance & Security Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>اتصال مشفر بتشفير SSL/TLS 256-bit مطابق للمعايير الحكومية</span>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {is2faModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">التحقق بخطوتين (2FA Verification)</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              يرجى إدخال رمز التحقق المكون من 6 أرقام من تطبيق Authenticator الخاص بك
            </p>

            {/* 6 Digit Inputs */}
            <div className="flex justify-center gap-2 my-6" dir="ltr">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-11 h-12 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                />
              ))}
            </div>

            <Link
              href="/"
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20"
            >
              تأكيد الدخول إلى لوحة القيادة
            </Link>

            <button
              onClick={() => setIs2faModalOpen(false)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              إلغاء والعودة
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        &copy; 2026 HRSystem Cloud. جميع الحقوق محفوظة لشركات المملكة العربية السعودية ومصر.
      </footer>
    </div>
  );
}

