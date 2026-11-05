'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  Download,
  Printer,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function ReportsPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'التقارير ومؤشرات الأداء الرئيسية (HR Analytics)' : 'Executive Analytics & KPI Reports'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'نسب التوطين (نطاقات)، معدلات دوران العمالة، مؤشر برادفورد للغياب، وتحليلات الرواتب'
              : 'Saudization & Egyptianization rates, turnover analytics, Bradford factor & payroll costs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('تم تصدير حزمة التقارير بصيغة PDF')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isAr ? 'طباعة التقرير الشامل' : 'Print Report'}</span>
          </button>
          <button
            onClick={() => alert('تم تنزيل جدول البيانات الكامل بصيغة Excel')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير البيانات Excel' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1: Saudization Nitaqat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">نسبة التوطين (نطاقات 🇸🇦)</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full">
              النطاق البلاتيني
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">68.2%</p>
          <p className="text-[11px] text-slate-400 mt-1">المستهدف الوزاري: 40% (متفوق بنسبة +28%)</p>
        </div>

        {/* Metric 2: Egyptianization Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">نسبة العمالة الوطنية (مصر 🇪🇬)</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded-full">
              ممتثل 100%
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">94.5%</p>
          <p className="text-[11px] text-slate-400 mt-1">مطابق للائحة قانون العمل المصري 12/2003</p>
        </div>

        {/* Metric 3: Turnover Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">معدل دوران العمالة السنوي</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full">
              منخفض وصحي
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">4.8%</p>
          <p className="text-[11px] text-slate-400 mt-1">المعيار العالمي للقطاع التقني: 12%</p>
        </div>

        {/* Metric 4: Bradford Factor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">مؤشر برادفورد للغياب المتقطع</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full">
              آمن (Low Risk)
            </span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">45 نقطة</p>
          <p className="text-[11px] text-slate-400 mt-1">قياس تأثير الغيابات القصيرة المتكررة S²×D</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            توزيع القوى العاملة حسب الأفرع والجنسيات
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>🇸🇦 فرع الرياض (المقر الرئيسي)</span>
                <span className="text-blue-600">92 موظفاً (62%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>🇪🇬 فرع القاهرة (مركز التطوير الهندسي)</span>
                <span className="text-purple-600">56 موظفاً (38%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mt-4 text-[11px] space-y-1">
              <p className="font-bold text-slate-800">التوزيع النوعي والتنوع:</p>
              <p className="text-slate-500">• نسبة الموظفات الإناث: 34% عبر جميع الإدارات.</p>
              <p className="text-slate-500">• متوسط عمر الموظفين: 31.4 سنة.</p>
              <p className="text-slate-500">• متوسط مدة الخدمة المتصلة: 2.8 سنة.</p>
            </div>
          </div>
        </div>

        {/* Cost & Overtime Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            تحليل تكلفة القوى العاملة ومصروفات العمل الإضافي
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">إجمالي الرواتب الأساسية الشهرية:</span>
              <span className="font-bold text-slate-900">SAR 620,000</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">إجمالي البدلات الثابتة (سكن + نقل):</span>
              <span className="font-bold text-slate-900">SAR 208,000</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">إجمالي اشتراكات التأمينات (حصة صاحب العمل):</span>
              <span className="font-bold text-amber-700">+SAR 84,200</span>
            </div>

            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600">مصروفات ساعات العمل الإضافية المعتمدة:</span>
              <span className="font-bold text-blue-700">SAR 14,000 (1.6% من المسير)</span>
            </div>

            <div className="flex justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-sm">
              <span>التكلفة الإجمالية للقوى العاملة (TCOW):</span>
              <span>SAR 926,200</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

