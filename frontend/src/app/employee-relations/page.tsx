'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import {
  Scale,
  ShieldAlert,
  Plus,
  EyeOff,
  Clock,
  CheckCircle2,
  FileText,
  HeartHandshake,
  X
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
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [cases, setCases] = useState<GrievanceCase[]>([
    {
      id: '1',
      caseNumber: 'GRC-2026-0001',
      title: 'طلب مراجعة درجات التكييف والإضاءة في قاعة العمليات بالرياض',
      category: 'خلافات بيئة العمل والصحة المهنية',
      isAnonymous: true,
      complainant: 'سارة محمد القحطاني',
      assignedInvestigator: 'لجنة المرافق والسلامة',
      dateFiled: '2026-11-02',
      status: 'RESOLVED',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'WORKPLACE_ENVIRONMENT',
    severity: 'MEDIUM',
    incident_date: new Date().toISOString().slice(0, 10),
    incident_description: '',
    is_confidential: true,
  });

  const loadGrievances = () => {
    api.grievances.list()
      .then((res: any) => {
        const rawItems = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (rawItems.length > 0) {
          const mapped: GrievanceCase[] = rawItems.map((g: any) => ({
            id: g.id,
            caseNumber: g.case_number || `GRC-${g.id.slice(0, 6)}`,
            title: g.incident_description ? (g.incident_description.length > 65 ? g.incident_description.slice(0, 65) + '...' : g.incident_description) : 'شكوى إدارية',
            category: g.category || 'بيئة العمل',
            isAnonymous: Boolean(g.is_confidential),
            complainant: g.complainant ? `${g.complainant.first_name} ${g.complainant.last_name}` : 'سرّي',
            assignedInvestigator: 'لجنة الموارد البشرية',
            dateFiled: g.created_at ? g.created_at.slice(0, 10) : '2026-11-05',
            status: g.status === 'RESOLVED' ? 'RESOLVED' : 'INVESTIGATING',
          }));
          setCases(mapped);
        }
      })
      .catch((err) => {
        console.warn('Failed to load grievances from API:', err);
      });
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const handleCreateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.incident_description.trim()) return;
    setSubmitting(true);
    try {
      await api.grievances.create(formData);
      setShowCreateModal(false);
      setFormData({
        category: 'WORKPLACE_ENVIRONMENT',
        severity: 'MEDIUM',
        incident_date: new Date().toISOString().slice(0, 10),
        incident_description: '',
        is_confidential: true,
      });
      setFeedbackMsg(isAr ? 'تم تسجيل الشكوى السرية بنجاح وإحالتها للجنة التحقيق المختصة' : 'Confidential grievance filed successfully');
      loadGrievances();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'فشل تسجيل الشكوى');
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'تقديم شكوى سرية جديدة' : 'Report Grievance'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

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
            <span className="text-2xl font-black text-amber-600">
              {cases.filter(c => c.status !== 'RESOLVED').length} قضايا
            </span>
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
                      <span>إبلاغ سري</span>
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
                  c.status === 'INVESTIGATING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {c.status === 'INVESTIGATING' ? 'قيد التحقيق وسماع الأقوال' : 'تم إعداد التقرير والحل'}
                </span>
                <button
                  onClick={() => router.push(`/employee-relations/${c.id}`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  فتح ملف التحقيق
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Grievance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'تقديم شكوى أو إبلاغ سري جديد' : 'Submit Confidential Grievance'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGrievance} className="space-y-4 my-5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تصنيف الشكوى</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="WORKPLACE_ENVIRONMENT">بيئة العمل والصحة المهنية</option>
                    <option value="POLICY_VIOLATION">مخالفة لائحة العمل الداخلية</option>
                    <option value="HARASSMENT_OR_DISCRIMINATION">سلوك غير مهني أو تمييز</option>
                    <option value="COMPENSATION_DISPUTE">تظلم مالي أو استحقاقات</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">درجة الأهمية</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="LOW">عادية (Low)</option>
                    <option value="MEDIUM">متوسطة (Medium)</option>
                    <option value="HIGH">عاجلة (High)</option>
                    <option value="CRITICAL">حرجة جداً (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">تاريخ الواقعة</label>
                <input
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">تفاصيل الشكوى والوقائع (لا يقل عن 10 أحرف)</label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={formData.incident_description}
                  onChange={(e) => setFormData({ ...formData, incident_description: e.target.value })}
                  placeholder="يرجى شرح الواقعة بالتفصيل مع ذكر المكان والتوقيت إن أمكن..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-purple-50/70 border border-purple-100 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_confidential}
                  onChange={(e) => setFormData({ ...formData, is_confidential: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <span className="font-bold text-purple-900">تفعيل حماية سرية الهوية (Confidential Whistleblower Mode)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  {submitting ? 'جاري التسجيل...' : 'تأكيد وإرسال للتحقيق'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
