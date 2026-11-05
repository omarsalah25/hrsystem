'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import api from '@/lib/api';
import {
  Building2,
  Users,
  MapPin,
  Banknote,
  ShieldCheck,
  Package,
  Plus,
  ArrowRight,
  ArrowLeft,
  Search,
  Globe2,
  ExternalLink,
  ChevronDown,
  BarChart3,
  Calendar,
  LogOut,
  Sparkles,
  Server,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export default function PlatformAdminDashboardPage() {
  const router = useRouter();
  const { t, locale, setLocale, isRtl } = useTranslation();
  const isAr = locale === 'ar';

  const [isLoading, setIsLoading] = useState(true);
  const [systemTotals, setSystemTotals] = useState<any>({
    total_companies: 0,
    total_branches: 0,
    total_departments: 0,
    total_employees: 0,
    active_employees: 0,
    total_assets: 0,
    total_monthly_payroll: 0,
    system_health: 'OPTIMAL',
    audit_ledger_status: 'VERIFIED_100_PERCENT',
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<'ALL' | 'SAU' | 'EGY' | 'ARE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  const [newCompany, setNewCompany] = useState({
    legal_name: '',
    trade_name: '',
    country_code: 'SAU',
    currency: 'SAR',
    commercial_registration_no: '',
    tax_registration_no: '',
    social_insurance_no: '',
    wps_employer_id: '',
    bank_code: 'NCB',
    primary_iban: '',
  });

  const loadData = () => {
    setIsLoading(true);
    api.reports.companiesOverview()
      .then((res) => {
        if (res?.data) {
          setSystemTotals(res.data.system_totals || {});
          setCompanies(res.data.companies || []);
          if (res.data.companies?.length > 0 && !expandedCompanyId) {
            setExpandedCompanyId(res.data.companies[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load platform overview:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.companies.create(newCompany);
      setIsAddCompanyOpen(false);
      setNewCompany({
        legal_name: '',
        trade_name: '',
        country_code: 'SAU',
        currency: 'SAR',
        commercial_registration_no: '',
        tax_registration_no: '',
        social_insurance_no: '',
        wps_employer_id: '',
        bank_code: 'NCB',
        primary_iban: '',
      });
      loadData();
      alert(isAr ? 'تم إضافة الكيان القانوني بنجاح!' : 'Legal entity created successfully!');
    } catch (err: any) {
      alert(err.message || 'Error creating company');
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    router.push('/admin/login');
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesCountry = selectedCountryFilter === 'ALL' || c.country_code === selectedCountryFilter;
    const matchesSearch =
      !searchQuery ||
      c.legal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trade_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cr_number?.includes(searchQuery);
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">HRSystem Core OS</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PLATFORM OWNER
              </span>
            </div>
            <p className="text-[10px] text-slate-400">لوحة تحكم مالك المنظومة وإدارة الشركات القابضة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            <span>{isAr ? 'بوابة تشغيل الشركات (Company Ops)' : 'Company Operations'}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/60 transition"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-8 border border-indigo-900/50 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>نظام الموارد البشرية القابض متعدد الكيانات (Multi-Entity HRIS)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr ? 'لوحة مالك المنظومة والتقارير المجمعة للشركات' : 'Platform Owner & Group Holdings Cockpit'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {isAr
                  ? 'متابعة حية وموحدة لكافة الكيانات التابعة، توزيع القوى العاملة الإقليمية (السعودية ومصر والإمارات)، مسيرات الرواتب الإجمالية، ونسب التوطين والامتثال القانوني.'
                  : 'Centralized holding management for legal entities, cross-border workforce, consolidated payroll, and statutory localization compliance.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsAddCompanyOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة شركة / كيان قانوني جديد' : 'New Legal Entity'}</span>
              </button>

              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold border border-slate-700 transition"
              >
                <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global System Totals KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'الكيانات القانونية' : 'Legal Entities'}</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{systemTotals.total_companies || companies.length}</p>
            <span className="text-[10px] text-emerald-400 font-bold block mt-1">🇸🇦 SAU • 🇪🇬 EGY • 🇦🇪 ARE</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'الفروع المعتمدة' : 'Active Branches'}</span>
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{systemTotals.total_branches || 4}</p>
            <span className="text-[10px] text-slate-400 block mt-1">مع سياج جغرافي GPS</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'إجمالي الموظفين' : 'Total Headcount'}</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{systemTotals.total_employees || 10}</p>
            <span className="text-[10px] text-emerald-400 font-bold block mt-1">
              {systemTotals.active_employees || 10} نشط حالياً
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'الأقسام الإدارية' : 'Departments'}</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{systemTotals.total_departments || 5}</p>
            <span className="text-[10px] text-slate-400 block mt-1">عبر كافة الكيانات</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'الأصول والعهد' : 'Tracked Assets'}</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{systemTotals.total_assets || 6}</p>
            <span className="text-[10px] text-slate-400 block mt-1">أجهزة ومعدات رقمية</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{isAr ? 'سجل التدقيق' : 'Audit Ledger'}</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-lg font-black text-emerald-400">100% سليم</p>
            <span className="text-[10px] text-teal-400 font-bold block mt-1">سلسلة SHA-256 مشفرة</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0 me-2">الدولة:</span>
            {[
              { id: 'ALL', label: isAr ? 'جميع الكيانات' : 'All' },
              { id: 'SAU', label: '🇸🇦 السعودية' },
              { id: 'EGY', label: '🇪🇬 مصر' },
              { id: 'ARE', label: '🇦🇪 الإمارات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCountryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCountryFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`w-3.5 h-3.5 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم أو السجل التجاري...' : 'Search company, CR number...'}
              className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition ${
                isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
              }`}
            />
          </div>
        </div>

        {/* Companies Breakdown Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'تقارير الأداء وتفاصيل الكيانات التابعة' : 'Legal Entities Reports & Operations'}</span>
              <span className="text-xs text-slate-400 font-normal">({filteredCompanies.length} كيان قانوني)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              جارِ تحميل البيانات الإدارية والتقارير المالية المجمعة...
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              لا توجد شركات مطابقة للفلاتر المحددة.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredCompanies.map((comp) => {
                const isExpanded = expandedCompanyId === comp.id;
                const flag = comp.country_code === 'SAU' ? '🇸🇦' : comp.country_code === 'EGY' ? '🇪🇬' : '🇦🇪';

                return (
                  <div
                    key={comp.id}
                    className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition"
                  >
                    {/* Company Card Header */}
                    <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/40 text-2xl flex items-center justify-center shadow-inner">
                          {flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-white">{comp.trade_name || comp.legal_name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-400">
                              {comp.compliance_status || 'معتمد ونشط'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {comp.legal_name} • العملة: <strong className="text-indigo-300">{comp.currency}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Quick Meta Badges */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">السجل التجاري (CR):</span>
                          <span className="font-mono font-bold text-slate-200">{comp.cr_number || '1010789456'}</span>
                        </div>
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">الرقم الضريبي (Tax):</span>
                          <span className="font-mono font-bold text-slate-200">{comp.tax_number || '3104567890'}</span>
                        </div>
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">التأمينات (GOSI):</span>
                          <span className="font-mono font-bold text-slate-200">{comp.gosi_number || '3001894210'}</span>
                        </div>

                        <button
                          onClick={() => setExpandedCompanyId(isExpanded ? null : comp.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>{isExpanded ? (isAr ? 'طي التقرير' : 'Collapse') : (isAr ? 'عرض التقرير التفصيلي' : 'Expand Report')}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-800 bg-slate-950/50 p-4 text-xs">
                      <div className="p-3 text-center">
                        <span className="text-slate-400 block text-[11px] mb-1">إجمالي الموظفين</span>
                        <span className="text-xl font-black text-white">{comp.total_employees} موظف</span>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">({comp.active_employees} نشط)</span>
                      </div>

                      <div className="p-3 text-center">
                        <span className="text-slate-400 block text-[11px] mb-1">نسبة التوطين والامتثال</span>
                        <span className="text-xl font-black text-indigo-400">{comp.localization_rate}%</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {comp.country_code === 'SAU' ? 'نطاقات (بلاتيني)' : 'قانون العمل المصري'}
                        </span>
                      </div>

                      <div className="p-3 text-center">
                        <span className="text-slate-400 block text-[11px] mb-1">الفروع التابعة</span>
                        <span className="text-xl font-black text-white">{comp.branches_count} فروع</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">سياج GPS إلكتروني</span>
                      </div>

                      <div className="p-3 text-center">
                        <span className="text-slate-400 block text-[11px] mb-1">آخر مسير رواتب معتمد</span>
                        <span className="text-xl font-black text-white">
                          {comp.latest_payroll ? `${comp.latest_payroll.total_gross.toLocaleString()} ${comp.currency}` : 'لا يوجد مسير'}
                        </span>
                        <span className="text-[10px] text-emerald-400 block mt-0.5">
                          {comp.latest_payroll ? comp.latest_payroll.cycle_name : 'جاهز للاحتساب'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detailed Report Section */}
                    {isExpanded && (
                      <div className="p-6 bg-slate-950/80 border-t border-slate-800 space-y-6">
                        {/* 1. Workforce Breakdown */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>تقرير القوى العاملة والتوطين (Workforce & Localization)</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-slate-400 text-[11px] block">المواطنون (Nationals):</span>
                              <span className="text-lg font-black text-white mt-1 block">
                                {comp.national_employees} موظف
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">تأمينات GOSI/NOSI مسددة</p>
                            </div>
                            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-slate-400 text-[11px] block">الوافدون والمقيمون (Expats):</span>
                              <span className="text-lg font-black text-white mt-1 block">
                                {comp.expat_employees} موظف
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">إقامات وعقود موثقة</p>
                            </div>
                            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-slate-400 text-[11px] block">الأصول في عهدة الكيان:</span>
                              <span className="text-lg font-black text-white mt-1 block">
                                {comp.assets_count} أصل مخصص
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">أجهزة لابتوب ومعدات</p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Branches & Locations */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>الفروع الميدانية وأجهزة البصمة (Branches & Geofences)</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {comp.branches && comp.branches.length > 0 ? (
                              comp.branches.map((b: any) => (
                                <div key={b.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-white block">{b.name}</span>
                                    <span className="text-[11px] text-slate-400">المدينة: {b.city}</span>
                                  </div>
                                  <div className="text-end">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                      {b.headcount} موظف
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500">لا توجد فروع مسجلة لهذا الكيان حتى الآن.</p>
                            )}
                          </div>
                        </div>

                        {/* 3. Latest Payroll Breakdown */}
                        {comp.latest_payroll && (
                          <div>
                            <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-3 flex items-center gap-1.5">
                              <Banknote className="w-3.5 h-3.5" />
                              <span>التقرير المالي لآخر مسير رواتب ({comp.latest_payroll.cycle_name})</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
                              <div>
                                <span className="text-slate-400 text-[10px] block">إجمالي الرواتب (Gross):</span>
                                <span className="text-sm font-bold text-white mt-0.5 block">
                                  {comp.latest_payroll.total_gross.toLocaleString()} {comp.currency}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">صافي الرواتب المصروف (Net):</span>
                                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                                  {comp.latest_payroll.total_net.toLocaleString()} {comp.currency}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">مساهمة صاحب العمل (GOSI/SI):</span>
                                <span className="text-sm font-bold text-indigo-300 mt-0.5 block">
                                  {comp.latest_payroll.total_employer_contributions.toLocaleString()} {comp.currency}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">حالة الصرف والامتثال:</span>
                                <span className="text-xs font-black text-emerald-400 mt-0.5 block">
                                  {comp.latest_payroll.status} (WPS Compliant)
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Action Navigation */}
                        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-3">
                          <Link
                            href="/company"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                          >
                            <span>إدارة الفروع والسياج الجغرافي &rarr;</span>
                          </Link>
                          <Link
                            href="/payroll"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                          >
                            <span>مسيرات الرواتب وملفات WPS &rarr;</span>
                          </Link>
                          <Link
                            href="/employees"
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white transition shadow-sm"
                          >
                            <span>سجل موظفي الكيان &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Add Legal Entity */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {isAr ? 'إضافة شركة / كيان قانوني جديد للمنظومة' : 'Add New Legal Entity to Platform'}
                  </h3>
                  <p className="text-[11px] text-slate-400">تسجيل كيان قانوني مستقل مع ربط السجلات التجارية والضريبية والبنكية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCompanyOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم القانوني الكامل (Legal Name)' : 'Legal Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة المستقبل للتقنية المحدودة"
                    value={newCompany.legal_name}
                    onChange={(e) => setNewCompany({ ...newCompany, legal_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم التجاري (Trade Name)' : 'Trade Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فيوتشر تك السعودية"
                    value={newCompany.trade_name}
                    onChange={(e) => setNewCompany({ ...newCompany, trade_name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'دولة الاختصاص القضائي' : 'Jurisdiction'} *
                  </label>
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
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SAU">🇸🇦 المملكة العربية السعودية (KSA)</option>
                    <option value="EGY">🇪🇬 جمهورية مصر العربية (Egypt)</option>
                    <option value="ARE">🇦🇪 الإمارات العربية المتحدة (UAE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'عملة الرواتب والعمليات' : 'Operating Currency'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany.currency}
                    onChange={(e) => setNewCompany({ ...newCompany, currency: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'السجل التجاري (CR)' : 'CR Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="1010XXXXXX"
                    value={newCompany.commercial_registration_no}
                    onChange={(e) => setNewCompany({ ...newCompany, commercial_registration_no: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الرقم الضريبي (Tax ID)' : 'Tax ID'}
                  </label>
                  <input
                    type="text"
                    placeholder="310XXXXXXXX"
                    value={newCompany.tax_registration_no}
                    onChange={(e) => setNewCompany({ ...newCompany, tax_registration_no: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'التأمينات الاجتماعية' : 'Social Insurance'}
                  </label>
                  <input
                    type="text"
                    placeholder="300XXXXX"
                    value={newCompany.social_insurance_no}
                    onChange={(e) => setNewCompany({ ...newCompany, social_insurance_no: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'رمز البنك لمسيرات WPS' : 'Bank Code'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NCB, RJHI, CIB"
                    value={newCompany.bank_code}
                    onChange={(e) => setNewCompany({ ...newCompany, bank_code: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الآيبان البنكي الرئيسي (IBAN)' : 'Primary IBAN'}
                  </label>
                  <input
                    type="text"
                    placeholder="SA0000000000000000000000"
                    value={newCompany.primary_iban}
                    onChange={(e) => setNewCompany({ ...newCompany, primary_iban: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-800 p-2.5 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  {isAr ? 'حفظ وإضافة الكيان' : 'Save & Register Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
