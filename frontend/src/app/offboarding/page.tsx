'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import {
  UserMinus,
  CheckCircle2,
  Clock,
  Laptop,
  Building,
  CreditCard,
  FileCheck,
  Calculator,
  Download
} from 'lucide-react';

export default function OffboardingPage() {
  const { t, locale } = useTranslation();

  const [tenureYears, setTenureYears] = useState<number>(4.5);
  const [lastSalary, setLastSalary] = useState<number>(18000);
  const [separationType, setSeparationType] = useState<'RESIGNATION' | 'TERMINATION'>('RESIGNATION');
  const [calculatedResult, setCalculatedResult] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [clearanceInfo, setClearanceInfo] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [itClear, setItClear] = useState(true);
  const [adminClear, setAdminClear] = useState(true);
  const [financeClear, setFinanceClear] = useState(false);

  useEffect(() => {
    api.employees.list().then((res: any) => {
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setEmployees(list);
      if (list.length > 0) {
        setSelectedEmployeeId(list[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      api.offboarding.clearanceStatus(selectedEmployeeId).then((res: any) => {
        if (res?.data) {
          setClearanceInfo(res.data);
          setItClear(Boolean(res.data.it_assets_cleared));
        }
      }).catch(() => {});
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    api.offboarding.calculateEsb({
      last_full_salary: lastSalary,
      service_years: tenureYears,
      separation_reason: separationType,
      is_female: false,
    }).then((res: any) => {
      if (res?.data) {
        setCalculatedResult(res.data);
      }
    }).catch(() => {});
  }, [tenureYears, lastSalary, separationType]);

  const computeGratuity = () => {
    if (calculatedResult) {
      return {
        baseAward: calculatedResult.base_entitlement,
        factor: calculatedResult.resignation_factor,
        finalAmount: calculatedResult.final_award_amount,
      };
    }
    let baseAward = 0;
    if (tenureYears <= 5) {
      baseAward = (lastSalary / 2) * tenureYears;
    } else {
      baseAward = (lastSalary / 2) * 5 + lastSalary * (tenureYears - 5);
    }

    let factor = 1.0;
    if (separationType === 'RESIGNATION') {
      if (tenureYears < 2) factor = 0;
      else if (tenureYears <= 5) factor = 1 / 3;
      else if (tenureYears <= 10) factor = 2 / 3;
      else factor = 1.0;
    }

    return {
      baseAward: Math.round(baseAward),
      factor,
      finalAmount: Math.round(baseAward * factor),
    };
  };

  const esb = computeGratuity();

  const handleInitiateSettlement = async () => {
    if (!selectedEmployeeId) return;
    setSubmitting(true);
    try {
      await api.offboarding.initiate({
        employee_id: selectedEmployeeId,
        separation_date: new Date().toISOString().slice(0, 10),
        separation_reason: separationType,
        notes: `صافي مكافأة نهاية الخدمة المعتمدة: ${esb.finalAmount} ريال`,
      });
      setFeedbackMsg(`تم اعتماد التصفية النهائية (FNF) بمبلغ ${esb.finalAmount.toLocaleString()} ريال وتسجيلها في النظام`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(err.message || 'تم تسجيل طلب التصفية النهائية');
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
            {locale === 'ar' ? 'إنهاء الخدمة وتصفية المستحقات (Offboarding)' : 'Offboarding & Final Clearance'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'إخلاء الطرف الإداري والتقني، حساب مكافأة نهاية الخدمة (المادة 84 و 85)، وإصدار شهادة الخبرة'
              : 'Multi-department clearance, Article 84/85 End of Service Award & experience letters'}
          </p>
        </div>

        <button
          onClick={() => api.documents.downloadCertificate('SAMPLE_CERTIFICATE_EMP_SA001')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'إصدار شهادة الخبرة وإخلاء الطرف (PDF)' : 'Download Experience Certificate'}</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Grid: Clearance & Gratuity Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Departmental Clearance Checklist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {locale === 'ar' ? 'مراحل إخلاء الطرف الإداري' : 'Departmental Clearance'}
              </h2>
              <div className="mt-1.5">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              itClear && adminClear && financeClear
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {itClear && adminClear && financeClear ? 'مكتمل (3/3)' : 'قيد استكمال الإخلاء'}
            </span>
          </div>

          <div className="space-y-4">
            {/* IT */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
              itClear ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  itClear ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">تقنية المعلومات (IT Department)</p>
                  <p className="text-[11px] text-slate-500">
                    {clearanceInfo
                      ? `العهد المسجلة النشطة: ${clearanceInfo.active_assets_count} أجهزة`
                      : 'استلام اللابتوب وإلغاء صلاحيات SSO والبريد'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={itClear}
                onChange={(e) => setItClear(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Admin */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
              adminClear ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  adminClear ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">الشؤون الإدارية (Facilities & Admin)</p>
                  <p className="text-[11px] text-slate-500">استلام بطاقة الدخول الذكية وبطاقة موقف السيارات</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={adminClear}
                onChange={(e) => setAdminClear(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Finance */}
            <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
              financeClear ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  financeClear ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">الإدارة المالية (Finance Department)</p>
                  <p className="text-[11px] text-slate-500">تسوية العهد النقدية ومطابقة بطاقة الشركة الائتمانية</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={financeClear}
                onChange={(e) => setFinanceClear(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Card: End of Service Gratuity Calculator (Article 84/85) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>حاسبة مكافأة نهاية الخدمة (نظام العمل السعودي)</span>
              </h2>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                مادة 84 & 85
              </span>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">سنوات الخدمة المتصلة</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">الراتب الأخير (شامل البدلات)</label>
                  <input
                    type="number"
                    value={lastSalary}
                    onChange={(e) => setLastSalary(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">سبب انتهاء العلاقة العمالية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSeparationType('RESIGNATION')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      separationType === 'RESIGNATION'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    استقالة الموظف (المادة 85)
                  </button>
                  <button
                    onClick={() => setSeparationType('TERMINATION')}
                    className={`py-2 px-3 rounded-xl font-bold border transition ${
                      separationType === 'TERMINATION'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    إنهاء من المنشأة (المادة 84)
                  </button>
                </div>
              </div>
            </div>

            {/* Computation Result */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>الاستحقاق الأساسي (نصف شهر/سنة):</span>
                <span className="font-semibold">{esb.baseAward.toLocaleString()} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>معامل الاستقالة (بين سنتين إلى 5 سنوات):</span>
                <span className="font-semibold">{separationType === 'RESIGNATION' ? 'ثلث المكافأة (33.3%)' : 'استحقاق كامل (100%)'}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 text-emerald-700">
                <span>صافي مكافأة نهاية الخدمة المستحقة:</span>
                <span>{esb.finalAmount.toLocaleString()} SAR</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleInitiateSettlement}
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition shadow-sm"
          >
            {submitting ? 'جاري الاعتماد...' : 'اعتماد المبلغ في التصفية النهائية (FNF Settlement)'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
