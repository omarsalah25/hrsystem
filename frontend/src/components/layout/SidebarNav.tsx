'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  Banknote,
  Briefcase,
  Target,
  GraduationCap,
  Scale,
  Network,
  Package,
  BarChart3,
  UserMinus,
  Settings,
  ShieldCheck,
  UserCircle,
  CalendarDays,
  Building2
} from 'lucide-react';

export default function SidebarNav() {
  const pathname = usePathname();
  const { t, locale, isRtl } = useTranslation();

  const isAr = locale === 'ar';

  const navGroups = [
    {
      groupTitle: isAr ? 'إدارة المنظومة القابضة' : 'Holding Administration',
      items: [
        { href: '/admin', label: isAr ? 'لوحة مالك المنظومة (Admin)' : 'Platform Owner Cockpit', icon: ShieldCheck, badge: 'SaaS' },
      ],
    },
    {
      groupTitle: isAr ? 'العمليات الأساسية للشركات' : 'Company Operations',
      items: [
        { href: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
        { href: '/self-service', label: isAr ? 'الخدمة الذاتية (ESS)' : 'Self-Service (ESS)', icon: UserCircle },
        { href: '/employees', label: t('nav.employees'), icon: Users, badge: '148' },
        { href: '/org-chart', label: isAr ? 'الهيكل التنظيمي' : 'Org Chart', icon: Network },
        { href: '/attendance', label: t('nav.attendance'), icon: Clock },
        { href: '/shifts', label: isAr ? 'الورديات ورمضان' : 'Shifts & Roster', icon: CalendarDays },
        { href: '/leaves', label: t('nav.leaves'), icon: CalendarCheck, badge: '3' },
        { href: '/payroll', label: t('nav.payroll'), icon: Banknote },
      ],
    },
    {
      groupTitle: isAr ? 'تطوير المواهب والكفاءات' : 'Talent & Growth',
      items: [
        { href: '/recruitment', label: isAr ? 'التوظيف (ATS)' : 'Recruitment (ATS)', icon: Briefcase },
        { href: '/performance', label: isAr ? 'الأداء و OKRs و 9-Box' : 'Performance & OKRs', icon: Target },
        { href: '/learning', label: isAr ? 'التدريب والتطوير (L&D)' : 'Learning & Dev', icon: GraduationCap },
      ],
    },
    {
      groupTitle: isAr ? 'الامتثال والأصول والحوكمة' : 'Compliance & Governance',
      items: [
        { href: '/assets', label: isAr ? 'إدارة العهد والأصول' : 'Asset Tracking', icon: Package },
        { href: '/company', label: isAr ? 'الفروع والنطاق الجغرافي' : 'Branches & Geofence', icon: Building2 },
        { href: '/employee-relations', label: isAr ? 'علاقات العمل والشكاوى' : 'Employee Relations', icon: Scale },
        { href: '/reports', label: isAr ? 'التقارير ومؤشرات HR' : 'Analytics & Reports', icon: BarChart3 },
        { href: '/offboarding', label: isAr ? 'إنهاء الخدمة وتصفية FNF' : 'Offboarding & FNF', icon: UserMinus },
        { href: '/audit', label: isAr ? 'سجل التدقيق المشفر' : 'Audit Trail', icon: ShieldCheck },
        { href: '/settings', label: t('nav.settings'), icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-e border-slate-200 min-h-screen flex flex-col justify-between shrink-0 shadow-xs">
      <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
            HR
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 leading-tight">HRSystem</h2>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise HCM</p>
          </div>
        </div>

        {/* Tenant Indicator */}
        <div className="px-4 py-2.5 mx-3 my-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
            {isAr ? 'المؤسسة الحالية' : 'Current Organization'}
          </p>
          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
            {isAr ? 'مجموعة المستقبل القابضة' : 'Future Holding Group'}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isAr ? '🇸🇦 فرع الرياض + 🇪🇬 فرع القاهرة' : 'Riyadh & Cairo Branches'}</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 space-y-4 pb-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                {group.groupTitle}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Stamp Footer */}
      <div className="p-3 border-t border-slate-100 bg-white sticky bottom-0 z-10">
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-2.5 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-emerald-900 leading-tight">
              {isAr ? 'نظام معتمد قانونياً' : 'Statutorily Compliant'}
            </p>
            <p className="text-[9px] text-emerald-700 mt-0.5 leading-snug">
              {isAr ? 'تأمينات مصر (قانون 148) و GOSI السعودية' : 'Egypt Law 148 & Saudi GOSI'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
