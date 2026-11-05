'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Settings,
  Building2,
  Shield,
  Cpu,
  Key,
  CheckCircle2,
  Globe2,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'company' | 'rbac' | 'devices'>('company');

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'ar' ? 'إعدادات المنظومة وصلاحيات النظام' : 'System Settings & Security'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'تكوين المنشأة، الربط بأنظمة حماية الأجور (WPS & GOSI)، وإدارة صلاحيات المستخدمين'
              : 'Configure company profile, WPS/GOSI integrations & RBAC roles'}
          </p>
        </div>

        <button
          onClick={() => alert('تم حفظ الإعدادات بنجاح')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {locale === 'ar' ? 'بيانات المنشأة والامتثال' : 'Company & Compliance'}
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'rbac'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {locale === 'ar' ? 'الأدوار والمصفوفة الأمنية (RBAC)' : 'Roles & Permissions (RBAC)'}
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'devices'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {locale === 'ar' ? 'أجهزة البصمة والربط (ADMS)' : 'Biometric Hardware Clocks'}
        </button>
      </div>

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-4 text-xs">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            بيانات المنشأة القانونية (فروع السعودية ومصر)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المنشأة القانوني (KSA)</label>
              <input type="text" defaultValue="شركة الرياض للحلول الرقمية ذ.م.م" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم السجل التجاري (CR)</label>
              <input type="text" defaultValue="1010892341" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي (VAT / Tax ID)</label>
              <input type="text" defaultValue="300123456700003" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رمز المنشأة في نظام حماية الأجور (WPS)</label>
              <input type="text" defaultValue="7001234567" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">بنك صرف الرواتب الرئيسي</label>
              <input type="text" defaultValue="مصرف الراجحي (RJHI)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الآيبان البنكي للمنشأة (Primary IBAN)</label>
              <input type="text" defaultValue="SA0380000000608010167519" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">مصفوفة الصلاحيات (Role-Based Access Control)</h2>
            <p className="text-xs text-slate-400 mt-0.5">تحديد مستويات الوصول للأدوار المختلفة في المنظومة</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-start">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">المورد / الموديول</th>
                  <th className="p-3.5 text-center font-semibold">مدير النظام (Admin)</th>
                  <th className="p-3.5 text-center font-semibold">مدير الموارد (HR)</th>
                  <th className="p-3.5 text-center font-semibold">أخصائي الرواتب</th>
                  <th className="p-3.5 text-center font-semibold">مدير القسم</th>
                  <th className="p-3.5 text-center font-semibold">الموظف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">سجل الموظفين والملفات</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-slate-400">قراءة فقط</td>
                  <td className="p-3.5 text-slate-600 font-medium">فريقه فقط</td>
                  <td className="p-3.5 text-slate-600 font-medium">ملفه فقط</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">مسير الرواتب والتحويل البنكي</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-blue-600 font-bold">اعتماد</td>
                  <td className="p-3.5 text-emerald-600 font-bold">معالجة وحساب</td>
                  <td className="p-3.5 text-slate-300">--</td>
                  <td className="p-3.5 text-slate-400">قسيمته فقط</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">اعتماد طلبات الإجازات</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-emerald-600 font-bold">اعتماد نهائي</td>
                  <td className="p-3.5 text-slate-300">--</td>
                  <td className="p-3.5 text-blue-600 font-bold">اعتماد أولي</td>
                  <td className="p-3.5 text-slate-600 font-medium">تقديم طلب</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Biometric Devices */}
      {activeTab === 'devices' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900">أجهزة البصمة الحيوية المتصلة (ADMS Bridge)</h2>
              <p className="text-slate-400 text-xs">تستقبل الحركات عبر المنفذ 8081 وتدفعها إلى Redis في الوقت الفعلي</p>
            </div>
            <button
              onClick={() => alert('نافذة إضافة جهاز بصمة جديد')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              + إضافة جهاز جديد
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  ZK
                </div>
                <div>
                  <p className="font-bold text-slate-900">ZKTeco SilkBio-101TC</p>
                  <p className="text-slate-400 font-mono text-[11px]">SN: BKD81900214 • IP: 192.168.1.120 • 🇸🇦 فرع الرياض</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                🟢 متصل (Online)
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  HK
                </div>
                <div>
                  <p className="font-bold text-slate-900">Hikvision DS-K1T671MF (Face Recognition)</p>
                  <p className="text-slate-400 font-mono text-[11px]">SN: HIK992014 • IP: 192.168.10.45 • 🇪🇬 فرع القاهرة</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                🟢 متصل (Online)
              </span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

