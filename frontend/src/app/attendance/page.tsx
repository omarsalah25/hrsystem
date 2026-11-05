'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Clock,
  Cpu,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Smartphone,
  Server
} from 'lucide-react';

export default function AttendancePage() {
  const { t, locale } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <DashboardLayout>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'ar' ? 'الحضور والانصراف وأجهزة البصمة' : 'Time & Attendance Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'مراقبة حركة البصمات الحيوية (ZKTeco/Hikvision) وحضور المحمول بالنطاق الجغرافي (Geofence)'
              : 'Monitor real-time biometric hardware clocks & mobile geofenced check-ins'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{locale === 'ar' ? 'تحديث الحركات الآن' : 'Refresh Punches'}</span>
        </button>
      </div>

      {/* Hardware Terminals & Ingestion Bridge Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Terminal 1: ZKTeco */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Server className="w-4 h-4 text-blue-600" />
              <span>جهاز ZKTeco SilkBio (الرياض)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>البروتوكول: <span className="font-mono text-slate-800 font-semibold">ADMS HTTP Push (8081)</span></p>
            <p>حركات اليوم: <span className="font-bold text-slate-900">142 حركة</span></p>
            <p className="text-[11px] text-emerald-600 font-medium">✓ آخر مزامنة: قبل 30 ثانية</p>
          </div>
        </div>

        {/* Terminal 2: Hikvision */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Server className="w-4 h-4 text-purple-600" />
              <span>جهاز Hikvision Face (القاهرة)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>البروتوكول: <span className="font-mono text-slate-800 font-semibold">HTTP Event Webhook</span></p>
            <p>حركات اليوم: <span className="font-bold text-slate-900">98 حركة</span></p>
            <p className="text-[11px] text-emerald-600 font-medium">✓ آخر مزامنة: قبل دقيقة واحدة</p>
          </div>
        </div>

        {/* Terminal 3: Mobile GPS Geofence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>محرك النطاق الجغرافي (Geofence)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>معادلة الحساب: <span className="font-mono text-slate-800 font-semibold">Haversine 200m / 300m</span></p>
            <p>حركات المحمول اليوم: <span className="font-bold text-slate-900">54 حركة معتمدة</span></p>
            <p className="text-[11px] text-emerald-600 font-medium">✓ مؤمن ببصمة الوجه (FaceID/TouchID)</p>
          </div>
        </div>
      </div>

      {/* Live Punches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{locale === 'ar' ? 'سجل حضور وانصراف اليوم' : "Today's Attendance Sheet"}</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">5 نوفمبر 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'أول حضور (In)' : 'First In'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'آخر انصراف (Out)' : 'Last Out'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'ساعات العمل' : 'Hours'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'التأخير' : 'Late'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'المصدر' : 'Source'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-bold text-slate-900">
                  <div>عبدالله سعد العتيبي</div>
                  <div className="text-[10px] text-slate-400 font-mono">EMP-SA-001</div>
                </td>
                <td className="p-4 text-slate-700">🇸🇦 الرياض</td>
                <td className="p-4 font-mono font-bold text-emerald-700">08:52 AM</td>
                <td className="p-4 font-mono font-bold text-slate-600">05:08 PM</td>
                <td className="p-4 font-semibold text-slate-800">8.25 ساعة</td>
                <td className="p-4 text-slate-400 font-medium">0 دقيقة</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px]">
                    📱 GPS محمول
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                    حاضر في الموعد
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80">
                <td className="p-4 font-bold text-slate-900">
                  <div>أحمد محمود الشافعي</div>
                  <div className="text-[10px] text-slate-400 font-mono">EMP-EG-001</div>
                </td>
                <td className="p-4 text-slate-700">🇪🇬 القاهرة</td>
                <td className="p-4 font-mono font-bold text-amber-700">09:18 AM</td>
                <td className="p-4 font-mono text-slate-400">قيد العمل...</td>
                <td className="p-4 font-semibold text-slate-800">--</td>
                <td className="p-4 font-bold text-amber-600">18 دقيقة</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-bold text-[10px]">
                    📟 بصمة ZKTeco
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full">
                    تأخير 18 دقيقة
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

