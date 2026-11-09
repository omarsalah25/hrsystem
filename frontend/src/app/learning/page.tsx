'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Clock,
  ExternalLink,
  Plus,
  X
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
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 'CRS-001',
      title: 'التوعية بالأمن السيبراني وحماية البيانات (Cybersecurity & GDPR)',
      category: 'امتثال إلزامي (Compliance)',
      durationHours: 4,
      isMandatory: true,
      enrolledCount: 28,
      completionRate: 94,
    },
    {
      id: 'CRS-002',
      title: 'دليل نظام العمل السعودي ومنصة قوى للعقود (Saudi Labor & Qiwa)',
      category: 'الشؤون القانونية',
      durationHours: 6,
      isMandatory: false,
      enrolledCount: 35,
      completionRate: 80,
    },
    {
      id: 'CRS-003',
      title: 'معايير السلامة المهنية والصحة (OSHA Standards)',
      category: 'سلامة مهنية',
      durationHours: 8,
      isMandatory: true,
      enrolledCount: 14,
      completionRate: 98,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'امتثال إلزامي (Compliance)',
    duration: '6 ساعات',
    instructor: 'أكاديمية الموارد البشرية',
    description: '',
    mandatory: true,
  });

  const loadCourses = () => {
    api.learning.listCourses()
      .then((res: any) => {
        const rawItems = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (rawItems.length > 0) {
          const mapped: Course[] = rawItems.map((c: any) => ({
            id: c.id,
            title: isAr ? (c.title_ar || c.title) : (c.title_en || c.title_ar || c.title),
            category: c.category,
            durationHours: parseInt(c.duration) || 6,
            isMandatory: Boolean(c.is_mandatory ?? c.mandatory),
            enrolledCount: c.enrolled_count || 14,
            completionRate: c.completion_rate || 90,
          }));
          setCourses(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch courses from API:', err);
      });
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;
    setSubmitting(true);
    try {
      await api.learning.createCourse(newCourse);
      setShowAddModal(false);
      setNewCourse({
        title: '',
        category: 'امتثال إلزامي (Compliance)',
        duration: '6 ساعات',
        instructor: 'أكاديمية الموارد البشرية',
        description: '',
        mandatory: true,
      });
      setFeedbackMsg(isAr ? 'تم إضافة البرنامج التدريبي بنجاح وإتاحته للتسجيل' : 'Course added successfully');
      loadCourses();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'تعذر إضافة الدورة التدريبية');
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة دورة جديدة' : 'Add Course'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

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
                  <p className="text-xs text-slate-500 mt-0.5">التصنيف: {c.category} • المدة: {c.durationHours} ساعات • المسجلون: {c.enrolledCount}</p>
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

                <button
                  onClick={() => router.push(`/learning/${c.id}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  عرض المسجلين والشهادات
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

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'إضافة برنامج تدريبي جديد' : 'Add Training Program'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 my-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">عنوان الدورة التدريبية</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="مثال: أساسيات الامتثال لنظام حماية البيانات الشخصية PDPL"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="امتثال إلزامي (Compliance)">امتثال إلزامي (Compliance)</option>
                    <option value="تطوير قيادي (Leadership)">تطوير قيادي (Leadership)</option>
                    <option value="الأمن السيبراني والتقنية">الأمن السيبراني والتقنية</option>
                    <option value="السلامة المهنية (OSHA)">السلامة المهنية (OSHA)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المدة التدريبية</label>
                  <input
                    type="text"
                    required
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    placeholder="6 ساعات"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الجهة المقدمة / المدرب</label>
                <input
                  type="text"
                  required
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">وصف البرنامج والمحاور</label>
                <textarea
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="أهداف البرنامج والمخرجات المتوقعة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-100 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCourse.mandatory}
                  onChange={(e) => setNewCourse({ ...newCourse, mandatory: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-bold text-blue-900">دورة امتثال إلزامية لكافة الموظفين</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  {submitting ? 'جاري الحفظ...' : 'نشر الدورة التدريبية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
