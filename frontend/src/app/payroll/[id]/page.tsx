'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CreditCard,
  Building,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  X
} from 'lucide-react';
import api from '@/lib/api';

export default function PayrollBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params?.id as string;

  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Adjustment Modal State
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [adjustData, setAdjustData] = useState({
    other_deductions: 0,
    unpaid_leave_deductions: 0,
    adjustment_reason: '',
  });
  const [adjusting, setAdjusting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.payroll.get(runId);
      if (res?.data) {
        setRun(res.data);
      }
    } catch (err) {
      console.error('Failed to load payroll batch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (runId) {
      loadData();
    }
  }, [runId]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const res = await api.payroll.approve(runId);
      if (res.success) {
        setSuccessMsg('تم اعتماد المسير وإرسال أمر التحويل البنكي بنجاح.');
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'فشل اعتماد المسير');
    } finally {
      setApproving(false);
    }
  };

  const handleOpenAdjust = (ps: any) => {
    setSelectedPayslip(ps);
    setAdjustData({
      other_deductions: Number(ps.other_deductions || 0),
      unpaid_leave_deductions: Number(ps.unpaid_leave_deductions || 0),
      adjustment_reason: '',
    });
  };

  const handleSaveAdjust = async () => {
    if (!adjustData.adjustment_reason) {
      alert('يرجى توضيح سبب التعديل لتدوينه في سجل التدقيق الرقابي.');
      return;
    }

    try {
      setAdjusting(true);
      await api.payroll.adjustPayslip(runId, selectedPayslip.id, adjustData);
      setSelectedPayslip(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل حفظ التعديل');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">جاري استرجاع بيانات مسير الرواتب والعمليات البنكية...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!run) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">لم يتم العثور على مسير الرواتب</h2>
          <button
            onClick={() => router.push('/payroll')}
            className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow hover:bg-indigo-700 transition"
          >
            العودة إلى قائمة المسيرات
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isKSA = run.company?.country_code === 'SAU';
  const currency = run.company?.currency || (isKSA ? 'SAR' : 'EGP');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/payroll')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إدارة الرواتب والأجور</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{run.cycle_name}</span>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Master Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-800">{run.cycle_name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  run.status === 'FINANCE_APPROVED' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {run.status === 'FINANCE_APPROVED' ? 'معتمد للصرف البنكي' : run.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{run.company?.legal_name}</span>
                <span className="text-slate-300">•</span>
                <span>فترة الصرف: {run.start_date} إلى {run.end_date}</span>
                <span className="text-slate-300">•</span>
                <span>تاريخ الاستحقاق: {run.disbursement_date}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => api.payroll.exportWps(run.id)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير ملف مدد (WPS / SIF)</span>
              </button>

              {run.status !== 'FINANCE_APPROVED' && (
                <button
                  disabled={approving}
                  onClick={handleApprove}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approving ? 'جاري الاعتماد...' : 'اعتماد الصرف المالي'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">إجمالي الاستحقاقات (Gross)</p>
              <p className="text-xl font-black text-slate-800 mt-1">
                {Number(run.total_gross).toLocaleString()} {currency}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-700 font-medium">
                {isKSA ? 'استقطاع التأمينات (GOSI EE)' : 'استقطاع التأمينات (SI EE)'}
              </p>
              <p className="text-xl font-black text-rose-700 mt-1">
                {Number(run.total_social_insurance).toLocaleString()} {currency}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">ضريبة كسب العمل (Income Tax)</p>
              <p className="text-xl font-black text-amber-700 mt-1">
                {Number(run.total_income_tax).toLocaleString()} {currency}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-bold">صافي المسير المحول للبنك (Net)</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {Number(run.total_net).toLocaleString()} {currency}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Payslip Lines Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <span>بيان الموظفين واستحقاقاتهم في هذا المسير ({run.payslips?.length || 0} موظف)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">الموظف والوظيفة</th>
                  <th className="py-3.5 px-4">الراتب الشامل (Gross)</th>
                  <th className="py-3.5 px-4">خصم التأمينات (EE)</th>
                  <th className="py-3.5 px-4">مساهمة الشركة (ER)</th>
                  <th className="py-3.5 px-4">الضريبة</th>
                  <th className="py-3.5 px-4">خصومات / غياب</th>
                  <th className="py-3.5 px-4">الصافي المحول (Net)</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {run.payslips?.map((ps: any) => {
                  const emp = ps.employee;
                  return (
                    <tr key={ps.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{emp?.first_name} {emp?.last_name}</p>
                            <p className="text-xs text-slate-400 font-mono">{emp?.employee_number} • {emp?.designation?.title || 'موظف'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{Number(ps.gross_earnings).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600">-{Number(ps.employee_social_insurance).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">+{Number(ps.employer_social_insurance).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-600">
                        {Number(ps.income_tax) > 0 ? `-${Number(ps.income_tax).toLocaleString()}` : '0.00'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-500">
                        {(Number(ps.other_deductions) + Number(ps.unpaid_leave_deductions)) > 0 ? (
                          `-${(Number(ps.other_deductions) + Number(ps.unpaid_leave_deductions)).toLocaleString()}`
                        ) : '0.00'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-base">
                        {Number(ps.net_pay).toLocaleString()} {currency}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => api.documents.downloadPayslip(ps.id)}
                            title="تحميل مسير الراتب PDF"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {run.status !== 'FINANCE_APPROVED' && (
                            <button
                              onClick={() => handleOpenAdjust(ps)}
                              title="تعديل الاستقطاعات والخصومات"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payslip Adjustment Modal */}
        {selectedPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>تعديل استقطاعات الموظف: {selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}</span>
                </h3>
                <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">خصومات الغياب غير المدفوع ({currency})</label>
                  <input
                    type="number"
                    value={adjustData.unpaid_leave_deductions}
                    onChange={e => setAdjustData({ ...adjustData, unpaid_leave_deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">استقطاعات أو جزاءات إدارية أخرى ({currency})</label>
                  <input
                    type="number"
                    value={adjustData.other_deductions}
                    onChange={e => setAdjustData({ ...adjustData, other_deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">سبب التعديل (إلزامي للتدقيق الرقابي) *</label>
                  <textarea
                    rows={3}
                    value={adjustData.adjustment_reason}
                    onChange={e => setAdjustData({ ...adjustData, adjustment_reason: e.target.value })}
                    placeholder="مثال: خصم يومين غياب بدون إذن مسبق حسب تقرير البصمة البيومترية..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={adjusting}
                  onClick={handleSaveAdjust}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {adjusting ? 'جاري الحفظ...' : 'حفظ التعديل وإعادة الاحتساب'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

