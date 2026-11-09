'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import { Globe2, Bell, Search, MapPin, ShieldCheck, LogOut } from 'lucide-react';

export default function HeaderNav() {
  const router = useRouter();
  const { t, locale, setLocale, isRtl } = useTranslation();
  const [user, setUser] = useState<{ name: string; role: string; email?: string }>({
    name: 'د. عبدالله السعيد',
    role: 'SUPER_ADMIN',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hr_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.name) {
            setUser({
              name: parsed.name,
              role: parsed.role || 'HR_MANAGER',
              email: parsed.email,
            });
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
    if (typeof document !== 'undefined') {
      document.cookie = 'hr_token=; path=/; max-age=0';
    }
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={locale === 'ar' ? 'بحث عن موظف، قسم، طلب إجازة... (Ctrl+K)' : 'Search employees, departments, requests...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition ${
              isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
            }`}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <select className="bg-transparent outline-none cursor-pointer">
            <option value="ALL">{locale === 'ar' ? 'جميع الفروع (الرياض & القاهرة)' : 'All Branches (Riyadh & Cairo)'}</option>
            <option value="RUH">🇸🇦 فرع الرياض - العليا (KSA)</option>
            <option value="CAI">🇪🇬 فرع القاهرة - القرية الذكية (EGY)</option>
          </select>
        </div>

        {/* Platform Admin Switcher */}
        <Link
          href="/admin"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>{locale === 'ar' ? 'لوحة مالك النظام (Admin)' : 'Platform Admin'}</span>
        </Link>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Profile & Logout */}
        <div className="flex items-center gap-2.5 ps-2 border-s border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
            {user.name.slice(0, 2)}
          </div>
          <div className="hidden md:block text-start leading-tight">
            <p className="text-xs font-bold text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title={locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
