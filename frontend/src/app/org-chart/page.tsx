'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/translations';
import { Network, Users, ChevronDown, Building, Mail } from 'lucide-react';
import { api } from '@/lib/api';

interface OrgNode {
  id?: string;
  name: string;
  role: string;
  dept: string;
  flag: string;
  branch: string;
  reportsCount?: number;
  children?: OrgNode[];
}

function OrgCard({ node }: { node: OrgNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition text-center min-w-[220px] max-w-[260px] inline-block">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold mx-auto flex items-center justify-center text-xs mb-2 shadow-xs">
        {node.name.substring(0, 2)}
      </div>
      <div className="flex items-center justify-center gap-1">
        <h4 className="font-bold text-xs text-slate-900 truncate">{node.name}</h4>
        <span>{node.flag}</span>
      </div>
      <p className="text-[11px] font-semibold text-blue-600 mt-0.5">{node.role}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{node.branch}</p>

      {node.reportsCount ? (
        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-bold">
          👥 {node.reportsCount} مرؤوس
        </span>
      ) : null}
    </div>
  );
}

export default function OrgChartPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';
  const [liveOrg, setLiveOrg] = React.useState<any>(null);
  const [isLoadingOrg, setIsLoadingOrg] = React.useState(true);

  React.useEffect(() => {
    api.orgChart.hierarchy()
      .then((res: any) => {
        if (res?.data) {
          setLiveOrg(res.data);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load org chart hierarchy:', err);
      })
      .finally(() => {
        setIsLoadingOrg(false);
      });
  }, []);

  const companies = liveOrg?.companies || [];
  const employees = liveOrg?.employees || [];
  const mainCompany = companies[0];

  const dynamicOrgData: OrgNode = {
    name: mainCompany?.trade_name || mainCompany?.legal_name || 'الكيان القانوني',
    role: 'الكيان القانوني الرئيسي (Main Legal Entity)',
    dept: mainCompany?.departments?.[0]?.name || 'الإدارة العامة',
    flag: mainCompany?.country_code === 'EGY' ? '🇪🇬' : '🇸🇦',
    branch: mainCompany?.branches?.[0]?.name || 'المقر الرئيسي',
    reportsCount: employees.length,
    children: employees.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      dept: emp.department,
      flag: mainCompany?.country_code === 'EGY' ? '🇪🇬' : '🇸🇦',
      branch: emp.branch,
      reportsCount: 0,
    })),
  };

  if (isLoadingOrg) {
    return (
      <DashboardLayout>
        <PageSkeleton variant="cards" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'الهيكل التنظيمي التفاعلي (Dynamic Org Chart)' : 'Organizational Hierarchy'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'مخطط شجري تفاعلي للهيكل الإداري وخطوط التبعية والتقارير عبر فروع السعودية ومصر'
              : 'Interactive reporting hierarchy and departmental structure across branches'}
          </p>
        </div>
      </div>

      {/* Visual Canvas Tree */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs overflow-x-auto min-h-[500px] flex flex-col items-center">
        {/* CEO Root */}
        <OrgCard node={dynamicOrgData} />

        {/* Tree Branch Line */}
        <div className="w-0.5 h-8 bg-slate-300 my-1"></div>
        <div className="w-2/3 h-0.5 bg-slate-300"></div>

        {/* Direct Reports Level 1 */}
        <div className="flex justify-around w-full mt-4 gap-6">
          {dynamicOrgData.children?.map((cLevel, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-0.5 h-6 bg-slate-300 mb-1"></div>
              <OrgCard node={cLevel} />

              {/* Sub-level 2 */}
              {cLevel.children && (
                <>
                  <div className="w-0.5 h-6 bg-slate-300 my-1"></div>
                  <div className="flex gap-3 justify-center">
                    {cLevel.children.map((sub, sIdx) => (
                      <OrgCard key={sIdx} node={sub} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

