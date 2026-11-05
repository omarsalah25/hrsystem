'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Scale,
  ShieldAlert,
  Plus,
  EyeOff,
  Clock,
  CheckCircle2,
  FileText,
  HeartHandshake
} from 'lucide-react';

interface GrievanceCase {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  isAnonymous: boolean;
  complainant: string;
  assignedInvestigator: string;
  dateFiled: string;
  status: 'INTAKE' | 'INVESTIGATING' | 'FINDINGS_READY' | 'RESOLVED';
}

export default function EmployeeRelationsPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [cases, setCases] = useState<GrievanceCase[]>([
    {
      id: '1',
      caseNumber: 'CASE-2026-08',
      title: 'نزاع حول توزيع مهام العمل الإضافي في الوردية الليلية',
      category: 'خلافات بيئة العمل والعدالة التشغيلية',
      isAnonymous: false,
      complainant: 'موظف تشغيل (فرع الرياض)',
      assignedInvestigator: 'سارة محمد القحطاني (HR Lead)',
      dateFiled: '2026-11-02',
      status: 'INVESTIGATING',
    },
    {
      id: '2',
      caseNumber: 'CASE-2026-07',
      title: 'إبلاغ سرّي عن اشتباه بمخالفة في تقييم أداء أحد الموظفين',
      category: 'نزاهة وحوكمة إدارية',
      isAnonymous: true,
      complainant: 'مجهول الهوية (قناة الإبلاغ السرية المشفرة)',
      assignedInvestigator: 'د. عبدالله السعيد (HR Director)',
      dateFiled: '2026-10-25',
      status: 'FINDINGS_READY',
    },
  ]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'علاقات العمل والشكاوى السرية (Employee Relations)' : 'Employee Relations & Grievances'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'إدارة الشكاوى، قناة الإبلاغ السرية المجهولة، لجان التحقيق، وتدابير حماية بيئة العمل العادلة'
              : 'Confidential whistleblower channel, workplace investigations, and fair remediation'}
          </p>
        </div>

        <button
          onClick={() => alert('نافذة تسجيل شكوى أو إبلاغ سري جديد')}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'تقديم شكوى سرية جديدة' : 'Report Grievance'}</span>
        </button>
      </div>

      {/* Metrics & eNPS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">مؤشر رضا وسعادة الموظفين (eNPS)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-600">+48</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">ممتاز (Excellent)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">استناداً إلى استطلاع النبض لربع Q3 2026</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">القضايا قيد التحقيق حالياً</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600">2 قضايا</span>
            <span className="text-xs text-slate-400">متوسط الإغلاق 12 يوماً</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">مطابق للائحة التحقيق المعتمدة</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">حماية المبلّغين وعدم التمييز</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-700">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>نظام إبلاغ سري مشفر بالكامل</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">حماية تامة من أي إجراءات انتقامية</p>
        </div>
      </div>

      {/* Cases Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {isAr ? 'سجل الشكاوى والتحقيقات الإدارية النشطة' : 'Active Grievance & Investigation Cases'}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {cases.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-700 text-xs">{c.caseNumber}</span>
                  <span className="font-bold text-slate-900 text-sm">{c.title}</span>
                  {c.isAnonymous && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-full">
                      <EyeOff className="w-3 h-3" />
                      <span>إبلاغ مجهول</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                  <span>التصنيف: <strong className="text-slate-700">{c.category}</strong></span>
                  <span>المحقق المكلف: <strong className="text-slate-700">{c.assignedInvestigator}</strong></span>
                  <span>تاريخ التقديم: {c.dateFiled}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  c.status === 'INVESTIGATING' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {c.status === 'INVESTIGATING' ? 'قيد التحقيق وسماع الأقوال' : 'تم إعداد التقرير والمذكرة'}
                </span>
                <button
                  onClick={() => alert(`عرض المذكرة السرية للقضية ${c.caseNumber}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  عرض الملف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

