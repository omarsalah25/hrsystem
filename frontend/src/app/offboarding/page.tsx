'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
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

  // End of Service Gratuity Interactive Simulator
  const [tenureYears, setTenureYears] = useState<number>(4.5);
  const [lastSalary, setLastSalary] = useState<number>(18000);
  const [separationType, setSeparationType] = useState<'RESIGNATION' | 'TERMINATION'>('RESIGNATION');

  // Multi-department clearance checklist states
  const [itClear, setItClear] = useState(true);
  const [adminClear, setAdminClear] = useState(true);
  const [financeClear, setFinanceClear] = useState(false);

  // Compute Saudi Labor Law ESB (Articles 84 & 85)
  const computeGratuity = () => {
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
          onClick={() => alert('تم إصدار شهادة إخلاء الطرف الرقمية')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'إصدار شهادة الخبرة وإخلاء الطرف' : 'Issue Experience Certificate'}</span>
        </button>
      </div>

      {/* Grid: Clearance & Gratuity Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Departmental Clearance Checklist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {locale === 'ar' ? 'مراحل إخلاء الطرف الإداري' : 'Departmental Clearance'}
              </h2>
              <p className="text-xs text-slate-400">م. خالد عبدالرحمن القرني (EMP-SA-044)</p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
              بانتظار المالية (2/3 مكتمل)
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
                  <p className="text-[11px] text-slate-500">استلام اللابتوب وإلغاء صلاحيات SSO والبريد</p>
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
            onClick={() => alert(`تم ترحيل مبلغ ${esb.finalAmount} ريال إلى مسير التسوية النهائية FNF`)}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
          >
            اعتماد المبلغ في التصفية النهائية (FNF Settlement)
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

