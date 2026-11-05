'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import {
  Target,
  Award,
  TrendingUp,
  Star,
  Plus,
  AlertCircle,
  CheckCircle2,
  Users,
  Grid3X3
} from 'lucide-react';

interface OKRGoal {
  id: string;
  title: string;
  owner: string;
  dept: string;
  progress: number;
  weight: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
}

export default function PerformancePage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState<'okrs' | 'ninebox' | 'reviews'>('ninebox');

  const [goals, setGoals] = useState<OKRGoal[]>([
    {
      id: '1',
      title: 'إطلاق نظام البصمة المزدوج وحماية الأجور للفرعين (الرياض والقاهرة)',
      owner: 'عبدالله سعد العتيبي',
      dept: 'تقنية المعلومات (IT)',
      progress: 85,
      weight: 40,
      status: 'ON_TRACK',
    },
    {
      id: '2',
      title: 'أتمتة احتساب ضرائب كسب العمل المصرية لعام 2024 بدون أي أخطاء حسابية',
      owner: 'أحمد محمود الشافعي',
      dept: 'تقنية المعلومات (IT)',
      progress: 95,
      weight: 30,
      status: 'COMPLETED',
    },
    {
      id: '3',
      title: 'رفع نسبة الامتثال لبرنامج حماية الأجور (Mudad) إلى 100% شهرياً',
      owner: 'نورهان طارق المنشاوي',
      dept: 'المالية (Finance)',
      progress: 60,
      weight: 30,
      status: 'AT_RISK',
    },
  ]);

  useEffect(() => {
    api.performance.listGoals()
      .then((res: any) => {
        const rawItems = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (rawItems.length > 0) {
          const mapped: OKRGoal[] = rawItems.map((g: any) => ({
            id: g.id,
            title: g.title,
            owner: g.employee ? `${g.employee.first_name} ${g.employee.last_name}` : 'موظف',
            dept: g.employee?.department?.name || 'تقنية المعلومات',
            progress: g.progress_percentage || 0,
            weight: 30,
            status: g.status === 'ACHIEVED' ? 'COMPLETED' : g.status === 'AT_RISK' ? 'AT_RISK' : 'ON_TRACK',
          }));
          setGoals(mapped);
        }
      })
      .catch((err) => {
        console.warn('Failed to load performance goals from API:', err);
      });
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة الأداء والأهداف (OKRs & 9-Box Grid)' : 'Performance, OKRs & Talent Calibration'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'متابعة الأهداف الاستراتيجية، مصفوفة تقييم الكفاءات التساعية، ومراجعات الأداء 360°'
              : 'Track strategic OKRs, calibrate talent on the 9-box grid, and manage 360 reviews'}
          </p>
        </div>

        <button
          onClick={() => alert('نافذة إضافة هدف ربع سنوي جديد OKR')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة هدف جديد (OKR)' : 'New OKR Goal'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('ninebox')}
          className={`pb-3 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'ninebox'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>{isAr ? 'مصفوفة الكفاءات والنمو (9-Box Grid)' : '9-Box Talent Matrix'}</span>
        </button>
        <button
          onClick={() => setActiveTab('okrs')}
          className={`pb-3 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'okrs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{isAr ? 'أهداف الربع الحالي (OKRs)' : 'Current Quarter OKRs'}</span>
        </button>
      </div>

      {/* Tab: 9-Box Talent Matrix */}
      {activeTab === 'ninebox' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {isAr ? 'مصفوفة معايرة المواهب والكفاءات (Performance vs Potential)' : 'Talent Calibration Grid'}
              </h2>
              <p className="text-xs text-slate-400">توزيع الموظفين طبقاً للأداء السابق (المحور الأفقي) مقابل إمكانات النمو المستقبلية (المحور الرأسي)</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              دورة تقييم 2026
            </span>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            {/* Row 1: High Potential */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-amber-900 block text-[11px]">موهبة واعدة (High Potential / Low Perf)</span>
              <p className="text-[10px] text-amber-600 mt-0.5">يحتاج توجيه وتدريب مكثف</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="bg-white px-2 py-1 rounded-lg border border-amber-200 text-slate-800 font-semibold text-[10px]">
                  م. يوسف حسن
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-blue-900 block text-[11px]">نجم صاعد (High Potential / Med Perf)</span>
              <p className="text-[10px] text-blue-600 mt-0.5">مرشح للتطور السريع</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="bg-white px-2 py-1 rounded-lg border border-blue-200 text-slate-800 font-semibold text-[10px]">
                  أ. دينا مصطفى
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl min-h-[120px] shadow-xs">
              <span className="font-black text-emerald-900 block text-[11px] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                <span>نخبة الكفاءات (Star / Super Talent)</span>
              </span>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">مرشح لخطة التعاقب والقيادة</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] shadow-xs">
                  م. عبدالله العتيبي 🇸🇦
                </span>
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] shadow-xs">
                  م. أحمد الشافعي 🇪🇬
                </span>
              </div>
            </div>

            {/* Row 2: Medium Potential */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-slate-800 block text-[11px]">متردد (Med Potential / Low Perf)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">تحسين مهارات العمل</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-slate-800 block text-[11px]">عضو فريق رئيسي (Core Team Member)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">أداء مستقر وموثوق</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-800 font-semibold text-[10px]">
                  أ. سارة القحطاني
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-blue-900 block text-[11px]">أداء عالي مستمر (High Performer)</span>
              <p className="text-[10px] text-blue-600 mt-0.5">خبير في مجاله التخصصي</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="bg-white px-2 py-1 rounded-lg border border-blue-200 text-slate-800 font-semibold text-[10px]">
                  أ. نورهان المنشاوي
                </span>
              </div>
            </div>

            {/* Row 3: Low Potential */}
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-rose-900 block text-[11px]">خطة تحسين أداء (PIP Candidate)</span>
              <p className="text-[10px] text-rose-600 mt-0.5">أداء منخفض وإمكانات ضعيفة</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-slate-800 block text-[11px]">منفذ مستمر (Effective Contributor)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">مهام تشغيلية روتينية</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[120px]">
              <span className="font-bold text-slate-800 block text-[11px]">خبير تقني مستقر (Master / Trusted IC)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">أداء استثنائي بلا رغبة إدارية</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: OKR Goals */}
      {activeTab === 'okrs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {isAr ? 'الأهداف والنتائج الرئيسية (Q4 2026 OKRs)' : 'Quarterly Strategic Goals'}
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {goals.map((g) => (
              <div key={g.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{g.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                      g.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      g.status === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span>المسؤول: <strong className="text-slate-800">{g.owner}</strong></span>
                    <span>القسم: <strong>{g.dept}</strong></span>
                    <span>الوزن النسبي: <strong>{g.weight}%</strong></span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden max-w-md">
                    <div
                      className={`h-full rounded-full ${
                        g.progress >= 90 ? 'bg-emerald-500' : g.progress >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${g.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <span className="text-lg font-black text-slate-900">{g.progress}%</span>
                  <span className="text-xs text-slate-400 block">نسبة الإنجاز</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

