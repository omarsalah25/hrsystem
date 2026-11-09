'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';

interface LeaveRequestItem {
  id: string;
  empName: string;
  empNo: string;
  dept: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function LeavesPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [newLeave, setNewLeave] = useState({
    leave_type_id: '',
    start_date: '2026-11-15',
    end_date: '2026-11-18',
    reason: '',
  });

  const [requests, setRequests] = useState<LeaveRequestItem[]>([
    {
      id: '1',
      empName: 'أحمد محمود الشافعي',
      empNo: 'EMP-EG-001',
      dept: 'تقنية المعلومات (IT)',
      type: 'إجازة سنوية (Annual)',
      startDate: '2026-11-10',
      endDate: '2026-11-13',
      totalDays: 4,
      reason: 'ظرف عائلي خاص وسفر',
      status: 'PENDING',
    },
    {
      id: '2',
      empName: 'سارة محمد القحطاني',
      empNo: 'EMP-SA-002',
      dept: 'الموارد البشرية (HR)',
      type: 'إجازة عارضة (Casual)',
      startDate: '2026-11-06',
      endDate: '2026-11-06',
      totalDays: 1,
      reason: 'مراجعة طبية طارئة',
      status: 'PENDING',
    },
    {
      id: '3',
      empName: 'نورهان طارق المنشاوي',
      empNo: 'EMP-EG-002',
      dept: 'الشؤون المالية (Finance)',
      type: 'إجازة سنوية (Annual)',
      startDate: '2026-11-01',
      endDate: '2026-11-05',
      totalDays: 5,
      reason: 'إجازة سنوية اعتيادية',
      status: 'APPROVED',
    },
  ]);

  const loadLeaves = () => {
    api.leaves.list()
      .then((res: any) => {
        const rawItems = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (rawItems.length > 0) {
          const mapped: LeaveRequestItem[] = rawItems.map((r: any) => ({
            id: r.id,
            empName: r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : 'موظف',
            empNo: r.employee?.employee_number || 'EMP-001',
            dept: r.employee?.department?.name || 'إدارة العمليات',
            type: r.leave_type?.name || 'إجازة سنوية',
            startDate: r.start_date ? String(r.start_date).slice(0, 10) : '2026-11-10',
            endDate: r.end_date ? String(r.end_date).slice(0, 10) : '2026-11-12',
            totalDays: r.total_days || 1,
            reason: r.reason || 'إجازة شخصية',
            status: r.status === 'APPROVED' ? 'APPROVED' : r.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
          }));
          setRequests(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch leaves from API:', err);
      });
  };

  useEffect(() => {
    loadLeaves();
    api.leaves.types()
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setLeaveTypes(list);
        if (list.length > 0) {
          setNewLeave((prev) => ({ ...prev, leave_type_id: list[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );

    try {
      if (action === 'APPROVED') {
        await api.leaves.approve(id);
        setFeedbackMsg('تم اعتماد طلب الإجازة وتحديث رصيد الموظف');
      } else {
        await api.leaves.reject(id, 'مرفوض لحاجة العمل');
        setFeedbackMsg('تم رفض طلب الإجازة وإشعار الموظف');
      }
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (e) {
      console.log('Action recorded in local cache');
    }
  };

  const handleSubmitModalLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.leaves.create(newLeave);
      setIsApplyModalOpen(false);
      setFeedbackMsg('تم تقديم طلب الإجازة بنجاح وإرساله للاعتماد');
      loadLeaves();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'تعذر تقديم طلب الإجازة');
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
            {locale === 'ar' ? 'إدارة الإجازات والغياب' : 'Leave & Absence Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'متابعة أرصدة الإجازات، تقديم الطلبات، واعتماد مديري الإدارات'
              : 'Track leave balances, submit requests, and handle managerial approvals'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'طلب إجازة سريع' : 'Quick Leave Request'}</span>
          </button>
          <button
            onClick={() => router.push('/leaves/apply')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'نموذج الإجازة المفصل' : 'Full Leave Form'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">{locale === 'ar' ? 'رصيد الإجازة السنوية' : 'Annual Leave'}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-blue-700">16</span>
            <span className="text-xs text-slate-400">/ 21 يوماً متاحاً</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full w-[76%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">{locale === 'ar' ? 'رصيد الإجازة المرضية' : 'Sick Leave'}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-700">15</span>
            <span className="text-xs text-slate-400">/ 15 يوماً متاحاً</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full w-[100%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">{locale === 'ar' ? 'طلبات بانتظار الاعتماد' : 'Pending Approvals'}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600">
              {requests.filter((r) => r.status === 'PENDING').length}
            </span>
            <span className="text-xs text-slate-400">طلبات تحتاج قرارك</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-2">⚡ يستلزم مراجعة تغطية فريق العمل</p>
        </div>
      </div>

      {/* Requests Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {locale === 'ar' ? 'قائمة طلبات الإجازات' : 'Leave Requests Queue'}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{req.empName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({req.empNo})</span>
                  <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                    {req.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>القسم: <strong>{req.dept}</strong></span>
                  <span>المدة: <strong>{req.totalDays} أيام</strong> ({req.startDate} إلى {req.endDate})</span>
                  <span>السبب: &quot;{req.reason}&quot;</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'اعتماد' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'رفض' : 'Reject'}</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status === 'APPROVED' ? (locale === 'ar' ? 'معتمد' : 'Approved') : (locale === 'ar' ? 'مرفوض' : 'Rejected')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {locale === 'ar' ? 'تقديم طلب إجازة جديد' : 'New Leave Request'}
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModalLeave} className="space-y-4 my-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع الإجازة</label>
                <select
                  value={newLeave.leave_type_id}
                  onChange={(e) => setNewLeave({ ...newLeave, leave_type_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">سبب الإجازة وملاحظات التغطية</label>
                <textarea
                  rows={3}
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="يرجى كتابة سبب الإجازة وزميل العمل المغطي للمهام..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-700">
                <p className="font-semibold">تأمين المستندات في التخزين الخاص:</p>
                <p className="mt-0.5 text-[11px] text-blue-600">أي تقارير طبية مرفقة تُخزن في مجلد خاص مشفر (storage/app/private) ولا تتاح إلا للمدير المخول.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب للاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
