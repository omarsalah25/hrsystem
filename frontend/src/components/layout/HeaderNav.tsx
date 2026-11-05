'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations';
import { Globe2, Bell, Search, MapPin } from 'lucide-react';

export default function HeaderNav() {
  const { t, locale, setLocale, isRtl } = useTranslation();

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
      <div className="flex items-center gap-4">
        {/* Branch Selector */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <select className="bg-transparent outline-none cursor-pointer">
            <option value="ALL">{locale === 'ar' ? 'جميع الفروع (الرياض & القاهرة)' : 'All Branches (Riyadh & Cairo)'}</option>
            <option value="RUH">🇸🇦 فرع الرياض - العليا (KSA)</option>
            <option value="CAI">🇪🇬 فرع القاهرة - القرية الذكية (EGY)</option>
          </select>
        </div>

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

        {/* Profile */}
        <div className="flex items-center gap-2.5 ps-2 border-s border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
            AS
          </div>
          <div className="hidden md:block text-start leading-tight">
            <p className="text-xs font-bold text-slate-900">د. عبدالله السعيد</p>
            <p className="text-[10px] text-slate-400">HR Director</p>
          </div>
        </div>
      </div>
    </header>
  );
}

