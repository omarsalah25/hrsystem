'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Target,
  ArrowRight,
  Star,
  CheckCircle2,
  AlertCircle,
  Save,
  Sliders,
  TrendingUp,
  Award
} from 'lucide-react';
import api from '@/lib/api';

export default function PerformanceAppraisalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [progress, setProgress] = useState(85);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Competency Ratings
  const [competencies, setCompetencies] = useState({
    technical: 5,
    leadership: 4,
    collaboration: 5,
    innovation: 4,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load first employee and goals
        const empRes = await api.employees.list({ per_page: 1 });
        if (empRes?.data?.data && empRes.data.data.length > 0) {
          const emp = empRes.data.data[0];
          setEmployee(emp);
          const goalRes = await api.performance.listGoals({ employee_id: emp.id });
          if (goalRes?.data) {
            setGoals(goalRes.data);
            if (goalRes.data.length > 0) {
              setProgress(goalRes.data[0].progress_percentage || 85);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load performance data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [goalId]);

  const handleUpdateGoal = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);
      if (goals.length > 0) {
        await api.performance.updateProgress(goals[0].id, {
          progress_percentage: progress,
          status: progress >= 100 ? 'ACHIEVED' : 'IN_PROGRESS',
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'فشل حفظ التقييم');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">جاري استرجاع نموذج تقييم الأداء السنوي (360° Appraisal)...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const overallScore = (
    (progress / 100) * 0.6 +
    ((competencies.technical + competencies.leadership + competencies.collaboration + competencies.innovation) / 20) * 0.4
  ) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/performance')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إدارة الأداء والتقييم السنوي</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">مراجعة التقييم الفردي (Q4-2026 OKR & Appraisal)</span>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">تم حفظ التقييم ونسبة إنجاز الأهداف بنجاح.</span>
          </div>
        )}

        {/* Master Performance Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl border border-indigo-200">
                {employee?.first_name?.[0]}{employee?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">
                  {employee?.first_name} {employee?.last_name}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {employee?.designation?.title || 'كبير مهندسي البرمجيات'} • {employee?.department?.name || 'إدارة التقنية'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    دورة التقييم: الربع الرابع Q4-2026
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    المعايرة: 9-Box Grid (High Performer)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500">الدرجة النهائية المركبة:</span>
              <p className="text-3xl font-black text-indigo-600 mt-0.5 font-mono">{overallScore.toFixed(1)}%</p>
              <span className="text-[11px] font-bold text-emerald-600">يتجاوز التوقعات (Exceeds)</span>
            </div>
          </div>
        </div>

        {/* Strategic OKR Goals Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>الأهداف الاستراتيجية ونتائج الأعمال (Weight: 60%)</span>
          </h2>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  {goals[0]?.title || 'أتمتة تكامل منصة مدد ونظام حماية الأجور بنسبة 100%'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  النتيجة الرئيسية المحققة: بناء واجهة API لتوليد ملفات SIF 3.0 ومطابقتها آلياً مع كشوف البنك.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {progress >= 100 ? 'مكتمل (ACHIEVED)' : 'قيد التنفيذ (IN_PROGRESS)'}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>مستوى التقدم الفعلي:</span>
                <span className="font-mono text-base font-bold text-indigo-600">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0% لم يبدأ</span>
                <span>50% في المسار الطبيعي</span>
                <span>100% تم الإنجاز بالكامل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Competencies Rating Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>الجدارات والمهارات القيادية والسلوكية (Weight: 40%)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'technical', title: 'الكفاءة والتميز الهندسي', desc: 'جودة الكود، الأمان البرمجي، ومعمارية النظم الموزعة' },
              { key: 'leadership', title: 'القيادة والمبادرة', desc: 'تحمل المسؤولية، توجيه الفريق، وحل المشكلات المعقدة' },
              { key: 'collaboration', title: 'التعاون وروح الفريق', desc: 'التواصل الفعال عبر الفرق متعددة التخصصات' },
              { key: 'innovation', title: 'الابتكار والتطوير المستمر', desc: 'اقتراح حلول ذكية لتقليل الهدر التشغيلي وتحسين الأداء' },
            ].map(comp => (
              <div key={comp.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{comp.title}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCompetencies({ ...competencies, [comp.key]: star })}
                        className="hover:scale-110 transition"
                      >
                        <Star className={`w-4 h-4 ${star <= (competencies as any)[comp.key] ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500">{comp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Qualitative Feedback & Sign-off */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">ملاحظات المدير المباشر وخطة التطوير</h3>
          <textarea
            rows={3}
            defaultValue="أظهر الموظف كفاءة استثنائية في ربط أنظمة الدفع وبصمات الحضور. نوصي بترشيحه لبرنامج القيادات التقنية الشابة للعام 2027."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push('/performance')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
            >
              العودة
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleUpdateGoal}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الاعتماد...' : 'حفظ واعتماد التقييم السنوي'}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

