'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ShieldAlert,
  ArrowRight,
  User,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  MessageSquare
} from 'lucide-react';
import api from '@/lib/api';

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('UNDER_INVESTIGATION');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.grievances.get(caseId);
        if (res?.data) {
          setCaseData(res.data);
          setStatus(res.data.status);
          setNotes(res.data.resolution_notes || '');
        }
      } catch (err) {
        console.error('Failed to load grievance details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (caseId) {
      loadData();
    }
  }, [caseId]);

  const handleUpdateStatus = async () => {
    try {
      setSaving(true);
      await api.grievances.updateStatus(caseId, {
        status,
        resolution_notes: notes,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'فشل تحديث حالة الشكوى');
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
            <p className="text-slate-600 font-medium">جاري استرجاع ملف التحقيق الإداري السري...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">لم يتم العثور على القضية</h2>
          <button
            onClick={() => router.push('/employee-relations')}
            className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow"
          >
            العودة إلى علاقات الموظفين
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/employee-relations')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>علاقات الموظفين والشكاوى</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{caseData.case_number}</span>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">تم تحديث حالة القضية ومحضر لجنة التحقيق بنجاح.</span>
          </div>
        )}

        {/* Master Case Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -z-0" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-800">{caseData.case_number}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>سري للغاية ومحمي (Strictly Confidential)</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span>التصنيف: {caseData.category}</span>
                <span className="text-slate-300">•</span>
                <span>تاريخ القيد: {caseData.created_at ? new Date(caseData.created_at).toLocaleDateString('ar-EG') : '2026-11-05'}</span>
              </p>
            </div>

            <div>
              <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                status === 'RESOLVED' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {status === 'RESOLVED' ? 'تمت التسوية والحل' : status === 'HEARING_SCHEDULED' ? 'جلسة استماع مجدولة' : status}
              </span>
            </div>
          </div>
        </div>

        {/* Involved Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-indigo-600" />
              <span>مقدم الشكوى (Complainant)</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
              <p className="font-bold text-slate-800">
                {caseData.complainant?.first_name} {caseData.complainant?.last_name}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {caseData.complainant?.employee_number} • {caseData.complainant?.department?.name || 'إدارة العمليات'}
              </p>
              <p className="text-xs text-slate-500">{caseData.complainant?.work_email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>الطرف المشكو في حقه (Respondent)</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-sm">
              {caseData.respondent ? (
                <>
                  <p className="font-bold text-slate-800">
                    {caseData.respondent?.first_name} {caseData.respondent?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {caseData.respondent?.employee_number} • {caseData.respondent?.department?.name}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-xs py-2">
                  شكوى متعلقة ببيئة العمل والسياسات العامة (لا يوجد مشكو في حقه فردي مباشر).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Incident Narrative */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>بيان الوقائع وتفاصيل الشكوى</span>
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            {caseData.incident_description}
          </div>
        </div>

        {/* Resolution & Committee Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>محضر وقرار لجنة التحقيق والوساطة العمالية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">تحديث حالة القضية</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold text-slate-800"
              >
                <option value="FILED">مقيدة حديثاً (FILED)</option>
                <option value="UNDER_INVESTIGATION">قيد التحقيق وجمع الاستدلالات (UNDER_INVESTIGATION)</option>
                <option value="HEARING_SCHEDULED">جلسة استماع محددة (HEARING_SCHEDULED)</option>
                <option value="RESOLVED">تمت التسوية والحل النهائي (RESOLVED)</option>
                <option value="DISMISSED">حفظ الشكوى لعدم الاختصاص أو الثبوت (DISMISSED)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              مخرجات التحقيق والإجراءات التأديبية / الإصلاحية المتخذة:
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="تدوين توصيات لجنة التحقيق، والتوجيهات الإدارية المعتمدة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push('/employee-relations')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
            >
              العودة للقائمة
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleUpdateStatus}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ قرار اللجنة واعتماد المحضر'}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

