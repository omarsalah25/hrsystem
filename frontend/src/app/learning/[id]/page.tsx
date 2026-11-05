'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  GraduationCap,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  Users,
  BookOpen,
  Download,
  ShieldCheck,
  Video
} from 'lucide-react';
import api from '@/lib/api';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>({
    id: courseId,
    title: 'الامتثال لأنظمة العمل وحماية الأجور (Saudi Labor Law & WPS Mastery)',
    category: 'الامتثال النظامي والحوكمة',
    instructor: 'د. خالد التميمي - مستشار أنظمة العمل',
    duration: '6 ساعات تدريبية (4 وحدات)',
    is_mandatory: true,
    description: 'برنامج تدريبي تطبيقي يغطي أحكام نظام العمل السعودي، ضوابط احتساب مكافأة نهاية الخدمة، وإجراءات تدقيق ملفات حماية الأجور (مدد).',
  });

  const [trainees, setTrainees] = useState<any[]>([
    { id: '1', name: 'عبدالله العتيبي', dept: 'تقنية المعلومات', progress: 100, score: 96, certified: true },
    { id: '2', name: 'سارة القحطاني', dept: 'الموارد البشرية', progress: 85, score: 88, certified: false },
    { id: '3', name: 'أحمد الشافعي', dept: 'تقنية المعلومات', progress: 100, score: 94, certified: true },
    { id: '4', name: 'نورهان المنشاوي', dept: 'العمليات', progress: 60, score: null, certified: false },
  ]);

  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/learning')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بوابة التعلم والتطوير (L&D)</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{course.title}</span>
        </div>

        {/* Master Course Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-800">{course.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  إلزامي نظامياً (Mandatory)
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span>المدرب: {course.instructor}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.duration}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>{course.category}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>شهادة معتمدة رقمياً بنظام QR</span>
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Modules Syllabus */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>محاور ووحدات الدورة التدريبية</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { num: '01', title: 'أسس نظام العمل السعودي والمصري واللوائح المنظمة', time: '1.5 ساعة' },
              { num: '02', title: 'معادلات التأمينات الاجتماعية والضرائب المتدرجة', time: '1.5 ساعة' },
              { num: '03', title: 'إدارة مسيرات الرواتب وضوابط ملفات مدد SIF', time: '1.5 ساعة' },
              { num: '04', title: 'مكافأة نهاية الخدمة والتقارير الرقابية', time: '1.5 ساعة' },
            ].map(m => (
              <div key={m.num} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center">
                    {m.num}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-400">{m.time}</p>
                  </div>
                </div>
                <Video className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled Trainees & Completion Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>سجل المتدربين والشهادات الصادرة ({trainees.length} متدربين)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">اسم الموظف</th>
                  <th className="py-3 px-4">الإدارة</th>
                  <th className="py-3 px-4">نسبة الإنجاز</th>
                  <th className="py-3 px-4">درجة الاختبار</th>
                  <th className="py-3 px-4">الشهادة المعتمدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainees.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{t.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{t.dept}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${t.progress === 100 ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {t.score ? `${t.score}/100` : 'قيد التدريب'}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.certified ? (
                        <button
                          onClick={() => setSelectedCert(t)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>عرض الشهادة</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">غير مكتمل بعد</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certificate Modal Preview */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-4 border-indigo-100 text-center space-y-4">
              <Award className="w-16 h-16 text-indigo-600 mx-auto" />
              <div>
                <span className="text-xs font-bold text-indigo-600 tracking-wider">شهادة إتمام وتفوق مهني</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">نشهد بأن الموظف / {selectedCert.name}</h3>
                <p className="text-xs text-slate-500 mt-2">
                  قد أتم بنجاح البرنامج التدريبي المتخصص: <strong>{course.title}</strong> وحصل على تقييم امتياز بدرجة {selectedCert.score}%.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-400">
                رمز التحقق الرقمي: CERT-2026-{selectedCert.id}982-KSA
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                >
                  إغلاق الشهادة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

