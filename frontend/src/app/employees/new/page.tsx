'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Building,
  CreditCard,
  CheckCircle2,
  Shield,
  Briefcase
} from 'lucide-react';
import api from '@/lib/api';

export default function NewEmployeePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown data
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    company_id: '',
    branch_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    employee_number: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    work_email: '',
    phone_number: '',
    hire_date: new Date().toISOString().split('T')[0],
    is_national: true,
    allowed_attendance_mode: 'BOTH',
    employment_type: 'FULL_TIME',
    national_id: '',
    date_of_birth: '1995-01-01',
    gender: 'MALE',
    nationality: 'SAU',
    marital_status: 'SINGLE',
    residential_address: '',
    base_salary: 12000,
    housing_allowance: 3000,
    transportation_allowance: 1000,
    other_allowances: 0,
    currency: 'SAR',
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const compRes = await api.companies.list();
        if (compRes?.data) {
          setCompanies(compRes.data);
          if (compRes.data.length > 0) {
            const firstComp = compRes.data[0];
            setFormData(prev => ({
              ...prev,
              company_id: firstComp.id,
              currency: firstComp.country_code === 'SAU' ? 'SAR' : 'EGP',
              nationality: firstComp.country_code === 'SAU' ? 'SAU' : 'EGY',
            }));
            const branchRes = await api.branches.list(firstComp.id);
            if (branchRes?.data && branchRes.data.length > 0) {
              setBranches(branchRes.data);
              setFormData(prev => ({ ...prev, branch_id: branchRes.data[0].id }));
            }
          }
        }
      } catch (e) {
        console.error('Error loading metadata:', e);
      }
    }
    loadMeta();
  }, []);

  const handleCompanyChange = async (compId: string) => {
    const selectedComp = companies.find(c => c.id === compId);
    const curr = selectedComp?.country_code === 'SAU' ? 'SAR' : 'EGP';
    const nat = selectedComp?.country_code === 'SAU' ? 'SAU' : 'EGY';
    setFormData(prev => ({ ...prev, company_id: compId, currency: curr, nationality: nat }));

    try {
      const res = await api.branches.list(compId);
      if (res?.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, branch_id: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.employees.create(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/employees/${res.data.id}`);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ بيانات الموظف.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/employees')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>دليل الموظفين</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">تهيئة وتعيين موظف جديد (Onboarding Wizard)</span>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {[
              { num: 1, label: 'البيانات الشخصية والوظيفية', icon: Briefcase },
              { num: 2, label: 'الامتثال والهوية الوطنية', icon: Shield },
              { num: 3, label: 'هيكل الراتب والتأمينات', icon: CreditCard },
              { num: 4, label: 'المراجعة والاعتماد', icon: CheckCircle2 },
            ].map(s => {
              const Icon = s.icon;
              const isPassed = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-indigo-600 font-bold' : isPassed ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold">تم تعيين وتسجيل الموظف بنجاح!</h3>
            <p className="text-sm">جاري التوجيه إلى الملف الشامل 360°...</p>
          </div>
        )}

        {/* Step 1: Basic & Employment Details */}
        {!success && step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>الخطوة 1: البيانات الشخصية والتعاقد</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الأول *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="مثال: محمد"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم الأب (Middle Name)</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={e => setFormData({ ...formData, middle_name: e.target.value })}
                  placeholder="مثال: عبدالله"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العائلة (Last Name) *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="مثال: الغامدي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني للعمل *</label>
                <input
                  type="email"
                  value={formData.work_email}
                  onChange={e => setFormData({ ...formData, work_email: e.target.value })}
                  placeholder="m.alghamdi@futuregroup.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف المحمول</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+966500000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الرقم الوظيفي (Employee No)</label>
                <input
                  type="text"
                  value={formData.employee_number}
                  onChange={e => setFormData({ ...formData, employee_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الكيان / الشركة التابع لها *</label>
                <select
                  value={formData.company_id}
                  onChange={e => handleCompanyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.legal_name} ({c.country_code === 'SAU' ? 'المملكة العربية السعودية' : 'مصر'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">فرع التعيين وموقع الحضور *</label>
                <select
                  value={formData.branch_id}
                  onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ مباشرة العمل *</label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={e => setFormData({ ...formData, hire_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نوع التعاقد</label>
                <select
                  value={formData.employment_type}
                  onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="FULL_TIME">دوام كامل (Full-Time)</option>
                  <option value="PART_TIME">دوام جزئي (Part-Time)</option>
                  <option value="CONTRACTOR">مستشار / تعاقد خارجي</option>
                  <option value="INTERN">تدريب تعاوني / متدرب</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!formData.first_name || !formData.last_name || !formData.work_email) {
                    setErrorMsg('يرجى استكمال الحقول الإلزامية أولاً.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition"
              >
                <span>التالي: الامتثال والهوية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Regional Compliance & National Identity */}
        {!success && step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>الخطوة 2: الامتثال الإقليمي والهوية الوطنية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رقم الهوية الوطنية / الإقامة (سيتم تشفيره بنظام AES-256) *
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={e => setFormData({ ...formData, national_id: e.target.value })}
                  placeholder="10XXXXXXXX أو 29XXXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الجنسية *</label>
                <select
                  value={formData.nationality}
                  onChange={e => setFormData({
                    ...formData,
                    nationality: e.target.value,
                    is_national: (e.target.value === 'SAU' || e.target.value === 'EGY')
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="SAU">المملكة العربية السعودية (مواطن)</option>
                  <option value="EGY">جمهورية مصر العربية (مواطن)</option>
                  <option value="JOR">المملكة الأردنية الهاشمية</option>
                  <option value="ARE">الإمارات العربية المتحدة</option>
                  <option value="IND">الهند</option>
                  <option value="PAK">باكستان</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ الميلاد *</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الجنس</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الحالة الاجتماعية</label>
                <select
                  value={formData.marital_status}
                  onChange={e => setFormData({ ...formData, marital_status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="SINGLE">أعزب / عزباء</option>
                  <option value="MARRIED">متزوج / متزوجة</option>
                  <option value="DIVORCED">مطلق / مطلقة</option>
                  <option value="WIDOWED">أرمل / أرملة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">آلية تسجيل الحضور والانصراف المسموحة</label>
              <select
                value={formData.allowed_attendance_mode}
                onChange={e => setFormData({ ...formData, allowed_attendance_mode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="BOTH">مزدوج (أجهزة البصمة البيومترية + تطبيق الجوال GPS)</option>
                <option value="BIOMETRIC_ONLY">أجهزة البصمة البيومترية فقط (ZKTeco / Hikvision)</option>
                <option value="MOBILE_GEOFENCE_ONLY">تطبيق الجوال الجغرافي فقط (GPS Geofencing)</option>
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.national_id) {
                    setErrorMsg('يرجى إدخال رقم الهوية الوطنية أو الإقامة.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(3);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition"
              >
                <span>التالي: هيكل الراتب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Salary Structure & Bank IBAN */}
        {!success && step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>الخطوة 3: هيكل الراتب والبيانات المصرفية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الراتب الأساسي ({formData.currency}) *</label>
                <input
                  type="number"
                  value={formData.base_salary}
                  onChange={e => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">بدل السكن ({formData.currency})</label>
                <input
                  type="number"
                  value={formData.housing_allowance}
                  onChange={e => setFormData({ ...formData, housing_allowance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">بدل النقل ({formData.currency})</label>
                <input
                  type="number"
                  value={formData.transportation_allowance}
                  onChange={e => setFormData({ ...formData, transportation_allowance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-indigo-700 font-semibold">إجمالي الراتب التعاقدي الشهري (Gross Salary):</p>
                <p className="text-2xl font-black text-indigo-800 mt-0.5">
                  {(formData.base_salary + formData.housing_allowance + formData.transportation_allowance).toLocaleString()} {formData.currency}
                </p>
              </div>
              <div className="text-left text-xs text-indigo-600">
                <p>محتسب تلقائياً وفق معادلات</p>
                <p className="font-bold">{formData.currency === 'SAR' ? 'التأمينات السعودية (GOSI)' : 'التأمينات المصرية (قانون 148)'}</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition"
              >
                <span>التالي: مراجعة واعتماد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Review & Submission */}
        {!success && step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <span>الخطوة 4: مراجعة البيانات واعتماد التعيين</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700">بيانات الموظف الأساسية:</h4>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">الاسم الكامل:</span> {formData.first_name} {formData.middle_name} {formData.last_name}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">الرقم الوظيفي:</span> {formData.employee_number}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">البريد الإلكتروني:</span> {formData.work_email}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">تاريخ التعيين:</span> {formData.hire_date}</p>
              </div>

              <div className="space-y-3 pt-3 md:pt-0 md:pr-4">
                <h4 className="font-bold text-slate-700">الامتثال والتعويضات:</h4>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">الهوية الوطنية / الإقامة:</span> {formData.national_id}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">الجنسية:</span> {formData.nationality}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">الراتب الأساسي:</span> {formData.base_salary.toLocaleString()} {formData.currency}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">إجمالي الراتب:</span> {(formData.base_salary + formData.housing_allowance + formData.transportation_allowance).toLocaleString()} {formData.currency}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              بالنقر على اعتماد التعيين، سيتم إنشاء حساب الموظف، وتشفير هويته الوطنية بنظام AES-256، وربطه آلياً بسجل الحضور ومسيرات الرواتب.
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition"
              >
                السابق
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'جاري الاعتماد والحفظ...' : 'اعتماد التعيين وحفظ الملف الشامل'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

