'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  durationHours: number;
  isMandatory: boolean;
  enrolledCount: number;
  completionRate: number;
}

interface Certificate {
  id: string;
  employeeName: string;
  empNo: string;
  certName: string;
  issuer: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export default function LearningPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const courses: Course[] = [
    {
      id: '1',
      title: 'التوعية بالأمن السيبراني وحماية البيانات (Cybersecurity & GDPR)',
      category: 'امتثال إلزامي (Compliance)',
      durationHours: 4,
      isMandatory: true,
      enrolledCount: 148,
      completionRate: 94,
    },
    {
      id: '2',
      title: 'دليل نظام العمل السعودي ومنصة قوى للعقود (Saudi Labor & Qiwa)',
      category: 'الشؤون القانونية',
      durationHours: 6,
      isMandatory: false,
      enrolledCount: 35,
      completionRate: 80,
    },
    {
      id: '3',
      title: 'معايير السلامة المهنية والصحة (OSHA Standards)',
      category: 'سلامة مهنية',
      durationHours: 8,
      isMandatory: true,
      enrolledCount: 148,
      completionRate: 98,
    },
  ];

  const certificates: Certificate[] = [
    {
      id: '1',
      employeeName: 'أحمد محمود الشافعي',
      empNo: 'EMP-EG-001',
      certName: 'إقامة العمل ورخصة الإقامة (Saudi Work Iqama)',
      issuer: 'وزارة الموارد البشرية والجوازات',
      expiryDate: '2026-12-15',
      daysRemaining: 40,
      status: 'EXPIRING_SOON',
    },
    {
      id: '2',
      employeeName: 'عبدالله سعد العتيبي',
      empNo: 'EMP-SA-001',
      certName: 'شهادة الاعتماد المهني للهندسة (SCE)',
      issuer: 'الهيئة السعودية للمهندسين',
      expiryDate: '2027-06-30',
      daysRemaining: 600,
      status: 'VALID',
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'التدريب والتطوير وإدارة الشهادات (L&D)' : 'Learning & Certifications'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'متابعة الدورات التدريبية الإلزامية، قياس الامتثال، وتنبيهات انتهاء الرخص والإقامات'
              : 'Track mandatory compliance trainings & certificate/permit expirations'}
          </p>
        </div>

        <button
          onClick={() => alert('نافذة إضافة دورة تدريبية أو شهادة جديدة')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة دورة جديدة' : 'Add Course'}</span>
        </button>
      </div>

      {/* Proactive Expiration Alerts */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-xs text-amber-900">
              {isAr ? 'تنبيه نظامي: مستندات ورخص مهنية تقترب من موعد الانتهاء' : 'Statutory Document Expiry Alert'}
            </h3>
            <p className="text-[11px] text-amber-700 mt-1">
              يوجد <strong className="font-black">1 مستند إقامة / رخصة</strong> تنتهي خلال أقل من 60 يوماً. يرجى تجديدها لتفادي تجميد الحسابات البنكية في نظام حماية الأجور (WPS).
            </p>
          </div>
        </div>
      </div>

      {/* Courses Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {isAr ? 'الدورات التدريبية وبرامج الامتثال الإلزامي' : 'Mandatory Compliance Courses'}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {courses.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{c.title}</span>
                    {c.isMandatory && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-black rounded-full">
                        إلزامي
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">التصنيف: {c.category} • المدة: {c.durationHours} ساعات</p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="w-36 text-end">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>نسبة الإنجاز:</span>
                    <span className="text-emerald-600">{c.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.completionRate}%` }}></div>
                  </div>
                </div>

                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
                  عرض المسجلين
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications and Licensure Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {isAr ? 'سجل الرخص المهنية والإقامات والاعتمادات' : 'Professional Licenses & Permit Tracking'}
          </h2>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="p-4 text-start font-semibold">الموظف</th>
                <th className="p-4 text-start font-semibold">اسم الرخصة / المستند</th>
                <th className="p-4 text-start font-semibold">الجهة المصدرة</th>
                <th className="p-4 text-start font-semibold">تاريخ الانتهاء</th>
                <th className="p-4 text-start font-semibold">المتبقي</th>
                <th className="p-4 text-start font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/70">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{cert.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cert.empNo}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{cert.certName}</td>
                  <td className="p-4 text-slate-600">{cert.issuer}</td>
                  <td className="p-4 font-mono font-bold text-slate-700">{cert.expiryDate}</td>
                  <td className="p-4">
                    <span className="font-bold text-amber-600">{cert.daysRemaining} يوماً</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      cert.status === 'EXPIRING_SOON'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cert.status === 'EXPIRING_SOON' ? '⚠️ تنتهي قريباً' : '✓ سارية'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

