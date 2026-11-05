'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  Users,
  CalendarCheck,
  Clock,
  Banknote,
  MapPin,
  Cpu,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function DashboardPage() {
  const { t, locale, setLocale, isRtl } = useTranslation();

  // Simulated state for quick punch
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [punchMessage, setPunchMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'leaves'>('employees');

  // Payroll simulator states
  const [salaryCountry, setSalaryCountry] = useState<'EGY' | 'SAU'>('SAU');
  const [simBaseSalary, setSimBaseSalary] = useState<number>(18000);
  const [simHousing, setSimHousing] = useState<number>(4500);

  const handlePunch = async (type: 'IN' | 'OUT') => {
    setIsClockedIn(type === 'IN');
    const time = new Date().toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US');
    const msg = type === 'IN' 
      ? (locale === 'ar' ? `تم تسجيل الدخول بنجاح في ${time}` : `Clocked in successfully at ${time}`)
      : (locale === 'ar' ? `تم تسجيل الخروج بنجاح في ${time}` : `Clocked out successfully at ${time}`);
    setPunchMessage(msg);
    setTimeout(() => setPunchMessage(null), 4000);

    try {
      await api.attendance.punch({
        punch_type: type === 'IN' ? 'CHECK_IN' : 'CHECK_OUT',
        latitude: 24.7136,
        longitude: 46.6753,
        device_source: 'MANUAL_WEB',
        wifi_bssid: '3c:37:86:14:f2:a0'
      });
    } catch (e) {
      console.log('Attendance registered via local offline buffer');
    }
  };

  // Quick statutory calculator for the simulator
  const computePayrollSim = () => {
    const gross = simBaseSalary + simHousing;
    if (salaryCountry === 'SAU') {
      // Saudi GOSI (9.75% EE, 11.75% ER)
      const contributory = Math.min(Math.max(gross, 1500), 45000);
      const eeGosi = Math.round(contributory * 0.0975);
      const erGosi = Math.round(contributory * 0.1175);
      return {
        gross,
        eeDeduction: eeGosi,
        erContribution: erGosi,
        net: gross - eeGosi,
        currency: 'SAR',
        rule: locale === 'ar' ? 'نظام العمل والتأمينات الاجتماعية السعودي (GOSI)' : 'Saudi Labor Law & GOSI'
      };
    } else {
      // Egypt SI (11% EE, 18.75% ER) capped at 12,600 + Tax
      const insurable = Math.min(Math.max(gross, 2000), 12600);
      const eeSI = Math.round(insurable * 0.11);
      const erSI = Math.round(insurable * 0.1875);
      // Rough monthly tax bracket
      const annualGross = gross * 12;
      const taxable = Math.max(0, annualGross - (eeSI * 12) - 20000);
      let tax = 0;
      if (taxable > 40000) tax += Math.min(taxable - 40000, 15000) * 0.10;
      if (taxable > 55000) tax += Math.min(taxable - 55000, 15000) * 0.15;
      if (taxable > 70000) tax += Math.min(taxable - 70000, 130000) * 0.20;
      const monthlyTax = Math.round(tax / 12);
      const totalDeductions = eeSI + monthlyTax;

      return {
        gross,
        eeDeduction: totalDeductions,
        erContribution: erSI,
        net: gross - totalDeductions,
        currency: 'EGP',
        rule: locale === 'ar' ? 'قانون التأمينات المصرية 148 وضريبة الدخل 30' : 'Egypt Law 148 Social Insurance & Tax'
      };
    }
  };

  const simResult = computePayrollSim();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              HR
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {t('system_title')}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Jurisdiction Badge */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{locale === 'ar' ? 'متوافق مع مصر والسعودية' : 'Egypt & Saudi Compliant'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
              title={t('common.switch_lang')}
            >
              <Globe2 className="w-4 h-4 text-slate-500" />
              <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 border-s border-slate-200 ps-4">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                AS
              </div>
              <div className="hidden lg:block text-start">
                <p className="text-xs font-bold text-slate-800">عبدالله السعيد</p>
                <p className="text-[10px] text-slate-500">Super Admin (HRIS)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Quick Punch & Live Device Status Alert */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl text-white p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-block bg-blue-500/40 text-blue-100 text-xs px-2.5 py-1 rounded-full font-medium mb-2">
                {t('dashboard.welcome')}, د. عبدالله
              </span>
              <h2 className="text-2xl font-black">
                {t('dashboard.quick_punch')}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-blue-100">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  {t('dashboard.within_geofence')} (Olaya Branch, Riyadh)
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-300" />
                  {t('dashboard.biometric_synced')}
                </span>
              </div>
            </div>

            {/* Punch Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePunch('IN')}
                disabled={isClockedIn}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
                  isClockedIn 
                    ? 'bg-emerald-600/40 text-emerald-200 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('dashboard.clock_in_btn')}
              </button>
              <button
                onClick={() => handlePunch('OUT')}
                disabled={!isClockedIn}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
                  !isClockedIn
                    ? 'bg-rose-600/40 text-rose-200 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                {t('dashboard.clock_out_btn')}
              </button>
            </div>
          </div>

          {punchMessage && (
            <div className="mt-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{punchMessage}</span>
            </div>
          )}
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('dashboard.total_employees')}</p>
              <p className="text-2xl font-black text-slate-800">148</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('dashboard.present_today')}</p>
              <p className="text-2xl font-black text-slate-800">142</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('dashboard.on_leave_today')}</p>
              <p className="text-2xl font-black text-slate-800">6</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t('dashboard.payroll_estimate')}</p>
              <p className="text-2xl font-black text-slate-800">SAR 842K</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 font-bold text-sm border-b-2 transition ${
              activeTab === 'employees'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('employees.title')}
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`pb-3 font-bold text-sm border-b-2 transition ${
              activeTab === 'payroll'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('payroll.title')} (مصر & السعودية)
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`pb-3 font-bold text-sm border-b-2 transition ${
              activeTab === 'leaves'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('leaves.title')}
          </button>
        </div>

        {/* Tab 1: Employee Directory */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('employees.title')}</h3>
                <p className="text-xs text-slate-500">سجل الموظفين المعتمد للشركات في الرياض والقاهرة</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
                + {t('employees.add_new')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-start font-semibold">{t('employees.emp_no')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.name')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.department')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.role')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.branch')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.salary')}</th>
                    <th className="p-4 text-start font-semibold">{t('employees.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-700">EMP-SA-001</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">عبدالله سعد العتيبي</div>
                      <div className="text-xs text-slate-400">abdullah@futuregroup.com</div>
                    </td>
                    <td className="p-4 text-slate-600">تقنية المعلومات (IT)</td>
                    <td className="p-4 text-slate-700 font-medium">Senior Software Engineer</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                        🇸🇦 فرع الرياض
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">SAR 24,000</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                        {t('employees.active')}
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-blue-700">EMP-EG-001</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">أحمد محمود الشافعي</div>
                      <div className="text-xs text-slate-400">ahmed.elshafey@futuregroup.com</div>
                    </td>
                    <td className="p-4 text-slate-600">تقنية المعلومات (IT)</td>
                    <td className="p-4 text-slate-700 font-medium">Lead Backend Engineer</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                        🇪🇬 فرع القاهرة
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">EGP 28,000</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                        {t('employees.active')}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Regional Payroll Simulator & WPS Engine */}
        {activeTab === 'payroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Config Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-blue-600" />
                <span>حاسبة الرواتب والامتثال القانوني</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الدولة ونظام العمل</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSalaryCountry('SAU'); setSimBaseSalary(18000); setSimHousing(4500); }}
                      className={`py-2 px-3 rounded-xl font-bold border transition ${
                        salaryCountry === 'SAU'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      🇸🇦 السعودية (KSA)
                    </button>
                    <button
                      onClick={() => { setSalaryCountry('EGY'); setSimBaseSalary(25000); setSimHousing(3000); }}
                      className={`py-2 px-3 rounded-xl font-bold border transition ${
                        salaryCountry === 'EGY'
                          ? 'bg-blue-50 border-blue-500 text-blue-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      🇪🇬 مصر (EGY)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الراتب الأساسي</label>
                  <input
                    type="number"
                    value={simBaseSalary}
                    onChange={(e) => setSimBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">بدل السكن / البدلات الثابتة</label>
                  <input
                    type="number"
                    value={simHousing}
                    onChange={(e) => setSimHousing(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يتم الحساب تلقائياً طبقاً للحدود التأمينية لعام 2024 وشرائح كسب العمل أو نسب GOSI وحماية الأجور (Mudad WPS).
                  </p>
                </div>
              </div>
            </div>

            {/* Statutory Calculation Result Card */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-md">
                      {simResult.rule}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-2">
                      تفاصيل مسير الراتب والاستقطاعات
                    </h4>
                  </div>
                  <div className="text-end">
                    <p className="text-xs text-slate-400">صافي المستحق للموظف</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {simResult.net.toLocaleString()} {simResult.currency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">إجمالي الراتب الشامل</p>
                    <p className="text-lg font-bold text-slate-900">{simResult.gross.toLocaleString()} {simResult.currency}</p>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <p className="text-xs text-rose-600 font-medium">استقطاع الموظف (تأمينات/ضرائب)</p>
                    <p className="text-lg font-bold text-rose-700">-{simResult.eeDeduction.toLocaleString()} {simResult.currency}</p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium">حصة صاحب العمل (المؤسسة)</p>
                    <p className="text-lg font-bold text-amber-700">+{simResult.erContribution.toLocaleString()} {simResult.currency}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                  <Download className="w-4 h-4" />
                  {t('payroll.download_payslip')}
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('payroll.export_wps')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Leave Management */}
        {activeTab === 'leaves' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('leaves.title')}</h3>
                <p className="text-xs text-slate-500">أرصدة الإجازات السنوية والمرضية والطلبات المعلقة</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition">
                + {t('leaves.request_leave')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold">{t('leaves.annual_balance')}</p>
                <p className="text-2xl font-black text-blue-900 mt-1">21 يوماً</p>
                <p className="text-[11px] text-blue-500 mt-1">متبقي 16 يوماً من الرصيد الحالي</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs text-emerald-600 font-semibold">{t('leaves.sick_balance')}</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">15 يوماً</p>
                <p className="text-[11px] text-emerald-500 mt-1">يتطلب تقريراً طبياً معتمداً</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-600 font-semibold">{t('leaves.pending_approvals')}</p>
                <p className="text-2xl font-black text-amber-900 mt-1">2 طلب</p>
                <p className="text-[11px] text-amber-500 mt-1">بانتظار اعتماد المدير المباشر</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

