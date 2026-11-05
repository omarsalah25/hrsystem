'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  User,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Receipt,
  CreditCard,
  Building,
  Award
} from 'lucide-react';

export default function SelfServicePage() {
  const { t, locale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  // State for tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'claims' | 'loans'>('overview');

  // Interactive punch simulator
  const [punchedIn, setPunchedIn] = useState(true);
  const [punchTime, setPunchTime] = useState('08:52 AM');

  // Certificate Request State
  const [certType, setCertType] = useState('TO_WHOM_IT_MAY_CONCERN');
  const [certLanguage, setCertLanguage] = useState<'AR' | 'EN'>('AR');
  const [certGenerated, setCertGenerated] = useState(false);

  // Expense Claim State
  const [claimCategory, setClaimCategory] = useState('TRAVEL');
  const [claimAmount, setClaimAmount] = useState('450.00');
  const [claimCurrency, setClaimCurrency] = useState('SAR');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  // Salary Advance State
  const [advanceAmount, setAdvanceAmount] = useState('5000');
  const [repaymentMonths, setRepaymentMonths] = useState('2');
  const [advanceSubmitted, setAdvanceSubmitted] = useState(false);

  const handlePunchToggle = () => {
    if (punchedIn) {
      setPunchedIn(false);
    } else {
      setPunchedIn(true);
      const now = new Date();
      setPunchTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'بوابة الخدمة الذاتية للموظف (ESS)' : 'Employee Self-Service (ESS) Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'إدارة حسابك الشخصي، تسجيل الحضور عبر GPS، طلب شهادات الراتب، والمصروفات والسلف'
              : 'Manage your profile, mobile GPS attendance, salary letters, expenses & salary advances'}
          </p>
        </div>

        {/* Profile Chip */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            ع.ع
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isAr ? 'عبدالله سعد العتيبي' : 'Abdullah Saad Al-Otaibi'}
            </p>
            <p className="text-[10px] text-slate-500">EMP-SA-001 • Senior Software Engineer</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isAr ? 'نظرة عامة والحضور' : 'Overview & Punch'}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isAr ? 'شهادات التعريف والخطابات' : 'Salary Letters & Certificates'}
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isAr ? 'استرداد المصروفات والعهد' : 'Expense Claims'}
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`pb-3 font-bold text-xs border-b-2 transition ${
            activeTab === 'loans'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {isAr ? 'طلب سلفة على الراتب' : 'Salary Advance / Loan'}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ATTENDANCE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{isAr ? 'رصيد الإجازات السنوية' : 'Annual Leave Balance'}</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">18 {isAr ? 'يوماً' : 'days'}</p>
              <p className="text-[10px] text-emerald-600 mt-1">{isAr ? 'مستحق حتى نهاية العام' : 'Accrued for 2026'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{isAr ? 'ساعات العمل هذا الأسبوع' : 'Hours This Week'}</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">34.5 {isAr ? 'ساعة' : 'hrs'}</p>
              <p className="text-[10px] text-slate-400 mt-1">{isAr ? 'من أصل 40 ساعة مطلوبة' : 'of 40 required'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{isAr ? 'صافي راتب الشهر السابق' : 'Last Net Salary'}</span>
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">21,806.25 SAR</p>
              <p className="text-[10px] text-slate-400 mt-1">{isAr ? 'تم التحويل لحساب الراجحي' : 'Transferred to AlRajhi'}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{isAr ? 'صلاحية الهوية / الإقامة' : 'ID / Iqama Validity'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">{isAr ? 'سارية (320 يوماً)' : 'Valid (320 days)'}</p>
              <p className="text-[10px] text-slate-400 mt-1">{isAr ? 'تنتهي في: 1448/03/15 هـ' : 'Expires: 2027-09-18'}</p>
            </div>
          </div>

          {/* Clock In / Out Simulator Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${punchedIn ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span className="text-xs font-bold text-slate-300">
                    {punchedIn
                      ? isAr ? 'حالتك الحالية: على رأس العمل (حاضر)' : 'Status: Clocked In (Present)'
                      : isAr ? 'حالتك الحالية: خارج الدوام (منصرف)' : 'Status: Clocked Out'}
                  </span>
                </div>
                <h3 className="text-2xl font-black">
                  {punchedIn ? (isAr ? `تم تسجيل الحضور في ${punchTime}` : `Clocked in at ${punchTime}`) : (isAr ? 'لم يتم تسجيل الحضور اليوم' : 'Not clocked in yet')}
                </h3>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'فرع العليا، الرياض (دقة GPS: 4 أمتار)' : 'Olaya Branch, Riyadh (GPS ±4m)'}</span>
                  </div>
                  <span>•</span>
                  <span>{isAr ? 'الوردية الصباحية: 08:00 - 17:00' : 'Morning Shift: 08:00 - 17:00'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePunchToggle}
                  className={`px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 ${
                    punchedIn
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{punchedIn ? (isAr ? 'تسجيل الانصراف (Clock Out)' : 'Clock Out') : (isAr ? 'تسجيل الدخول (Clock In)' : 'Clock In')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Payslips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Payslips */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                <span>{isAr ? 'قسائم الرواتب الأخيرة' : 'Recent Payslips'}</span>
                <span className="text-[10px] text-blue-600 font-medium">{isAr ? 'مشفرة بكلمة مرور' : 'Encrypted with password'}</span>
              </h3>
              <div className="space-y-2">
                {[
                  { month: isAr ? 'أكتوبر 2026' : 'October 2026', net: '21,806.25 SAR', date: '27-10-2026' },
                  { month: isAr ? 'سبتمبر 2026' : 'September 2026', net: '21,806.25 SAR', date: '27-09-2026' },
                  { month: isAr ? 'أغسطس 2026' : 'August 2026', net: '21,806.25 SAR', date: '27-08-2026' },
                ].map((slip, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{slip.month}</p>
                        <p className="text-[10px] text-slate-400">{slip.date} • {slip.net}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`جاري تنزيل قسيمة راتب ${slip.month} بصيغة PDF مشفرة`)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تحميل PDF' : 'Download'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Request Shortcuts */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-3">{isAr ? 'الطلبات والخدمات السريعة' : 'Quick Requests'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 text-start transition group"
                >
                  <Award className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
                  <p className="text-xs font-bold text-slate-800">{isAr ? 'شهادة تعريف بالراتب' : 'Salary Certificate'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'مختومة إلكترونياً بكود QR' : 'E-stamped with QR'}</p>
                </button>

                <button
                  onClick={() => setActiveTab('claims')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 text-start transition group"
                >
                  <Receipt className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                  <p className="text-xs font-bold text-slate-800">{isAr ? 'استرداد مصاريف وسفر' : 'Expense Claim'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'إرفاق الفواتير والإيصالات' : 'Upload receipts'}</p>
                </button>

                <button
                  onClick={() => setActiveTab('loans')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:bg-indigo-50/50 text-start transition group"
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition" />
                  <p className="text-xs font-bold text-slate-800">{isAr ? 'سلفة على الراتب' : 'Salary Advance'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'خصم ميسر بالأقساط' : 'Easy installments'}</p>
                </button>

                <button
                  onClick={() => window.location.href = '/leaves'}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:bg-amber-50/50 text-start transition group"
                >
                  <Calendar className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
                  <p className="text-xs font-bold text-slate-800">{isAr ? 'طلب إجازة سنوية/مرضية' : 'Leave Request'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'فحص الرصيد والبديل' : 'Check balance'}</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALARY CERTIFICATES */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'إصدار شهادة تعريف بالراتب فورية' : 'Instant Salary Certificate Generator'}</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isAr ? 'الجهة الموجه إليها الخطاب' : 'Addressed Entity'}
              </label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="TO_WHOM_IT_MAY_CONCERN">{isAr ? 'إلى من يهمه الأمر (عام)' : 'To Whom It May Concern'}</option>
                <option value="BANK_RAJHI">{isAr ? 'مصرف الراجحي (طلب تمويل)' : 'Al Rajhi Bank (Financing)'}</option>
                <option value="BANK_SNB">{isAr ? 'البنك الأهلي السعودي (SNB)' : 'Saudi National Bank (SNB)'}</option>
                <option value="EMBASSY_SCHENGEN">{isAr ? 'السفارة / تأشيرة شنغن (Schengen Visa)' : 'Embassy (Schengen Visa)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {isAr ? 'لغة الخطاب' : 'Certificate Language'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="certLang"
                    checked={certLanguage === 'AR'}
                    onChange={() => setCertLanguage('AR')}
                    className="text-blue-600"
                  />
                  <span>{isAr ? 'اللغة العربية' : 'Arabic'}</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="certLang"
                    checked={certLanguage === 'EN'}
                    onChange={() => setCertLanguage('EN')}
                    className="text-blue-600"
                  />
                  <span>{isAr ? 'اللغة الإنجليزية' : 'English'}</span>
                </label>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">{isAr ? 'البيانات المضمنة تلقائياً في الخطاب:' : 'Included Details:'}</p>
              <p>• {isAr ? 'المسمى الوظيفي: Senior Software Engineer' : 'Job Title: Senior Software Engineer'}</p>
              <p>• {isAr ? 'تاريخ بداية العمل: 15-01-2023' : 'Joining Date: Jan 15, 2023'}</p>
              <p>• {isAr ? 'إجمالي الراتب الشامل: SAR 24,000.00 شهرياً' : 'Gross Monthly Salary: SAR 24,000.00'}</p>
              <p>• {isAr ? 'باركود QR للتحقق الرسمي من صحة الوثيقة' : 'Official Cryptographic QR Verification Code'}</p>
            </div>

            <button
              onClick={() => setCertGenerated(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? 'توليد الخطاب وتوقيعه إلكترونياً' : 'Generate & E-Sign Letter'}</span>
            </button>
          </div>

          {/* Certificate Live Preview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            {certGenerated ? (
              <div className="border border-slate-300 p-6 rounded-lg bg-amber-50/20 text-slate-800 relative">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h4 className="font-bold text-sm">مجموعة المستقبل القابضة</h4>
                    <p className="text-[10px] text-slate-500">Future Holding Group | سجل تجاري: 1010892341</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-400">
                    QR CODE
                  </div>
                </div>

                <div className="text-center font-bold text-xs underline mb-4">
                  {certLanguage === 'AR' ? 'شهادة تعريف وتثبيت راتب' : 'Salary Certificate Letter'}
                </div>

                <p className="text-xs leading-relaxed mb-4">
                  {certLanguage === 'AR'
                    ? 'تشهد شركة مجموعة المستقبل بأن الموظف / عبدالله سعد العتيبي، سعودي الجنسية، يحمل هوية رقم 1098765432، يعمل لدينا بوظيفة (Senior Software Engineer) منذ تاريخ 15/01/2023 وحتى تاريخه، ويتقاضى راتباً شهرياً شاملاً قدره 24,000.00 ريال سعودي.'
                    : 'This is to certify that Mr. Abdullah Saad Al-Otaibi, Saudi national, holder of National ID 1098765432, is employed with us as Senior Software Engineer since Jan 15, 2023, receiving a gross monthly salary of SAR 24,000.00.'}
                </p>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-500">
                  <span>ختم وتوقيع الموارد البشرية (معتمد رقمياً)</span>
                  <span className="font-mono text-emerald-600 font-bold">VERIFIED-DOC-UUID-2026</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => alert('تم تنزيل الخطاب PDF المعتمد بنجاح')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تنزيل PDF المعتمد' : 'Download Signed PDF'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileText className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-xs font-medium">
                  {isAr ? 'حدد الخيارات في القائمة المجاورة وانقر على توليد الخطاب للمعاينة الفورية' : 'Select options and click generate to preview certificate'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'تقديم مطالبة استرداد مصروفات عمل أو بدل سفر' : 'Submit Expense Reimbursement Claim'}</span>
          </h3>

          {claimSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{isAr ? 'تم إرسال المطالبة بنجاح لرئيس القسم والمالية' : 'Claim submitted successfully!'}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {isAr ? 'رقم التتبع: EXP-2026-9041 • سيتم إيداع المبلغ مع مسير رواتب الشهر الحالي فور الاعتماد' : 'Tracking ID: EXP-2026-9041 • Will be credited with this month payroll upon approval'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'بند المصروف' : 'Category'}</label>
                  <select
                    value={claimCategory}
                    onChange={(e) => setClaimCategory(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="TRAVEL">{isAr ? 'تذاكر طيران وانتقالات سفر' : 'Flight & Travel'}</option>
                    <option value="HOTEL">{isAr ? 'إقامة فندقية' : 'Hotel Accommodation'}</option>
                    <option value="CLIENT_ENTERTAINMENT">{isAr ? 'ضيافة واجتماعات عملاء' : 'Client Entertainment'}</option>
                    <option value="OFFICE_SUPPLIES">{isAr ? 'مستلزمات مكتبية وبرمجيات' : 'Supplies & Software'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'المبلغ والعملة' : 'Amount & Currency'}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                    />
                    <select
                      value={claimCurrency}
                      onChange={(e) => setClaimCurrency(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                    >
                      <option value="SAR">SAR</option>
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'وصف النفقة والغرض التجاري' : 'Business Purpose'}</label>
                <textarea
                  rows={3}
                  defaultValue={isAr ? 'حضور ورشة عمل تدريبية مع عملاء فرع الرياض' : 'Attending technical workshop with Riyadh clients'}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'إرفاق صورة الفاتورة الضريبية / الإيصال' : 'Tax Invoice / Receipt Upload'}</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <Receipt className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">{isAr ? 'انقر لرفع صورة الفاتورة (PNG, JPG, PDF)' : 'Click to upload invoice'}</p>
                  <p className="text-[10px] text-slate-400">الحد الأقصى 10 ميجابايت</p>
                </div>
              </div>

              <button
                onClick={() => setClaimSubmitted(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال المطالبة للاعتماد' : 'Submit Claim'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SALARY ADVANCE */}
      {activeTab === 'loans' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs max-w-xl">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>{isAr ? 'طلب سلفة مالية ميسرة على الراتب' : 'Salary Advance / Loan Request'}</span>
          </h3>

          {advanceSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{isAr ? 'تم استلام طلب السلفة بنجاح وهو قيد اعتماد الإدارة المالية' : 'Advance request submitted!'}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {isAr ? 'سيتم خصم القسط الشهري تلقائياً من مسير الرواتب القادم' : 'Installment will be deducted automatically from payroll'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
                <p className="font-bold">{isAr ? 'الحد الأقصى المسموح به للسلفة:' : 'Maximum Allowed Advance:'}</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  {isAr ? '50% من الراتب الأساسي = 9,000 ريال سعودي' : '50% of Basic Salary = SAR 9,000.00'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'مبلغ السلفة المطلوب (SAR)' : 'Requested Amount (SAR)'}</label>
                <input
                  type="number"
                  max="9000"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{isAr ? 'مدة السداد (عدد الأشهر)' : 'Repayment Period (Months)'}</label>
                <select
                  value={repaymentMonths}
                  onChange={(e) => setRepaymentMonths(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  <option value="1">{isAr ? 'شهر واحد (خصم كامل في المسير القادم)' : '1 Month (Full deduction)'}</option>
                  <option value="2">{isAr ? 'شهران (قسط شهري متساوٍ)' : '2 Months'}</option>
                  <option value="3">{isAr ? '3 أشهر' : '3 Months'}</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isAr ? 'القسط الشهري المقدر:' : 'Estimated Monthly Installment:'}</span>
                  <span className="font-bold text-slate-900">
                    {(Number(advanceAmount) / Number(repaymentMonths)).toFixed(2)} SAR / {isAr ? 'شهر' : 'month'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setAdvanceSubmitted(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? 'تأكيد طلب السلفة' : 'Confirm Advance Request'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
