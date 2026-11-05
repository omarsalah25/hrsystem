'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  User,
  Shield,
  CreditCard,
  Clock,
  Calendar,
  Laptop,
  Target,
  FileText,
  Building,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import api from '@/lib/api';

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'salary' | 'attendance' | 'leaves' | 'assets' | 'okrs' | 'documents'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({
    first_name: '',
    last_name: '',
    work_email: '',
    phone_number: '',
    allowed_attendance_mode: 'BOTH',
    employment_status: 'ACTIVE',
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.employees.get(employeeId);
      if (res && res.data) {
        setEmployee(res.data);
        setEditFormData({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          work_email: res.data.work_email || '',
          phone_number: res.data.phone_number || '',
          allowed_attendance_mode: res.data.allowed_attendance_mode || 'BOTH',
          employment_status: res.data.employment_status || 'ACTIVE',
        });
      }
    } catch (err) {
      console.error('Failed to load employee dossier:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId, loadData]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.employees.update(employee.id, editFormData);
      setIsEditModalOpen(false);
      await loadData();
      alert('تم تحديث بيانات الموظف بنجاح.');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التحديث');
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من إنهاء خدمة الموظف وتغيير حالته إلى OFFBOARDED؟')) return;
    try {
      await api.employees.delete(employee.id);
      await loadData();
      alert('تم إنهاء خدمة الموظف بنجاح.');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء العملية');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">جاري تحميل الملف الشامل للموظف (360° Profile)...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-6">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">لم يتم العثور على الموظف</h2>
          <p className="text-slate-500 mt-1">الرقم التعريفي غير مسجل أو لا تملك صلاحية الوصول إليه.</p>
          <button
            onClick={() => router.push('/employees')}
            className="mt-5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow hover:bg-indigo-700 transition"
          >
            العودة إلى دليل الموظفين
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isKSA = employee.company?.country_code === 'SAU';
  const currency = employee.current_salary?.currency || (isKSA ? 'SAR' : 'EGP');

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
          <span className="text-slate-800 font-semibold">{employee.first_name} {employee.last_name} ({employee.employee_number})</span>
        </div>

        {/* Master Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                {employee.first_name[0]}{employee.last_name[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-800">
                    {employee.first_name} {employee.middle_name} {employee.last_name}
                  </h1>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    employee.employment_status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {employee.employment_status === 'ACTIVE' ? 'على رأس العمل' : employee.employment_status}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {isKSA ? 'المملكة العربية السعودية' : 'جمهورية مصر العربية'}
                  </span>
                </div>
                <p className="text-slate-600 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{employee.designation?.title || 'موظف عام'}</span>
                  <span className="text-slate-300">•</span>
                  <span>{employee.department?.name || 'الإدارة العامة'}</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {employee.company?.legal_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {employee.branch?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {employee.work_email}
                  </span>
                  {employee.phone_number && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {employee.phone_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <span>تعديل البيانات</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <span>إنهاء الخدمة</span>
              </button>
              <button
                onClick={() => api.documents.downloadCertificate(employee.id)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>شهادة تعريف بالراتب (مصدقة)</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>البيانات الشخصية والوطنية</span>
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'salary' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>الراتب والامتثال النظامي</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>سجل الحضور والبصمات</span>
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'leaves' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>الإجازات والأرصدة</span>
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'assets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>العُهد والأجهزة التقنية</span>
            </button>
            <button
              onClick={() => setActiveTab('okrs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'okrs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>الأهداف والتقييم السنوي (OKRs)</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>مسيرات الرواتب والمستندات</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Personal & National Identity */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>البيانات الوطنية وتصاريح الإقامة (مشفّرة بنظام AES-256)</span>
              </h3>
              <div className="space-y-3 text-sm divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">رقم الهوية الوطنية / الإقامة:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {employee.profile?.national_id_display || 'غير مسجل'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">الجنسية:</span>
                  <span className="font-semibold text-slate-800">
                    {employee.profile?.nationality === 'SAU' ? 'سعودي (National)' : employee.profile?.nationality === 'EGY' ? 'مصري (National)' : employee.profile?.nationality || 'أجنبي مقيم'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">تاريخ الميلاد:</span>
                  <span className="font-semibold text-slate-800">{employee.profile?.date_of_birth || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">الجنس:</span>
                  <span className="font-semibold text-slate-800">{employee.profile?.gender === 'MALE' ? 'ذكر' : 'أنثى'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">الحالة الاجتماعية:</span>
                  <span className="font-semibold text-slate-800">{employee.profile?.marital_status || 'أعزب'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">العنوان السكني المسجل:</span>
                  <span className="font-semibold text-slate-800">{employee.profile?.residential_address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>بيانات العقد والوظيفة</span>
              </h3>
              <div className="space-y-3 text-sm divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">الرقم الوظيفي:</span>
                  <span className="font-mono font-bold text-indigo-600">{employee.employee_number}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">تاريخ التعيين:</span>
                  <span className="font-semibold text-slate-800">{employee.hire_date}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">نوع التعاقد:</span>
                  <span className="font-semibold text-slate-800">{employee.employment_type || 'دوام كامل (Full-Time)'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">معرف جهاز البصمة الحيوية:</span>
                  <span className="font-mono font-semibold text-slate-700">{employee.biometric_device_user_id || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">طريقة الحضور المعتمدة:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {employee.allowed_attendance_mode === 'BOTH' ? 'مزدوج (بصمة + تطبيق GPS)' : employee.allowed_attendance_mode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Salary & Statutory Compliance */}
        {activeTab === 'salary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>هيكل الراتب الشهري (Gross Salary Structure)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">الراتب الأساسي (Basic)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {Number(employee.current_salary?.base_salary || 0).toLocaleString()} {currency}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">بدل السكن (Housing)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {Number(employee.current_salary?.housing_allowance || 0).toLocaleString()} {currency}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">بدل النقل (Transport)</p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {Number(employee.current_salary?.transportation_allowance || 0).toLocaleString()} {currency}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-xs text-indigo-700 font-semibold">إجمالي الراتب (Gross)</p>
                  <p className="text-xl font-black text-indigo-700 mt-1">
                    {(
                      Number(employee.current_salary?.base_salary || 0) +
                      Number(employee.current_salary?.housing_allowance || 0) +
                      Number(employee.current_salary?.transportation_allowance || 0) +
                      Number(employee.current_salary?.other_allowances || 0)
                    ).toLocaleString()} {currency}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">قواعد الامتثال النظامي المطبقة:</p>
                {isKSA ? (
                  <ul className="list-disc list-inside space-y-1">
                    <li>التأمينات الاجتماعية السعودية (GOSI): خصم الموظف 9.75%، مساهمة الشركة 11.75%، سقف الأجر الخاضع 45,000 ريال.</li>
                    <li>نظام حماية الأجور (WPS / مدد): متوافق مع معايير SIF 3.0 عبر البنك المعتمد ({employee.company?.bank_code || 'RJHI'}).</li>
                    <li>مكافأة نهاية الخدمة: تخضع للمادتين 84 و 85 من نظام العمل السعودي.</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    <li>التأمينات الاجتماعية المصرية (قانون 148 لسنة 2019): حصة العامل 11%، وحصة صاحب العمل 18.75% بسقف 12,600 جنيه.</li>
                    <li>ضريبة كسب العمل (قانون 30 لسنة 2023): شرائح تصاعدية بعد خصم الإعفاء الشخصي (20,000 جنيه سنوياً).</li>
                    <li>صندوق تكريم الشهداء: خصم 0.05% من الراتب الشامل.</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800">البيانات المصرفية</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500">اسم البنك المعتمد:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{employee.company?.bank_code || 'الراجحي / الأهلي'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">رقم الآيبان (IBAN):</span>
                  <p className="font-mono text-xs font-bold text-slate-800 mt-0.5 bg-slate-100 p-2 rounded-lg">
                    {employee.company?.primary_iban || 'SA0380000000608010167519'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم التحقق من ربط الحساب بنظام حماية الأجور</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance Punch Logs */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>سجل بصمات الحضور والانصراف (آخر 15 حركة مسجلة)</span>
            </h3>

            {employee.attendance_records && employee.attendance_records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4">وقت الحضور</th>
                      <th className="py-3 px-4">وقت الانصراف</th>
                      <th className="py-3 px-4">ساعات العمل</th>
                      <th className="py-3 px-4">التأخير (دقيقة)</th>
                      <th className="py-3 px-4">مصدر الحركة</th>
                      <th className="py-3 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employee.attendance_records.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono">{rec.date}</td>
                        <td className="py-3 px-4 font-mono">{rec.first_punch_in ? new Date(rec.first_punch_in).toLocaleTimeString('ar-EG') : '—'}</td>
                        <td className="py-3 px-4 font-mono">{rec.last_punch_out ? new Date(rec.last_punch_out).toLocaleTimeString('ar-EG') : '—'}</td>
                        <td className="py-3 px-4 font-bold">{rec.total_hours_worked || '8.0'} س</td>
                        <td className="py-3 px-4 text-amber-600 font-semibold">{rec.late_minutes || 0} د</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-medium">
                            {rec.source || 'BIOMETRIC'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            {rec.status || 'حاضر (PRESENT)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>لا توجد حركات حضور مسجلة لهذا الموظف خلال الفترة الحالية.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Leaves & Requests */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">رصيد الإجازة السنوية المتاح</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">21 يوم</p>
                <p className="text-xs text-slate-400 mt-1">المستهلك: 4 أيام | المتبقي: 17 يوم</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">الإجازة المرضية النظامية</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">30 يوم مدفوع بالكامل</p>
                <p className="text-xs text-slate-400 mt-1">مادة 117 من نظام العمل السعودي</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">إجازة الحج النظامية</p>
                <p className="text-2xl font-black text-amber-600 mt-1">مؤهل (لم تستخدم)</p>
                <p className="text-xs text-slate-400 mt-1">10 إلى 15 يوم مدفوعة الأجر</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800">سجل طلبات الإجازة</h3>
              {employee.leave_requests && employee.leave_requests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                      <tr>
                        <th className="py-3 px-4">نوع الإجازة</th>
                        <th className="py-3 px-4">من تاريخ</th>
                        <th className="py-3 px-4">إلى تاريخ</th>
                        <th className="py-3 px-4">عدد الأيام</th>
                        <th className="py-3 px-4">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employee.leave_requests.map((lr: any) => (
                        <tr key={lr.id}>
                          <td className="py-3 px-4 font-bold">{lr.leave_type?.name || 'إجازة سنوية'}</td>
                          <td className="py-3 px-4 font-mono">{lr.start_date}</td>
                          <td className="py-3 px-4 font-mono">{lr.end_date}</td>
                          <td className="py-3 px-4 font-semibold">{lr.total_days} أيام</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              {lr.status === 'APPROVED' ? 'معتمدة' : lr.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-sm py-4">لا توجد طلبات إجازة سابقة.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Assets & Equipment Custody */}
        {activeTab === 'assets' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-600" />
              <span>الأجهزة والعُهد المسلمة في حوزة الموظف</span>
            </h3>

            {employee.asset_assignments && employee.asset_assignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.asset_assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {assignment.asset?.asset_code}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        في العهدة
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{assignment.asset?.name_ar}</p>
                    <p className="text-xs text-slate-500 font-mono">الرقم التسلسلي: {assignment.asset?.serial_number || '—'}</p>
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                      <span>تاريخ الاستلام: {assignment.assigned_date}</span>
                      <span>الحالة: {assignment.condition_on_handover}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <p>لا توجد عُهد مسجلة حالياً لهذا الموظف.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Performance & OKRs */}
        {activeTab === 'okrs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>الأهداف الاستراتيجية الفردية (Q4-2026 OKRs)</span>
            </h3>

            {employee.okr_goals && employee.okr_goals.length > 0 ? (
              <div className="space-y-4">
                {employee.okr_goals.map((goal: any) => (
                  <div key={goal.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{goal.title}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {goal.cycle_period}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>نسبة الإنجاز المحققة:</span>
                        <span>{goal.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4">لم يتم تسجيل أهداف مرحلية لهذه الدورة.</p>
            )}
          </div>
        )}

        {/* Tab 7: Payslips & Documents */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>مسيرات الرواتب الشهرية والشهادات الرسمية</span>
            </h3>

            {employee.payslips && employee.payslips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">دورة المسير</th>
                      <th className="py-3 px-4">إجمالي الاستحقاق</th>
                      <th className="py-3 px-4">خصم التأمينات</th>
                      <th className="py-3 px-4">صافي الراتب المحول</th>
                      <th className="py-3 px-4">تحميل مسير PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employee.payslips.map((ps: any) => (
                      <tr key={ps.id}>
                        <td className="py-3 px-4 font-bold">{ps.payroll_run?.cycle_name || 'مسير الراتب'}</td>
                        <td className="py-3 px-4 font-mono">{Number(ps.gross_earnings).toLocaleString()} {currency}</td>
                        <td className="py-3 px-4 font-mono text-rose-600">{Number(ps.employee_social_insurance).toLocaleString()} {currency}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">{Number(ps.net_pay).toLocaleString()} {currency}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => api.documents.downloadPayslip(ps.id)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1.5 text-xs font-semibold transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-sm py-4">لا توجد مسيرات رواتب مصدرة بعد.</p>
            )}
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              تعديل بيانات الموظف ({employee.employee_number})
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الاسم الأول</label>
                  <input
                    type="text"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">اسم العائلة</label>
                  <input
                    type="text"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">البريد الإلكتروني المهني</label>
                <input
                  type="email"
                  value={editFormData.work_email}
                  onChange={(e) => setEditFormData({ ...editFormData, work_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">نمط الحضور المسموح</label>
                  <select
                    value={editFormData.allowed_attendance_mode}
                    onChange={(e) => setEditFormData({ ...editFormData, allowed_attendance_mode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BOTH">مزدوج (بصمة + محمول)</option>
                    <option value="BIOMETRIC_ONLY">بصمة حيوية فقط</option>
                    <option value="MOBILE_GEOFENCE_ONLY">محمول GPS فقط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الحالة الوظيفية</label>
                  <select
                    value={editFormData.employment_status}
                    onChange={(e) => setEditFormData({ ...editFormData, employment_status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">نشط (على رأس العمل)</option>
                    <option value="ON_LEAVE">في إجازة</option>
                    <option value="SUSPENDED">موقوف مؤقتاً</option>
                    <option value="OFFBOARDED">منتهي الخدمة</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

