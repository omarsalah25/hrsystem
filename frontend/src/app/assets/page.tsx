'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import {
  Package,
  Plus,
  Search,
  Laptop,
  Smartphone,
  CreditCard,
  Car,
  CheckCircle2,
  Clock,
  Wrench
} from 'lucide-react';

interface AssetItem {
  id: string;
  name: string;
  serialNumber: string;
  category: 'LAPTOP' | 'PHONE' | 'ACCESS_CARD' | 'VEHICLE';
  assignedTo: string | null;
  assignedEmpNo: string | null;
  branch: string;
  status: 'ASSIGNED' | 'AVAILABLE' | 'MAINTENANCE';
  purchaseDate: string;
}

export default function AssetsPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === 'ar';

  const [assets, setAssets] = useState<AssetItem[]>([
    {
      id: '1',
      name: 'MacBook Pro 16" M3 Max (36GB/1TB)',
      serialNumber: 'C02G89A1MD6R',
      category: 'LAPTOP',
      assignedTo: 'عبدالله سعد العتيبي',
      assignedEmpNo: 'EMP-SA-001',
      branch: '🇸🇦 فرع الرياض',
      status: 'ASSIGNED',
      purchaseDate: '2023-01-20',
    },
    {
      id: '2',
      name: 'Dell XPS 15 9530 (i9/32GB)',
      serialNumber: 'DLX-8829104-EG',
      category: 'LAPTOP',
      assignedTo: 'أحمد محمود الشافعي',
      assignedEmpNo: 'EMP-EG-001',
      branch: '🇪🇬 فرع القاهرة',
      status: 'ASSIGNED',
      purchaseDate: '2023-05-05',
    },
    {
      id: '3',
      name: 'iPhone 15 Pro (256GB - Corporate SIM)',
      serialNumber: 'IPH-99214022',
      category: 'PHONE',
      assignedTo: 'سارة محمد القحطاني',
      assignedEmpNo: 'EMP-SA-002',
      branch: '🇸🇦 فرع الرياض',
      status: 'ASSIGNED',
      purchaseDate: '2023-09-01',
    },
    {
      id: '4',
      name: 'بطاقة دخول ذكية وموقف سيارات VIP',
      serialNumber: 'CARD-OLAYA-044',
      category: 'ACCESS_CARD',
      assignedTo: null,
      assignedEmpNo: null,
      branch: '🇸🇦 فرع الرياض',
      status: 'AVAILABLE',
      purchaseDate: '2023-01-01',
    },
  ]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAr ? 'إدارة العهد والأصول (Asset Inventory)' : 'Asset & Custody Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? 'تتبع حواسب العمل، الهواتف الذكية، بطاقات الدخول، ومراقبة تسليم العهد عند إنهاء الخدمة'
              : 'Track corporate devices, laptops, phones, cards, and offboarding asset returns'}
          </p>
        </div>

        <button
          onClick={() => alert('نافذة إضافة أصل أو عهدة جديدة')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة أصل جديد' : 'New Asset'}</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">إجمالي الأصول والعهد</p>
            <p className="text-xl font-black text-slate-900">42 أصل</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">عهد مستلمة ومسندة لموظفين</p>
            <p className="text-xl font-black text-slate-900">38 مسندة (90%)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">أصول متاحة في المخزون</p>
            <p className="text-xl font-black text-slate-900">4 أصول</p>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="p-4 text-start font-semibold">الأصل / الجهاز</th>
                <th className="p-4 text-start font-semibold">الرقم التسلسلي (SN)</th>
                <th className="p-4 text-start font-semibold">الموظف المسند إليه</th>
                <th className="p-4 text-start font-semibold">الفرع</th>
                <th className="p-4 text-start font-semibold">تاريخ التسليم</th>
                <th className="p-4 text-start font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {item.category === 'LAPTOP' && <Laptop className="w-4 h-4 text-blue-600" />}
                      {item.category === 'PHONE' && <Smartphone className="w-4 h-4 text-purple-600" />}
                      {item.category === 'ACCESS_CARD' && <CreditCard className="w-4 h-4 text-amber-600" />}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-600">{item.serialNumber}</td>
                  <td className="p-4">
                    {item.assignedTo ? (
                      <div>
                        <span className="font-bold text-slate-800">{item.assignedTo}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{item.assignedEmpNo}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-italic">غير مسند (في المخزون)</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{item.branch}</td>
                  <td className="p-4 text-slate-500">{item.purchaseDate}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      item.status === 'ASSIGNED'
                        ? 'bg-blue-100 text-blue-800'
                        : item.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'ASSIGNED' ? 'مسند لموظف' : item.status === 'AVAILABLE' ? 'متاح' : 'صيانة'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
