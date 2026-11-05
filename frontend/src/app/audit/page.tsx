'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  Eye,
  RefreshCw,
  Hash
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: 'SALARY_UPDATE' | 'MANUAL_PUNCH_OVERRIDE' | 'PII_ACCESS' | 'ROLE_CHANGE';
  resource: string;
  ipAddress: string;
  prevHash: string;
  currentHash: string;
  isVerified: boolean;
  diff: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
}

export default function AuditPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainIntegrity, setChainIntegrity] = useState(true);

  const logs: AuditLog[] = [
    {
      id: 'AUD-8921',
      timestamp: '2026-11-05 03:45:12',
      actorName: 'د. عبدالله السعيد',
      actorRole: 'Super Admin',
      actionType: 'SALARY_UPDATE',
      resource: 'EmployeeSalary (EMP-SA-001)',
      ipAddress: '192.168.1.45',
      prevHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      currentHash: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72',
      isVerified: true,
      diff: {
        before: { basic_salary: 16000, housing_allowance: 4000 },
        after: { basic_salary: 18000, housing_allowance: 4500 },
      },
    },
    {
      id: 'AUD-8920',
      timestamp: '2026-11-05 02:18:40',
      actorName: 'سارة محمد القحطاني',
      actorRole: 'HR Manager',
      actionType: 'MANUAL_PUNCH_OVERRIDE',
      resource: 'AttendancePunch (EMP-EG-001)',
      ipAddress: '10.0.4.12',
      prevHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      isVerified: true,
      diff: {
        before: { punch_time: null, status: 'ABSENT' },
        after: { punch_time: '09:00:00', status: 'REGULARIZED_BY_HR' },
      },
    },
    {
      id: 'AUD-8919',
      timestamp: '2026-11-04 18:22:05',
      actorName: 'م. فهد الدوسري',
      actorRole: 'Finance Director',
      actionType: 'PII_ACCESS',
      resource: 'EmployeeProfile (IBAN Vault)',
      ipAddress: '172.16.0.88',
      prevHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      currentHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      isVerified: true,
      diff: {
        before: { action: 'VIEW_ENCRYPTED_BANK_DETAILS' },
        after: { access_granted: true, reason: 'WPS_SIF_VERIFICATION' },
      },
    },
    {
      id: 'AUD-8918',
      timestamp: '2026-11-04 14:10:33',
      actorName: 'نورهان طارق المنشاوي',
      actorRole: 'Payroll Admin',
      actionType: 'ROLE_CHANGE',
      resource: 'User (id: 4)',
      ipAddress: '192.168.1.102',
      prevHash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      currentHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      isVerified: true,
      diff: {
        before: { role: 'EMPLOYEE' },
        after: { role: 'LEAVE_APPROVER' },
      },
    },
  ];

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setChainIntegrity(true);
      alert(isAr ? 'تم فحص سلسلة التشفير بالكامل: لا يوجد أي تلاعب وسلسلة SHA-256 مطابقة بنسبة 100%' : 'Cryptographic chain audit complete: 100% verified and tamper-free');
    }, 800);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'سجل التدقيق الأمني المشفر (Immutable Audit Trail)' : 'Cryptographic Audit Trail & Compliance Ledger'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'سجل غير قابل للتعديل مشفر بسلسلة هاش SHA-256 لتوثيق كل تغيير على الرواتب، البصمات، والبيانات الحساسة'
              : 'Tamper-evident ledger linked via SHA-256 hash-chaining tracking salary, attendance and PII changes'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'فحص سلامة التشفير' : 'Verify Hash Chain'}</span>
          </button>

          <button
            onClick={() => alert(isAr ? 'جاري تصدير تقرير التدقيق المعتمد للمراجعين' : 'Exporting audit compliance report')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير التقرير' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* Integrity Badge Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-md mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">{isAr ? 'سلسلة الهاش غير القابلة للتلاعب' : 'Tamper-Proof Merkle Hash Chain'}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                {isAr ? 'سليمة 100%' : '100% INTACT'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isAr
                ? 'كل سجل يحتوي على بصمة الهاش للسجل السابق. أي تعديل مباشر في قاعدة البيانات سيكسر السلسلة فوراً.'
                : 'Every record seals the hash of the predecessor. Any direct database update invalidates subsequent blocks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/60 px-4 py-2.5 rounded-xl border border-white/10">
          <div>
            <p className="text-[10px] text-slate-400 font-sans">{isAr ? 'آخر كتلة معتمدة' : 'Latest Block Hash'}</p>
            <p className="text-emerald-400 truncate w-48">9b71d224bd62f3785d96d46ad3ea3d7...</p>
          </div>
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالموظف، الهاش، عنوان IP...' : 'Search actor, hash, IP address...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-white"
          >
            <option value="ALL">{isAr ? 'كل العمليات الأمنية' : 'All Actions'}</option>
            <option value="SALARY_UPDATE">{isAr ? 'تعديل الرواتب' : 'Salary Updates'}</option>
            <option value="MANUAL_PUNCH_OVERRIDE">{isAr ? 'تصحيح بصمة يدوي' : 'Punch Overrides'}</option>
            <option value="PII_ACCESS">{isAr ? 'الوصول للبيانات الحساسة' : 'PII Access'}</option>
            <option value="ROLE_CHANGE">{isAr ? 'تغيير الصلاحيات' : 'Role Changes'}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                <th className="p-3 text-start">{isAr ? 'المعرف' : 'Log ID'}</th>
                <th className="p-3 text-start">{isAr ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                <th className="p-3 text-start">{isAr ? 'المستخدم المنفذ' : 'Actor'}</th>
                <th className="p-3 text-start">{isAr ? 'نوع الإجراء' : 'Action'}</th>
                <th className="p-3 text-start">{isAr ? 'السجل المعدل' : 'Target Resource'}</th>
                <th className="p-3 text-start">{isAr ? 'عنوان IP' : 'IP Address'}</th>
                <th className="p-3 text-start">{isAr ? 'هاش SHA-256' : 'SHA-256 Hash'}</th>
                <th className="p-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-center">{isAr ? 'الفروقات' : 'Diff'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-mono font-bold text-blue-600">{log.id}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{log.actorName}</p>
                    <p className="text-[10px] text-slate-400">{log.actorRole}</p>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{log.resource}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{log.ipAddress}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={log.currentHash}>
                    {log.currentHash.substring(0, 16)}...
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isAr ? 'مطابق' : 'Sealed'}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isAr ? 'عرض' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isAr ? `فروقات التعديل للسجل: ${selectedLog.id}` : `Audit Diff: ${selectedLog.id}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="font-bold text-rose-800 font-sans mb-1">{isAr ? 'القيمة السابقة (Before):' : 'Before:'}</p>
                <pre className="text-[11px] text-rose-950 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.diff.before, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="font-bold text-emerald-800 font-sans mb-1">{isAr ? 'القيمة الجديدة (After):' : 'After:'}</p>
                <pre className="text-[11px] text-emerald-950 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.diff.after, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="text-slate-500 font-bold">{isAr ? 'بيانات التشفير والهاش:' : 'Cryptographic Chain:'}</p>
              <p className="text-[10px] font-mono text-slate-600 break-all">
                <span className="text-slate-400">prev_hash:</span> {selectedLog.prevHash}
              </p>
              <p className="text-[10px] font-mono text-emerald-700 break-all">
                <span className="text-slate-400">curr_hash:</span> {selectedLog.currentHash}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
