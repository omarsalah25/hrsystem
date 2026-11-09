'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Button, Tag } from 'antd';
import SidebarNav from './SidebarNav';
import HeaderNav from './HeaderNav';
import { usePermissions } from '@/lib/permissions';
import { useTranslation } from '@/lib/translations';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const { mounted, roleInfo, homeRoute, canAccessRoute } = usePermissions();
  const [routeTransitionLoading, setRouteTransitionLoading] = useState(false);
  const isAr = locale === 'ar';

  useEffect(() => {
    setRouteTransitionLoading(true);
    const timer = setTimeout(() => setRouteTransitionLoading(false), 180);
    return () => clearTimeout(timer);
  }, [pathname]);

  const isAllowed = !mounted || canAccessRoute(pathname);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNav />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {!mounted || routeTransitionLoading ? (
            <PageSkeleton variant="dashboard" />
          ) : isAllowed ? (
            children
          ) : (
            <Card className="max-w-lg mx-auto my-16 rounded-2xl border-rose-200 shadow-lg text-center">
              <div className="space-y-4 py-2">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <Tag color="error" className="mb-2 font-bold">
                    RBAC Restricted
                  </Tag>
                  <h2 className="text-lg font-black text-slate-900">
                    {isAr ? 'غير مصرح بالوصول لهذا القسم (RBAC Restricted)' : 'Access Restricted by Role Permissions'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isAr
                    ? `صلاحيتك الحالية (${roleInfo.ar}) لا تخولك استعراض أو تعديل بيانات هذه الصفحة حفاظاً على سرية البيانات والامتثال الرقابي.`
                    : `Your current role (${roleInfo.en}) does not have permission to view or modify this module.`}
                </p>
                <div className="pt-2">
                  <Link href={homeRoute}>
                    <Button type="primary" size="large" className="font-bold rounded-xl">
                      <span>{isAr ? 'العودة إلى لوحة العمل المخصصة لك' : 'Return to Your Workspace'}</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ms-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

