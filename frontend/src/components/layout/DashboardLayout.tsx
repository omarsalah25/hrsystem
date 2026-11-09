'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarNav from './SidebarNav';
import HeaderNav from './HeaderNav';
import { usePermissions } from '@/lib/permissions';
import { useTranslation } from '@/lib/translations';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const { mounted, roleInfo, homeRoute, canAccessRoute } = usePermissions();
  const isAr = locale === 'ar';

  const isAllowed = !mounted || canAccessRoute(pathname);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNav />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {isAllowed ? (
            children
          ) : (
            <div className="max-w-lg mx-auto my-16 bg-white rounded-2xl border border-rose-200 shadow-lg p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {isAr ? 'غير مصرح بالوصول لهذا القسم (RBAC Restricted)' : 'Access Restricted by Role Permissions'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? `صلاحيتك الحالية (${roleInfo.ar}) لا تخولك استعراض أو تعديل بيانات هذه الصفحة حفاظاً على سرية البيانات والامتثال الرقابي.`
                  : `Your current role (${roleInfo.en}) does not have permission to view or modify this module.`}
              </p>
              <div className="pt-2">
                <Link
                  href={homeRoute}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <span>{isAr ? 'العودة إلى لوحة العمل المخصصة لك' : 'Return to Your Workspace'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

