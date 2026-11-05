'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  ShieldCheck,
  X
} from 'lucide-react';

interface EmployeeItem {
  id: string;
  empNo: string;
  name: string;
  email: string;
  phone: string;
  dept: string;
  role: string;
  branch: string;
  flag: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION';
  salary: string;
  hireDate: string;
  attendanceMode: string;
  gosiOrId: string;
}

const sampleEmployees: EmployeeItem[] = [
  {
    id: '1',
    empNo: 'EMP-SA-001',
    name: 'عبدالله سعد العتيبي',
    email: 'abdullah@futuregroup.com',
    phone: '+966 50 123 4567',
    dept: 'تقنية المعلومات (IT)',
    role: 'Senior Software Engineer',
    branch: 'فرع الرياض (Olaya)',
    flag: '🇸🇦',
    status: 'ACTIVE',
    salary: 'SAR 24,000',
    hireDate: '2023-01-15',
    attendanceMode: 'بصمة حيوية + محمول (Both)',
    gosiOrId: 'GOSI: 987654321',
  },
  {
    id: '2',
    empNo: 'EMP-EG-001',
    name: 'أحمد محمود الشافعي',
    email: 'ahmed.elshafey@futuregroup.com',
    phone: '+20 10 1234 5678',
    dept: 'تقنية المعلومات (IT)',
    role: 'Lead Backend Engineer',
    branch: 'فرع القاهرة (القرية الذكية)',
    flag: '🇪🇬',
    status: 'ACTIVE',
    salary: 'EGP 28,000',
    hireDate: '2023-05-01',
    attendanceMode: 'بصمة حيوية فقط (Biometric)',
    gosiOrId: 'الرقم التأميني: 55443322',
  },
  {
    id: '3',
    empNo: 'EMP-SA-002',
    name: 'سارة محمد القحطاني',
    email: 'sara.qahtani@futuregroup.com',
    phone: '+966 55 987 6543',
    dept: 'الموارد البشرية (HR)',
    role: 'HR Operations Lead',
    branch: 'فرع الرياض (Olaya)',
    flag: '🇸🇦',
    status: 'ACTIVE',
    salary: 'SAR 19,500',
    hireDate: '2023-08-10',
    attendanceMode: 'محمول عبر الموقع الجغرافي (Mobile)',
    gosiOrId: 'GOSI: 789123456',
  },
  {
    id: '4',
    empNo: 'EMP-EG-002',
    name: 'نورهان طارق المنشاوي',
    email: 'nourhan.t@futuregroup.com',
    phone: '+20 12 8765 4321',
    dept: 'الشؤون المالية (Finance)',
    role: 'Senior Payroll Specialist',
    branch: 'فرع القاهرة (القرية الذكية)',
    flag: '🇪🇬',
    status: 'ON_LEAVE',
    salary: 'EGP 22,000',
    hireDate: '2024-02-01',
    attendanceMode: 'بصمة حيوية + محمول (Both)',
    gosiOrId: 'الرقم التأميني: 33221199',
  },
];

export default function EmployeesPage() {
  const { t, locale, isRtl } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeModalEmployee, setActiveModalEmployee] = useState<EmployeeItem | null>(null);
  const [employeesList, setEmployeesList] = useState<EmployeeItem[]>(sampleEmployees);

  React.useEffect(() => {
    api.employees.list()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: EmployeeItem[] = res.data.map((e: any) => ({
            id: e.id,
            empNo: e.employee_number || 'EMP-000',
            name: `${e.first_name} ${e.last_name}`,
            email: e.work_email,
            phone: e.profile?.emergency_contact_phone || '+966 50 000 0000',
            dept: e.department?.name_ar || 'تقنية المعلومات',
            role: e.designation?.name_ar || 'مهندس برمجيات',
            branch: e.branch?.name_ar || 'فرع الرياض',
            flag: e.branch?.country === 'SA' ? '🇸🇦' : '🇪🇬',
            status: e.employment_status || 'ACTIVE',
            salary: 'SAR 24,000',
            hireDate: e.hire_date || '2023-01-01',
            attendanceMode: e.attendance_mode === 'BOTH' ? 'مزدوج (بصمة + محمول)' : 'محمول',
            gosiOrId: 'GOSI / SI Verified'
          }));
          setEmployeesList(mapped);
        }
      })
      .catch(() => {
        // Fallback to sampleEmployees
      });
  }, []);

  const filteredEmployees = employeesList.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch =
      selectedBranch === 'ALL' ||
      (selectedBranch === 'SAU' && emp.flag === '🇸🇦') ||
      (selectedBranch === 'EGY' && emp.flag === '🇪🇬');

    return matchesSearch && matchesBranch;
  });

  return (
    <DashboardLayout>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'ar' ? 'سجل الموظفين' : 'Employee Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === 'ar'
              ? 'إدارة بيانات الموظفين، العقود، الرواتب، وطرق تسجيل الحضور عبر فروع المنشأة'
              : 'Manage employee profiles, contracts, salaries, and attendance methods'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs">
            <Download className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تصدير Excel' : 'Export Excel'}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-600/20">
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إضافة موظف جديد' : 'Add Employee'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === 'ar' ? 'بحث بالاسم أو الرقم الوظيفي...' : 'Search name, ID...'}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none ${
              isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">{locale === 'ar' ? 'جميع الفروع' : 'All Branches'}</option>
            <option value="SAU">🇸🇦 فرع السعودية (الرياض)</option>
            <option value="EGY">🇪🇬 فرع مصر (القاهرة)</option>
          </select>
        </div>
      </div>

      {/* Employees Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الرقم' : 'ID'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'القسم والمنصب' : 'Department & Role'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الفرع' : 'Branch'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'طريقة الحضور' : 'Attendance Mode'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الراتب الشامل' : 'Gross Salary'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-4 text-start font-semibold">{locale === 'ar' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setActiveModalEmployee(emp)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="p-4 font-mono font-bold text-blue-700">{emp.empNo}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-800 font-medium">{emp.role}</div>
                    <div className="text-[11px] text-slate-400">{emp.dept}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold text-[11px]">
                      <span>{emp.flag}</span>
                      <span>{emp.branch}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{emp.attendanceMode}</td>
                  <td className="p-4 font-bold text-slate-900">{emp.salary}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      emp.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {emp.status === 'ACTIVE' ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'إجازة' : 'On Leave')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition">
                      {locale === 'ar' ? 'عرض الملف' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee 360 Dossier Modal */}
      {activeModalEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-lg">
                  {activeModalEmployee.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{activeModalEmployee.name}</span>
                    <span>{activeModalEmployee.flag}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{activeModalEmployee.empNo}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalEmployee(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'المسمى الوظيفي' : 'Role'}</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeModalEmployee.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'القسم والفرع' : 'Department'}</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeModalEmployee.branch}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'الراتب المعتمد' : 'Salary'}</span>
                <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{activeModalEmployee.salary}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'رقم التأمينات / GOSI' : 'Insurance / GOSI'}</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{activeModalEmployee.gosiOrId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'طريقة البصمة المعتمدة' : 'Punch Mode'}</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{activeModalEmployee.attendanceMode}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">{locale === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{activeModalEmployee.hireDate}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveModalEmployee(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

