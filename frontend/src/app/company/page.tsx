'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
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
  Radio,
  X,
  CreditCard,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface CompanyData {
  id: string;
  legal_name: string;
  trade_name?: string;
  commercial_registration_no?: string;
  tax_registration_no?: string;
  social_insurance_no?: string;
  wps_employer_id?: string;
  bank_code?: string;
  primary_iban?: string;
  country_code: string;
  currency: string;
  employees_count?: number;
}

interface BranchData {
  id: string;
  company_id: string;
  name: string;
  address_line: string;
  city: string;
  timezone?: string;
  geofence_latitude?: number;
  geofence_longitude?: number;
  geofence_radius_meters?: number;
  attendance_mode: string;
  employees_count?: number;
  company?: {
    id: string;
    legal_name: string;
    country_code: string;
  };
}

export default function CompanyBranchesPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);

  // New Company Form State
  const [newCompany, setNewCompany] = useState({
    legal_name: '',
    trade_name: '',
    commercial_registration_no: '',
    tax_registration_no: '',
    social_insurance_no: '',
    wps_employer_id: '',
    bank_code: '',
    primary_iban: '',
    country_code: 'SAU',
    currency: 'SAR',
  });

  // New Branch Form State
  const [newBranch, setNewBranch] = useState({
    company_id: '',
    name: '',
    address_line: '',
    city: '',
    timezone: 'Asia/Riyadh',
    geofence_latitude: 24.7136,
    geofence_longitude: 46.6753,
    geofence_radius_meters: 200,
    attendance_mode: 'BOTH',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, branchRes] = await Promise.all([
        api.companies.list().catch(() => ({ data: [] })),
        api.branches.list().catch(() => ({ data: [] })),
      ]);

      const comps = compRes.data || [];
      const brs = branchRes.data || [];

      setCompanies(comps);
      setBranches(brs);

      if (brs.length > 0) {
        setSelectedBranch(brs[0]);
      }
      if (comps.length > 0 && !newBranch.company_id) {
        setNewBranch((prev) => ({ ...prev, company_id: comps[0].id }));
      }
    } catch (err) {
      console.error('Failed to load companies & branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.companies.create(newCompany);
      setShowAddCompanyModal(false);
      setNewCompany({
        legal_name: '',
        trade_name: '',
        commercial_registration_no: '',
        tax_registration_no: '',
        social_insurance_no: '',
        wps_employer_id: '',
        bank_code: '',
        primary_iban: '',
        country_code: 'SAU',
        currency: 'SAR',
      });
      setStatusMessage(isAr ? 'تم تسجيل الكيان القانوني الجديد بنجاح!' : 'Legal entity created successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating company');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.branches.create(newBranch);
      setShowAddBranchModal(false);
      setStatusMessage(isAr ? 'تمت إضافة الفرع الجديد وتثبيت إحداثيات السياج بنجاح!' : 'Branch and geofence created successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating branch');
    }
  };

  const handleUpdateBranchGeofence = async () => {
    if (!selectedBranch) return;
    try {
      await api.branches.updateGeofence(selectedBranch.id, {
        geofence_latitude: selectedBranch.geofence_latitude || 24.7136,
        geofence_longitude: selectedBranch.geofence_longitude || 46.6753,
        geofence_radius_meters: selectedBranch.geofence_radius_meters || 200,
        attendance_mode: selectedBranch.attendance_mode || 'BOTH',
      });
      setStatusMessage(isAr ? 'تم حفظ إعدادات النطاق الجغرافي للفرع بنجاح!' : 'Branch geofence saved successfully!');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating geofence');
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة المنشأة والفروع والنطاق الجغرافي (Geofencing Hub)' : 'Company Entities & Branch Geofencing Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'لوحة إدارة المنشآت والكيانات القانونية، السجلات التجارية، إحداثيات الفروع وبصمة المحمول GPS'
              : 'Enterprise portal to add companies, legal registrations, branch GPS coordinates and mobile geofences'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddCompanyModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة كيان / شركة جديدة' : 'Add Legal Entity'}</span>
          </button>

          <button
            onClick={() => setShowAddBranchModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة فرع / موقع' : 'Add Branch'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Legal Entity Profiles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {companies.map((comp) => (
          <div key={comp.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{comp.country_code === 'SAU' ? '🇸🇦' : comp.country_code === 'EGY' ? '🇪🇬' : '🌐'}</span>
                  <h3 className="font-bold text-sm text-slate-900">{comp.legal_name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comp.country_code === 'SAU' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {comp.country_code} • {comp.currency}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>• {isAr ? 'السجل التجاري:' : 'CR No:'} <span className="font-mono font-bold text-slate-800">{comp.commercial_registration_no || '—'}</span></p>
                <p>• {isAr ? 'الرقم الضريبي:' : 'Tax No:'} <span className="font-mono font-bold text-slate-800">{comp.tax_registration_no || '—'}</span></p>
                <p>• {isAr ? 'رقم التأمينات (GOSI/SI):' : 'Social Ins No:'} <span className="font-mono font-bold text-slate-800">{comp.social_insurance_no || '—'}</span></p>
                <p>• {isAr ? 'رمز بنك حماية الأجور (WPS):' : 'WPS Bank Code:'} <span className="font-mono font-bold text-slate-800">{comp.bank_code || '—'}</span></p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{comp.employees_count || 0} {isAr ? 'موظف مسجل' : 'employees'}</span>
              <span className="text-blue-600 font-bold">{comp.trade_name || comp.legal_name}</span>
            </div>
          </div>
        ))}

        {companies.length === 0 && !loading && (
          <div className="col-span-full p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">{isAr ? 'لا توجد شركات مسجلة حتى الآن' : 'No companies registered yet'}</p>
            <button
              onClick={() => setShowAddCompanyModal(true)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
            >
              {isAr ? 'إضافة الشركة الأولى' : 'Add First Company'}
            </button>
          </div>
        )}
      </div>

      {/* Branches List & Geofence Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">{isAr ? 'الفروع ومواقع العمل' : 'Branches & Sites'}</h3>
            <span className="text-xs text-slate-500 font-mono">({branches.length})</span>
          </div>

          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBranch(b)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedBranch?.id === b.id
                  ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{b.name}</span>
                <span className="text-base">{b.company?.country_code === 'SAU' ? '🇸🇦' : '🇪🇬'}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{b.address_line}, {b.city}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                <span>{b.employees_count || 0} {isAr ? 'موظف نشط' : 'employees'}</span>
                <span className="font-bold text-blue-600">{b.geofence_radius_meters || 200} {isAr ? 'متر نطاق' : 'm radius'}</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowAddBranchModal(true)}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة فرع أو موقع عمل جديد' : 'Add New Branch / Site'}</span>
          </button>
        </div>

        {/* Branch Geofencing Settings Panel */}
        {selectedBranch ? (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAr ? `تكوين النطاق الجغرافي: ${selectedBranch.name}` : `Geofence Setup: ${selectedBranch.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedBranch.city} • {selectedBranch.address_line}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>{isAr ? 'نظام التحقق الجغرافي نشط' : 'Active Geofence Radar'}</span>
                </span>
                <button
                  onClick={handleUpdateBranchGeofence}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Coordinates Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isAr ? 'خط العرض (Latitude)' : 'Latitude'}
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={selectedBranch.geofence_latitude ?? 24.7136}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, geofence_latitude: parseFloat(e.target.value) })}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isAr ? 'خط الطول (Longitude)' : 'Longitude'}
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={selectedBranch.geofence_longitude ?? 46.6753}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, geofence_longitude: parseFloat(e.target.value) })}
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isAr ? 'نصف قطر السماح (متر)' : 'Allowed Radius (Meters)'}
                </label>
                <input
                  type="number"
                  value={selectedBranch.geofence_radius_meters ?? 200}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, geofence_radius_meters: parseInt(e.target.value) || 200 })}
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
                value={selectedBranch.attendance_mode}
                onChange={(e) => setSelectedBranch({ ...selectedBranch, attendance_mode: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
              >
                <option value="BOTH">{isAr ? 'كلا الخيارين: جهاز البصمة الحيوية أو تطبيق المحمول عبر GPS' : 'Both: Biometric hardware clock OR Mobile GPS'}</option>
                <option value="BIOMETRIC_ONLY">{isAr ? 'أجهزة البصمة الحيوية فقط (إلزامية في الموقع)' : 'Hardware Biometric Clocks Only'}</option>
                <option value="MOBILE_GEOFENCE_ONLY">{isAr ? 'تطبيق الجوال عبر GPS Geofence فقط (للفرق الميدانية)' : 'Mobile App via GPS Geofence Only'}</option>
              </select>
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
                    {(selectedBranch.geofence_latitude || 0).toFixed(4)}° N, {(selectedBranch.geofence_longitude || 0).toFixed(4)}° E (±{selectedBranch.geofence_radius_meters || 200}m)
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/company/branches/${selectedBranch.id}`)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                {isAr ? 'إدارة السياج والأجهزة الحيوية ←' : 'Manage Hardware & Radar →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <MapPin className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">{isAr ? 'اختر فرعاً لمعاينة وتعديل سياجه الجغرافي' : 'Select a branch to edit its geofence'}</p>
          </div>
        )}
      </div>

      {/* Modal: Add New Company */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isAr ? 'تسجيل كيان قانوني / شركة جديدة' : 'Register New Legal Entity'}
                </h3>
              </div>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الاسم القانوني الرسمي *' : 'Legal Name *'}</label>
                  <input
                    required
                    type="text"
                    value={newCompany.legal_name}
                    onChange={(e) => setNewCompany({ ...newCompany, legal_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder={isAr ? 'شركة الأفق للاستثمار ذ.م.م' : 'Horizon Investment LLC'}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الاسم التجاري' : 'Trade Name'}</label>
                  <input
                    type="text"
                    value={newCompany.trade_name}
                    onChange={(e) => setNewCompany({ ...newCompany, trade_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="Horizon Tech"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الدولة / الولاية القضائية *' : 'Jurisdiction *'}</label>
                  <select
                    value={newCompany.country_code}
                    onChange={(e) => {
                      const c = e.target.value;
                      setNewCompany({
                        ...newCompany,
                        country_code: c,
                        currency: c === 'SAU' ? 'SAR' : c === 'EGY' ? 'EGP' : 'AED',
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="SAU">🇸🇦 {isAr ? 'المملكة العربية السعودية (SAR / GOSI)' : 'Saudi Arabia (SAR)'}</option>
                    <option value="EGY">🇪🇬 {isAr ? 'جمهورية مصر العربية (EGP / Law 148)' : 'Egypt (EGP)'}</option>
                    <option value="UAE">🇦🇪 {isAr ? 'الإمارات العربية المتحدة (AED)' : 'United Arab Emirates (AED)'}</option>
                    <option value="QAT">🇶🇦 {isAr ? 'قطر (QAR)' : 'Qatar (QAR)'}</option>
                    <option value="KWT">🇰🇼 {isAr ? 'الكويت (KWD)' : 'Kuwait (KWD)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'العملة الأساسية' : 'Base Currency'}</label>
                  <input
                    type="text"
                    readOnly
                    value={newCompany.currency}
                    className="w-full border border-slate-200 bg-slate-50 font-bold rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'رقم السجل التجاري (CR)' : 'Commercial Reg No'}</label>
                  <input
                    type="text"
                    value={newCompany.commercial_registration_no}
                    onChange={(e) => setNewCompany({ ...newCompany, commercial_registration_no: e.target.value })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="1010998877"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الرقم الضريبي (VAT / Tax ID)' : 'Tax ID'}</label>
                  <input
                    type="text"
                    value={newCompany.tax_registration_no}
                    onChange={(e) => setNewCompany({ ...newCompany, tax_registration_no: e.target.value })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="300099887700003"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'رقم اشتراك التأمينات (GOSI/SI)' : 'Social Insurance No'}</label>
                  <input
                    type="text"
                    value={newCompany.social_insurance_no}
                    onChange={(e) => setNewCompany({ ...newCompany, social_insurance_no: e.target.value })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="987654321"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'رمز بنك حماية الأجور (WPS Bank)' : 'WPS Bank Code'}</label>
                  <input
                    type="text"
                    value={newCompany.bank_code}
                    onChange={(e) => setNewCompany({ ...newCompany, bank_code: e.target.value })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="RJHI / ALBI / NBE"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{isAr ? 'رقم الآيبان البنكي للرواتب (IBAN)' : 'Payroll Bank IBAN'}</label>
                <input
                  type="text"
                  value={newCompany.primary_iban}
                  onChange={(e) => setNewCompany({ ...newCompany, primary_iban: e.target.value })}
                  className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                  placeholder="SA0380000000608010167519"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isAr ? 'حفظ وتثبيت الكيان' : 'Save Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Branch */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isAr ? 'إضافة فرع أو موقع عمل جديد' : 'Add New Branch / Work Site'}
                </h3>
              </div>
              <button onClick={() => setShowAddBranchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الشركة التابع لها الفرع *' : 'Parent Company *'}</label>
                <select
                  required
                  value={newBranch.company_id}
                  onChange={(e) => setNewBranch({ ...newBranch, company_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  <option value="">{isAr ? '-- اختر الشركة --' : '-- Select Company --'}</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legal_name} ({c.country_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{isAr ? 'اسم الفرع / الموقع *' : 'Branch Name *'}</label>
                <input
                  required
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  placeholder={isAr ? 'فرع الدمام - حي الشاطئ' : 'Dammam Branch'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'المدينة *' : 'City *'}</label>
                  <input
                    required
                    type="text"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder={isAr ? 'الدمام' : 'Dammam'}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'العنوان التفصيلي *' : 'Address Line *'}</label>
                  <input
                    required
                    type="text"
                    value={newBranch.address_line}
                    onChange={(e) => setNewBranch({ ...newBranch, address_line: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder={isAr ? 'طريق الملك فيصل' : 'King Faisal Rd'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'خط العرض (Lat)' : 'Lat'}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={newBranch.geofence_latitude}
                    onChange={(e) => setNewBranch({ ...newBranch, geofence_latitude: parseFloat(e.target.value) })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'خط الطول (Lng)' : 'Lng'}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={newBranch.geofence_longitude}
                    onChange={(e) => setNewBranch({ ...newBranch, geofence_longitude: parseFloat(e.target.value) })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'النصف قطر (م)' : 'Radius (m)'}</label>
                  <input
                    type="number"
                    value={newBranch.geofence_radius_meters}
                    onChange={(e) => setNewBranch({ ...newBranch, geofence_radius_meters: parseInt(e.target.value) || 200 })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{isAr ? 'وسيلة الحضور المسموحة' : 'Attendance Mode'}</label>
                <select
                  value={newBranch.attendance_mode}
                  onChange={(e) => setNewBranch({ ...newBranch, attendance_mode: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  <option value="BOTH">{isAr ? 'كلا الخيارين (بصمة + محمول)' : 'Both (Biometric & Mobile)'}</option>
                  <option value="BIOMETRIC_ONLY">{isAr ? 'بصمة حيوية فقط' : 'Biometric Only'}</option>
                  <option value="MOBILE_GEOFENCE_ONLY">{isAr ? 'سياج جغرافي بالمحمول فقط' : 'Mobile Geofence Only'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isAr ? 'تأكيد وحفظ الفرع' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
