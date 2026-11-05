'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Building2,
  MapPin,
  Wifi,
  ShieldCheck,
  Plus,
  Save,
  CheckCircle2,
  Globe2,
  Navigation,
  Radio
} from 'lucide-react';

interface BranchConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  country: 'SA' | 'EG';
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  attendanceMode: 'BOTH' | 'BIOMETRIC_ONLY' | 'MOBILE_ONLY';
  wifiBssid: string;
  deviceCount: number;
  activeEmployees: number;
}

export default function CompanyBranchesPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [branches, setBranches] = useState<BranchConfig[]>([
    {
      id: 'BR-RUH',
      nameAr: 'فرع الرياض الرئيسي (العليا)',
      nameEn: 'Riyadh HQ Branch (Olaya)',
      country: 'SA',
      city: 'الرياض',
      address: 'طريق الملك فهد، حي العليا، الرياض 12214',
      latitude: 24.7136,
      longitude: 46.6753,
      geofenceRadiusMeters: 150,
      attendanceMode: 'BOTH',
      wifiBssid: '3c:37:86:14:f2:a0, 3c:37:86:14:f2:a1',
      deviceCount: 3,
      activeEmployees: 96,
    },
    {
      id: 'BR-CAI',
      nameAr: 'فرع القاهرة الإقليمي (التجمع الخامس)',
      nameEn: 'Cairo Regional Branch (New Cairo)',
      country: 'EG',
      city: 'القاهرة الجديدة',
      address: 'شارع التسعين الشمالي، التجمع الخامس، القاهرة',
      latitude: 30.0263,
      longitude: 31.4967,
      geofenceRadiusMeters: 200,
      attendanceMode: 'BOTH',
      wifiBssid: '84:d8:1b:29:43:08',
      deviceCount: 2,
      activeEmployees: 52,
    },
  ]);

  const [selectedBranch, setSelectedBranch] = useState<BranchConfig>(branches[0]);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateBranch = () => {
    setBranches((prev) =>
      prev.map((b) => (b.id === selectedBranch.id ? selectedBranch : b))
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة المنشأة والفروع والنطاق الجغرافي (Geofencing)' : 'Company & Branch Geofencing Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'تكوين الكيانات القانونية في مصر والسعودية، إحداثيات GPS، ونصف قطر بصمة المحمول وشبكات Wi-Fi'
              : 'Configure legal entities in KSA & Egypt, GPS coordinates, mobile geofence radius & Wi-Fi whitelists'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateBranch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isAr ? 'حفظ إعدادات الفرع' : 'Save Branch Config'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? 'تم تحديث إعدادات النطاق الجغرافي للفرع بنجاح' : 'Geofence configurations updated successfully!'}</span>
        </div>
      )}

      {/* Legal Entity Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇸🇦</span>
              <h3 className="font-bold text-sm text-slate-900">شركة الرياض للحلول الرقمية (ذ.م.م)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              {isAr ? 'الكيان السعودي' : 'Saudi Entity'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <p>• {isAr ? 'السجل التجاري:' : 'CR:'} <span className="font-mono font-bold text-slate-800">1010892341</span></p>
            <p>• {isAr ? 'الرقم الموحد (700):' : '700 No:'} <span className="font-mono font-bold text-slate-800">7009812401</span></p>
            <p>• {isAr ? 'رقم اشتراك التأمينات:' : 'GOSI No:'} <span className="font-mono font-bold text-slate-800">987654321</span></p>
            <p>• {isAr ? 'رمز بنك حماية الأجور:' : 'WPS Bank:'} <span className="font-mono font-bold text-slate-800">RJHI (الراجحي)</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇪🇬</span>
              <h3 className="font-bold text-sm text-slate-900">شركة المستقبل لحلول التقنية (ش.م.م)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
              {isAr ? 'الكيان المصري' : 'Egypt Entity'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <p>• {isAr ? 'السجل التجاري:' : 'CR:'} <span className="font-mono font-bold text-slate-800">928174 / استثمار</span></p>
            <p>• {isAr ? 'البطاقة الضريبية:' : 'Tax Card:'} <span className="font-mono font-bold text-slate-800">641-892-014</span></p>
            <p>• {isAr ? 'مكتب التأمينات التابع:' : 'NOSI Office:'} <span className="font-mono font-bold text-slate-800">مدينة نصر أول</span></p>
            <p>• {isAr ? 'كود منظومة المرتبات:' : 'ETA Code:'} <span className="font-mono font-bold text-slate-800">ETA-EG-88219</span></p>
          </div>
        </div>
      </div>

      {/* Branch Selector and Interactive Geofence Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">{isAr ? 'الفروع المسجلة' : 'Registered Branches'}</h3>
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBranch(b)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedBranch.id === b.id
                  ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{isAr ? b.nameAr : b.nameEn}</span>
                <span className="text-base">{b.country === 'SA' ? '🇸🇦' : '🇪🇬'}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{b.address}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                <span>{b.activeEmployees} {isAr ? 'موظف نشط' : 'employees'}</span>
                <span className="font-bold text-blue-600">{b.geofenceRadiusMeters} {isAr ? 'متر نطاق' : 'm radius'}</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => alert('إضافة فرع جديد')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة فرع أو موقع عمل جديد' : 'Add New Branch / Site'}</span>
          </button>
        </div>

        {/* Branch Geofencing Settings Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isAr ? `تكوين النطاق الجغرافي: ${selectedBranch.nameAr}` : `Geofence Setup: ${selectedBranch.nameEn}`}
                </h3>
                <p className="text-[11px] text-slate-400">{selectedBranch.id} • {selectedBranch.city}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{isAr ? 'نظام التحقق الجغرافي نشط' : 'Active Geofence Radar'}</span>
            </span>
          </div>

          {/* Coordinates Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isAr ? 'خط العرض (Latitude)' : 'Latitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={selectedBranch.latitude}
                onChange={(e) => setSelectedBranch({ ...selectedBranch, latitude: parseFloat(e.target.value) })}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isAr ? 'خط الطول (Longitude)' : 'Longitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={selectedBranch.longitude}
                onChange={(e) => setSelectedBranch({ ...selectedBranch, longitude: parseFloat(e.target.value) })}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isAr ? 'نصف قطر السماح (متر)' : 'Allowed Radius (Meters)'}
              </label>
              <input
                type="number"
                value={selectedBranch.geofenceRadiusMeters}
                onChange={(e) => setSelectedBranch({ ...selectedBranch, geofenceRadiusMeters: parseInt(e.target.value) })}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
              />
            </div>
          </div>

          {/* Allowed Attendance Mode */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {isAr ? 'وسيلة تسجيل الحضور المعتمدة في هذا الفرع' : 'Allowed Attendance Method'}
            </label>
            <select
              value={selectedBranch.attendanceMode}
              onChange={(e) => setSelectedBranch({ ...selectedBranch, attendanceMode: e.target.value as any })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
            >
              <option value="BOTH">{isAr ? 'كلا الخيارين: جهاز البصمة الحيوية أو تطبيق المحمول عبر GPS' : 'Both: Biometric hardware clock OR Mobile GPS'}</option>
              <option value="BIOMETRIC_ONLY">{isAr ? 'أجهزة البصمة الحيوية فقط (إلزامية في الموقع)' : 'Hardware Biometric Clocks Only'}</option>
              <option value="MOBILE_ONLY">{isAr ? 'تطبيق الجوال عبر GPS Geofence فقط (للفرق الميدانية)' : 'Mobile App via GPS Geofence Only'}</option>
            </select>
          </div>

          {/* Wi-Fi BSSID Whitelist */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-blue-600" />
                <span>{isAr ? 'عناوين Wi-Fi BSSID المعتمدة لمنع التلاعب (Anti-Spoofing)' : 'Whitelisted Wi-Fi BSSIDs'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">{isAr ? 'مفصولة بفاصلة' : 'Comma separated'}</span>
            </label>
            <input
              type="text"
              value={selectedBranch.wifiBssid}
              onChange={(e) => setSelectedBranch({ ...selectedBranch, wifiBssid: e.target.value })}
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
              placeholder="e.g. 3c:37:86:14:f2:a0, 3c:37:86:14:f2:a1"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {isAr
                ? 'عند استخدام تطبيق المحمول، يتحقق النظام من تطابق عنوان Wi-Fi أو النطاق الجغرافي لمنع برامج Fake GPS'
                : 'Mobile punches check Wi-Fi BSSID alongside GPS coordinates to eliminate Fake GPS spoofing.'}
            </p>
          </div>

          {/* Interactive Radar Visualizer */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-dashed flex items-center justify-center animate-spin">
                <Navigation className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold">{isAr ? 'معاينة النطاق الجغرافي للفرع' : 'Live Branch Geofence Centroid'}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedBranch.latitude.toFixed(4)}° N, {selectedBranch.longitude.toFixed(4)}° E (±{selectedBranch.geofenceRadiusMeters}m)
                </p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold">
              {isAr ? 'مطابق لقوانين وزارة الموارد البشرية' : 'Compliant with HR Regulations'}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

