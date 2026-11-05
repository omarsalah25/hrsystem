'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  Briefcase,
  Plus,
  Star,
  Calendar,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  rating: number;
  experienceYears: number;
  stage: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED';
  source: string;
}

export default function RecruitmentPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [openings, setOpenings] = useState<any[]>([]);

  useEffect(() => {
    api.recruitment.listOpenings().then(res => {
      if (res?.data && res.data.length > 0) {
        setOpenings(res.data);
      }
    }).catch(console.error);
  }, []);

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'م. عمر خالد السالم',
      role: 'Senior Full Stack Engineer',
      rating: 4.5,
      experienceYears: 6,
      stage: 'INTERVIEW',
      source: 'LinkedIn Inbound',
    },
    {
      id: '2',
      name: 'أ. دينا مصطفى فهمي',
      role: 'Product Designer (UI/UX)',
      rating: 4.8,
      experienceYears: 5,
      stage: 'OFFER',
      source: 'Internal Referral',
    },
    {
      id: '3',
      name: 'م. يوسف حسن المنصور',
      role: 'DevOps & Cloud Engineer',
      rating: 4.2,
      experienceYears: 4,
      stage: 'SCREENING',
      source: 'Careers Portal',
    },
    {
      id: '4',
      name: 'أ. حازم رضوان السيد',
      role: 'Senior Financial Analyst',
      rating: 3.9,
      experienceYears: 7,
      stage: 'APPLIED',
      source: 'LinkedIn Inbound',
    },
  ]);

  const stages = [
    { key: 'APPLIED', label: locale === 'ar' ? 'تم التقديم' : 'Applied', color: 'border-slate-300' },
    { key: 'SCREENING', label: locale === 'ar' ? 'الفرز الأولي' : 'Screening', color: 'border-blue-400' },
    { key: 'INTERVIEW', label: locale === 'ar' ? 'المقابلات الفنية' : 'Interviews', color: 'border-purple-400' },
    { key: 'OFFER', label: locale === 'ar' ? 'عرض العمل' : 'Job Offer', color: 'border-amber-400' },
    { key: 'HIRED', label: locale === 'ar' ? 'تم التعيين' : 'Hired', color: 'border-emerald-500' },
  ];

  const advanceCandidate = (id: string) => {
    const stageOrder: Candidate['stage'][] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const currentIndex = stageOrder.indexOf(c.stage);
          const nextIndex = Math.min(currentIndex + 1, stageOrder.length - 1);
          return { ...c, stage: stageOrder[nextIndex] };
        }
        return c;
      })
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'ar' ? 'التوظيف واستقطاب الكفاءات (ATS)' : 'Talent Acquisition (ATS)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'متابعة مسار المرشحين، تقييم بطاقات المقابلات، وإصدار عروض العمل الرقمية'
              : 'Track candidate stages, interview scorecards, and issue digital job offers'}
          </p>
        </div>

        <button
          onClick={() => alert('نافذة نشر إعلان وظيفي جديد عبر البوابة ولينكدإن')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'نشر وظيفة جديدة' : 'Post New Job'}</span>
        </button>
      </div>

      {/* Active Job Openings Navigation */}
      {openings.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">الوظائف والفرص الشاغرة المفتوحة:</span>
            <span className="text-xs text-slate-400">{openings.length} وظيفة متاحة</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openings.map(op => (
              <div
                key={op.id}
                onClick={() => router.push(`/recruitment/${op.id}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{op.title_ar}</h4>
                  <p className="text-xs text-slate-500">{op.title_en} • {op.department?.name || 'التقنية'}</p>
                </div>
                <div className="text-left">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    {op.applications_count || 0} مرشح
                  </span>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">فتح مسار الفرز &larr;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.key);

          return (
            <div key={stage.key} className="bg-slate-100/70 p-3.5 rounded-2xl flex flex-col min-w-[240px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageCandidates.map((c) => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{c.rating}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">{c.role}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      <span>{c.experienceYears} سنوات خبرة</span>
                      <span>{c.source}</span>
                    </div>

                    {c.stage !== 'HIRED' && (
                      <button
                        onClick={() => advanceCandidate(c.id)}
                        className="w-full mt-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg transition"
                      >
                        {locale === 'ar' ? 'نقل للمرحلة التالية →' : 'Advance Stage →'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

