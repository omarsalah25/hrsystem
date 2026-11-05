'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTranslation } from '@/lib/translations';
import { api } from '@/lib/api';
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
  Wrench,
  X
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
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState({
    company_id: '',
    asset_code: '',
    name_ar: '',
    name_en: '',
    category: 'LAPTOP',
    serial_number: '',
    purchase_value: 5000,
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const loadAssets = async () => {
    try {
      const [res, compRes] = await Promise.all([
        api.assets.list().catch(() => null),
        api.companies.list().catch(() => ({ data: [] })),
      ]);

      if (compRes?.data && compRes.data.length > 0) {
        setCompanies(compRes.data);
        if (!newAsset.company_id) {
          setNewAsset((prev) => ({ ...prev, company_id: compRes.data[0].id }));
        }
      }

      const rawItems = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      if (rawItems.length > 0) {
        const mapped: AssetItem[] = rawItems.map((a: any) => {
          const assignment = a.assignments && a.assignments.length > 0 ? a.assignments[0] : null;
          return {
            id: a.id,
            name: isAr ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar),
            serialNumber: a.serial_number || a.asset_code,
            category: a.category || 'LAPTOP',
            assignedTo: assignment?.employee ? `${assignment.employee.first_name} ${assignment.employee.last_name}` : null,
            assignedEmpNo: assignment?.employee?.employee_number || null,
            branch: a.company?.country_code === 'SAU' ? '🇸🇦 فرع الرياض' : '🇪🇬 فرع القاهرة',
            status: a.status || 'AVAILABLE',
            purchaseDate: a.purchase_date || '2024-01-01',
          };
        });
        setAssets(mapped);
      }
    } catch (err) {
      console.warn('Failed to load assets from API:', err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.assets.create({
        ...newAsset,
        asset_code: newAsset.asset_code || `AST-${Date.now().toString().slice(-4)}`,
      });
      setShowAddModal(false);
      setNewAsset({
        company_id: companies[0]?.id || '',
        asset_code: '',
        name_ar: '',
        name_en: '',
        category: 'LAPTOP',
        serial_number: '',
        purchase_value: 5000,
        purchase_date: new Date().toISOString().split('T')[0],
      });
      loadAssets();
    } catch (err: any) {
      alert(err.message || 'Error creating asset');
    }
  };

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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إضافة أصل أو عهدة جديدة' : 'Add New Asset'}</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">{isAr ? 'إجمالي الأصول' : 'Total Assets'}</p>
            <p className="text-lg font-bold text-slate-900">{assets.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">{isAr ? 'في عهدة الموظفين' : 'Assigned'}</p>
            <p className="text-lg font-bold text-slate-900">{assets.filter((a) => a.status === 'ASSIGNED').length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">{isAr ? 'متاح للتسليم' : 'Available'}</p>
            <p className="text-lg font-bold text-slate-900">{assets.filter((a) => a.status === 'AVAILABLE').length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500">{isAr ? 'صيانة وضمان' : 'Maintenance'}</p>
            <p className="text-lg font-bold text-slate-900">{assets.filter((a) => a.status === 'MAINTENANCE').length}</p>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="p-4 text-start font-semibold">{isAr ? 'اسم الأصل والنوع' : 'Asset & Category'}</th>
                <th className="p-4 text-start font-semibold">{isAr ? 'الرقم التسلسلي' : 'Serial Number'}</th>
                <th className="p-4 text-start font-semibold">{isAr ? 'الفرع / الموقع' : 'Branch'}</th>
                <th className="p-4 text-start font-semibold">{isAr ? 'الموظف المستلم (العهدة)' : 'Assigned Employee'}</th>
                <th className="p-4 text-start font-semibold">{isAr ? 'تاريخ الشراء' : 'Purchase Date'}</th>
                <th className="p-4 text-start font-semibold">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {asset.category === 'LAPTOP' && <Laptop className="w-4 h-4 text-blue-600" />}
                      {asset.category === 'PHONE' && <Smartphone className="w-4 h-4 text-purple-600" />}
                      {asset.category === 'ACCESS_CARD' && <CreditCard className="w-4 h-4 text-amber-600" />}
                      {asset.category === 'VEHICLE' && <Car className="w-4 h-4 text-emerald-600" />}
                      <span>{asset.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-700">{asset.serialNumber}</td>
                  <td className="p-4 text-slate-600">{asset.branch}</td>
                  <td className="p-4">
                    {asset.assignedTo ? (
                      <div>
                        <p className="font-bold text-slate-900">{asset.assignedTo}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{asset.assignedEmpNo}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">{isAr ? 'غير مسند (في المستودع)' : 'Unassigned'}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{asset.purchaseDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        asset.status === 'ASSIGNED'
                          ? 'bg-blue-100 text-blue-800'
                          : asset.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {asset.status === 'ASSIGNED'
                        ? isAr ? 'في العهدة' : 'Assigned'
                        : asset.status === 'AVAILABLE'
                        ? isAr ? 'متاح للتسليم' : 'Available'
                        : isAr ? 'قيد الصيانة' : 'Maintenance'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isAr ? 'إضافة أصل أو عهدة جديدة' : 'Add New Corporate Asset'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الشركة المالكة للأصل *' : 'Company *'}</label>
                <select
                  required
                  value={newAsset.company_id}
                  onChange={(e) => setNewAsset({ ...newAsset, company_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legal_name} ({c.country_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'اسم الأصل (بالعربية) *' : 'Name (Arabic) *'}</label>
                  <input
                    required
                    type="text"
                    value={newAsset.name_ar}
                    onChange={(e) => setNewAsset({ ...newAsset, name_ar: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="جهاز حاسوب ماك بوك برو"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'اسم الأصل (بالإنجليزية) *' : 'Name (English) *'}</label>
                  <input
                    required
                    type="text"
                    value={newAsset.name_en}
                    onChange={(e) => setNewAsset({ ...newAsset, name_en: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    placeholder="MacBook Pro 16"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'التصنيف *' : 'Category *'}</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="LAPTOP">حاسوب محمول (Laptop)</option>
                    <option value="PHONE">هاتف ذكي (Phone)</option>
                    <option value="ACCESS_CARD">بطاقة دخول / أمنية</option>
                    <option value="VEHICLE">مركبة / سيارة عمل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{isAr ? 'الرقم التسلسلي (Serial Number) *' : 'Serial Number *'}</label>
                  <input
                    required
                    type="text"
                    value={newAsset.serial_number}
                    onChange={(e) => setNewAsset({ ...newAsset, serial_number: e.target.value })}
                    className="w-full font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="C02G4590MD6R"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {isAr ? 'حفظ وتسجيل الأصل' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
