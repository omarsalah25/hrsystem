'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
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
  const { t, locale } = useTranslation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
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

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
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

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'تقديم طلب إجازة جديد' : 'Apply for Leave'}</span>
        </button>
      </div>

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

            <div className="space-y-4 my-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">نوع الإجازة</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option>إجازة سنوية اعتيادية (Annual Leave)</option>
                  <option>إجازة مرضية (Sick Leave - تقرير طبي)</option>
                  <option>إجازة عارضة (Casual Leave)</option>
                  <option>إجازة حج (مرة واحدة في الخدمة)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ البدء</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">سبب الإجازة وملاحظات التغطية</label>
                <textarea rows={3} placeholder="يرجى كتابة سبب الإجازة وزميل العمل المغطي للمهام..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-700">
                <p className="font-semibold">تأمين المستندات في التخزين الخاص:</p>
                <p className="mt-0.5 text-[11px] text-blue-600">أي تقارير طبية مرفقة تُخزن في مجلد خاص مشفر (storage/app/private) ولا تتاح إلا للمدير المخول.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => { setIsApplyModalOpen(false); alert('تم تقديم طلب الإجازة بنجاح'); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                إرسال الطلب للاعتماد
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

