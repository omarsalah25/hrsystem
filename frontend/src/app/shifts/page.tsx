'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Calendar,
  Clock,
  Moon,
  Sun,
  Plus,
  Users,
  Settings,
  ShieldAlert,
  Save,
  CheckCircle2
} from 'lucide-react';

interface Shift {
  id: string;
  nameAr: string;
  nameEn: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  totalWorkingHours: number;
  color: string;
  isRamadan: boolean;
}

export default function ShiftsPage() {
  const { t, locale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  // Ramadan special statutory toggle
  const [ramadanMode, setRamadanMode] = useState<boolean>(false);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState<number>(15);
  const [overtimeRate, setOvertimeRate] = useState<number>(150); // 150% in Saudi

  // Shift list
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 'S1',
      nameAr: 'الوردية الصباحية العامة',
      nameEn: 'General Morning Shift',
      startTime: '08:00',
      endTime: '17:00',
      breakMinutes: 60,
      totalWorkingHours: 8,
      color: 'bg-blue-500',
      isRamadan: false,
    },
    {
      id: 'S2',
      nameAr: 'وردية شهر رمضان المبارك (مخفضة)',
      nameEn: 'Ramadan Reduced Shift (6h)',
      startTime: '09:00',
      endTime: '15:00',
      breakMinutes: 0,
      totalWorkingHours: 6,
      color: 'bg-emerald-500',
      isRamadan: true,
    },
    {
      id: 'S3',
      nameAr: 'وردية المساء والدعم الفني',
      nameEn: 'Evening & Tech Support Shift',
      startTime: '16:00',
      endTime: '00:00',
      breakMinutes: 45,
      totalWorkingHours: 7.25,
      color: 'bg-purple-500',
      isRamadan: false,
    },
    {
      id: 'S4',
      nameAr: 'الوردية الليلية (مكتب القاهرة)',
      nameEn: 'Night Shift (Cairo Office)',
      startTime: '00:00',
      endTime: '08:00',
      breakMinutes: 60,
      totalWorkingHours: 7,
      color: 'bg-amber-500',
      isRamadan: false,
    },
  ]);

  // Days of the week in GCC / Egypt order (Sunday to Thursday + Friday/Saturday weekend)
  const days = [
    { ar: 'الأحد', en: 'Sunday' },
    { ar: 'الإثنين', en: 'Monday' },
    { ar: 'الثلاثاء', en: 'Tuesday' },
    { ar: 'الأربعاء', en: 'Wednesday' },
    { ar: 'الخميس', en: 'Thursday' },
    { ar: 'الجمعة (عطلة)', en: 'Friday (Off)' },
    { ar: 'السبت (عطلة)', en: 'Saturday (Off)' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة الورديات وجداول الدوام (Shift Rostering)' : 'Shift Rostering & Work Schedules'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'تكوين الورديات الصباحية والمسائية، ساعات عمل رمضان النظامية (6 ساعات)، وفترات السماح'
              : 'Configure morning/evening shifts, Ramadan statutory 6h limits & grace periods'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('تم حفظ إعدادات الورديات وجدول الدوام')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ الجدول' : 'Save Roster'}</span>
          </button>
        </div>
      </div>

      {/* Ramadan Statutory Banner */}
      <div className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
        ramadanMode
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <Moon className={`w-6 h-6 ${ramadanMode ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div>
            <h3 className="text-xs font-bold">
              {isAr ? 'تفعيل نظام ساعات عمل شهر رمضان المبارك (6 ساعات يومياً)' : 'Activate Ramadan Statutory Hours (6h / Day)'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAr
                ? 'وفق المادة 98 من نظام العمل السعودي وقانون العمل المصري: تخفيض ساعات العمل للمسلمين إلى 6 ساعات يومياً أو 36 ساعة أسبوعياً'
                : 'Under Article 98 of Saudi Labor Law & Egypt Law: maximum 6h/day or 36h/week for Muslim employees'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={ramadanMode}
            onChange={(e) => setRamadanMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ms-3 text-xs font-bold">{ramadanMode ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'معطل' : 'Disabled')}</span>
        </label>
      </div>

      {/* Shift Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className={`bg-white p-4 rounded-xl border shadow-xs relative overflow-hidden ${
              ramadanMode && shift.isRamadan ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80'
            }`}
          >
            <div className={`absolute top-0 start-0 w-1.5 h-full ${shift.color}`} />
            <div className="flex items-center justify-between mb-2 ps-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {shift.id}
              </span>
              {shift.isRamadan && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  {isAr ? 'رمضان' : 'Ramadan'}
                </span>
              )}
            </div>

            <h4 className="text-xs font-bold text-slate-900 ps-1">{isAr ? shift.nameAr : shift.nameEn}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2 ps-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{shift.startTime} - {shift.endTime}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 ps-1">
              <span>{isAr ? 'ساعات العمل الفعلي:' : 'Working hours:'}</span>
              <span className="font-bold text-slate-900">{shift.totalWorkingHours} {isAr ? 'ساعات' : 'hrs'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Roster Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
          <span>{isAr ? 'الجدول الأسبوعي المعتمد للأقسام' : 'Weekly Department Roster Matrix'}</span>
          <span className="text-xs text-slate-400">{isAr ? 'الأسبوع الحالي (نوفمبر 2026)' : 'Current Week'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="p-3 text-start">{isAr ? 'القسم / الفريق' : 'Department'}</th>
                {days.map((day, idx) => (
                  <th key={idx} className="p-3 text-center">
                    {isAr ? day.ar : day.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold">{isAr ? 'الهندسة والبرمجيات (IT)' : 'Software Engineering'}</td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">08:00 - 17:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">08:00 - 17:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">08:00 - 17:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">08:00 - 17:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">08:00 - 17:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px]">عطلة</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px]">عطلة</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold">{isAr ? 'الدعم الفني ومراكز العمليات' : 'Customer Support & NOC'}</td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">16:00 - 00:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">16:00 - 00:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">16:00 - 00:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">16:00 - 00:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">16:00 - 00:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">وردية طوارئ</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px]">عطلة</span></td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold">{isAr ? 'المبيعات وتطوير الأعمال' : 'Sales & Growth'}</td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">09:00 - 18:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">09:00 - 18:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">09:00 - 18:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">09:00 - 18:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">09:00 - 18:00</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px]">عطلة</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 bg-slate-100 text-slate-400 rounded text-[10px]">عطلة</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Rules & Grace Period Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{isAr ? 'سياسة السماح والتأخير' : 'Grace Period & Lateness Rules'}</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {isAr ? 'فترة السماح الصباحية (دقائق)' : 'Morning Grace Period (Minutes)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                className="w-24 text-xs border border-slate-300 rounded-lg p-2"
              />
              <span className="text-xs text-slate-500">
                {isAr ? 'دقيقة (لا يتم احتساب تأخير إذا بصم الموظف خلالها)' : 'minutes (no penalty within this buffer)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <p className="font-bold">{isAr ? 'جدول جزاءات التأخير التراكمي:' : 'Cumulative Lateness Deductions:'}</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
              <li>{isAr ? 'التأخير الأول (15 - 30 دقيقة): إنذار كتابي' : '1st late (15-30m): Written notice'}</li>
              <li>{isAr ? 'التأخير الثاني: خصم 25% من أجر اليوم' : '2nd late: 25% day wage deduction'}</li>
              <li>{isAr ? 'التأخير الثالث فما فوق: خصم 50% من أجر اليوم' : '3rd late+: 50% day wage deduction'}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'معامل ساعات العمل الإضافي (Overtime Multipliers)' : 'Overtime Multiplier Rules'}</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {isAr ? 'نسبة الساعات الإضافية العادية (%)' : 'Standard Overtime Rate (%)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(Number(e.target.value))}
                className="w-24 text-xs border border-slate-300 rounded-lg p-2"
              />
              <span className="text-xs text-slate-500">
                {isAr ? 'وفق المادة 107 من نظام العمل السعودي (150% = أجر الساعة + 50%)' : 'Saudi Art 107 (150% = 1.5x hourly wage)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs space-y-1">
            <p className="font-bold text-slate-800">{isAr ? 'قواعد العمل الإضافي في مصر والسعودية:' : 'Statutory Overtime Rules:'}</p>
            <p>• 🇸🇦 {isAr ? 'السعودية: 150% لجميع الساعات التي تزيد عن 8 ساعات يومياً' : 'Saudi: 150% for all overtime hours'}</p>
            <p>• 🇪🇬 {isAr ? 'مصر: 135% لساعات النهار و 170% لساعات الليل و 200% للعطلات الرسمية' : 'Egypt: 135% day, 170% night, 200% public holidays'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

