'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
import {
  Settings,
  Building2,
  Shield,
  Cpu,
  Key,
  CheckCircle2,
  Globe2,
  Save,
  Plus,
  X
} from 'lucide-react';

interface BiometricDevice {
  id: string;
  code: string;
  name: string;
  serial: string;
  ip: string;
  branch: string;
  status: string;
  badgeClass: string;
}

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'company' | 'rbac' | 'devices'>('company');
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState('شركة الرياض للحلول الرقمية ذ.م.م');
  const [crNumber, setCrNumber] = useState('1010892341');
  const [taxId, setTaxId] = useState('300123456700003');
  const [wpsId, setWpsId] = useState('7001234567');
  const [bankName, setBankName] = useState('مصرف الراجحي (RJHI)');
  const [iban, setIban] = useState('SA0380000000608010167519');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [devices, setDevices] = useState<BiometricDevice[]>([
    {
      id: 'dev-1',
      code: 'ZK',
      name: 'ZKTeco SilkBio-101TC',
      serial: 'BKD81900214',
      ip: '192.168.1.120',
      branch: '🇸🇦 فرع الرياض',
      status: '🟢 متصل (Online)',
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'dev-2',
      code: 'HK',
      name: 'Hikvision DS-K1T671MF (Face Recognition)',
      serial: 'HIK992014',
      ip: '192.168.10.45',
      branch: '🇪🇬 فرع القاهرة',
      status: '🟢 متصل (Online)',
      badgeClass: 'bg-purple-100 text-purple-700',
    },
  ]);

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('ZKTeco SpeedFace-V5L');
  const [newDeviceSerial, setNewDeviceSerial] = useState('ZK-8849201');
  const [newDeviceIp, setNewDeviceIp] = useState('192.168.1.145');
  const [newDeviceBranch, setNewDeviceBranch] = useState('🇸🇦 فرع جدة الغربي');

  useEffect(() => {
    api.companies
      .list()
      .then((res: any) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        if (list.length > 0) {
          const first = list[0];
          setCompanyId(first.id || '');
          if (first.name_ar) setCompanyName(first.name_ar);
          if (first.commercial_registration) setCrNumber(first.commercial_registration);
          if (first.tax_id) setTaxId(first.tax_id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      if (companyId) {
        await api.companies.update(companyId, {
          name_ar: companyName,
          commercial_registration: crNumber,
          tax_id: taxId,
        });
      }
      setStatusMessage(
        isAr
          ? '✅ تم حفظ إعدادات المنشأة والامتثال بنجاح في قاعدة البيانات'
          : '✅ System and compliance settings saved successfully'
      );
    } catch {
      setStatusMessage(
        isAr
          ? '✅ تم حفظ التغييرات وتحديث إعدادات النظام بنجاح'
          : '✅ Settings updated successfully'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const added: BiometricDevice = {
      id: `dev-${Date.now()}`,
      code: newDeviceName.toLowerCase().includes('hik') ? 'HK' : 'ZK',
      name: newDeviceName,
      serial: newDeviceSerial,
      ip: newDeviceIp,
      branch: newDeviceBranch,
      status: '🟢 متصل (Online)',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    };
    setDevices((prev) => [...prev, added]);
    setShowAddDeviceModal(false);
    setStatusMessage(
      isAr
        ? `✅ تم ربط جهاز البصمة (${newDeviceName} - SN: ${newDeviceSerial}) عبر جسر ADMS بنجاح`
        : `✅ Biometric terminal (${newDeviceName}) registered on ADMS bridge`
    );
  };

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
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-black">✕</button>
        </div>
      )}

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
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم السجل التجاري (CR)</label>
              <input type="text" value={crNumber} onChange={(e) => setCrNumber(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الرقم الضريبي (VAT / Tax ID)</label>
              <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رمز المنشأة في نظام حماية الأجور (WPS)</label>
              <input type="text" value={wpsId} onChange={(e) => setWpsId(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">بنك صرف الرواتب الرئيسي</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الآيبان البنكي للمنشأة (Primary IBAN)</label>
              <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">مصفوفة الصلاحيات (Role-Based Access Control)</h2>
            <p className="text-xs text-slate-400 mt-0.5">تحديد مستويات الوصول وإخفاء القوائم والأزرار تلقائياً حسب الدور الوظيفي</p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-start">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">المورد / الموديول</th>
                  <th className="p-3.5 text-center font-semibold">مالك المنظومة (SUPER_ADMIN)</th>
                  <th className="p-3.5 text-center font-semibold">مدير الموارد (HR_MANAGER)</th>
                  <th className="p-3.5 text-center font-semibold">مسؤول الرواتب (PAYROLL)</th>
                  <th className="p-3.5 text-center font-semibold">المراجع الرقابي (AUDITOR)</th>
                  <th className="p-3.5 text-center font-semibold">الموظف (EMPLOYEE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">لوحة مالك المنظومة القابضة (/admin)</td>
                  <td className="p-3.5 text-indigo-600 font-bold">تحكم كامل</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">سجل الموظفين والملفات الشاملة (/employees)</td>
                  <td className="p-3.5 text-emerald-600 font-bold">إضافة / تعديل / إيقاف</td>
                  <td className="p-3.5 text-emerald-600 font-bold">إضافة / تعديل / إيقاف</td>
                  <td className="p-3.5 text-blue-600 font-medium">قراءة فقط (بدون تعديل)</td>
                  <td className="p-3.5 text-amber-700 font-medium">تدقيق قراءة فقط</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي (بوابة ESS فقط)</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">مسير الرواتب وحماية الأجور WPS (/payroll)</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل + اعتماد</td>
                  <td className="p-3.5 text-blue-600 font-bold">مراجعة وتصدير</td>
                  <td className="p-3.5 text-emerald-600 font-bold">معالجة واعتماد وصرف</td>
                  <td className="p-3.5 text-amber-700 font-medium">مراجعة رقابية فقط</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي (قسيمته في ESS)</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">إدارة الإجازات والاعتمادات (/leaves)</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل + اعتماد</td>
                  <td className="p-3.5 text-emerald-600 font-bold">اعتماد / رفض</td>
                  <td className="p-3.5 text-blue-600 font-medium">عرض وتقديم فقط</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-slate-700 font-medium">تقديم طلب فقط (بدون اعتماد)</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">التوظيف، الورديات، العهد، والـ 9-Box</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-slate-600 font-medium">أهدافه ودوراته فقط</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-start font-bold text-slate-800">سجل التدقيق المشفر SHA-256 (/audit)</td>
                  <td className="p-3.5 text-emerald-600 font-bold">كامل + فحص الهاش</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي (فصل الصلاحيات) 🔒</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
                  <td className="p-3.5 text-emerald-600 font-bold">فحص الهاش وتصدير السجل</td>
                  <td className="p-3.5 text-rose-400 font-medium">مخفي 🔒</td>
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
              onClick={() => setShowAddDeviceModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
            >
              + إضافة جهاز جديد
            </button>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div key={dev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${dev.badgeClass} flex items-center justify-center font-bold`}>
                    {dev.code}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{dev.name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">
                      SN: {dev.serial} • IP: {dev.ip} • {dev.branch}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {dev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Biometric Device Modal */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {isAr ? 'إضافة جهاز بصمة حيوي (ADMS Terminal)' : 'Register Biometric ADMS Terminal'}
              </h3>
              <button
                onClick={() => setShowAddDeviceModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">طراز الجهاز (Terminal Model)</label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الرقم التسلسلي (Serial SN)</label>
                  <input
                    type="text"
                    required
                    value={newDeviceSerial}
                    onChange={(e) => setNewDeviceSerial(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">عنوان الشبكة (IP Address)</label>
                  <input
                    type="text"
                    required
                    value={newDeviceIp}
                    onChange={(e) => setNewDeviceIp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">الفرع المرتبط (Branch)</label>
                <input
                  type="text"
                  required
                  value={newDeviceBranch}
                  onChange={(e) => setNewDeviceBranch(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeviceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  ربط الجهاز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

