'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  MapPin,
  Building,
  Wifi,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Radio,
  Clock,
  Save,
  Users
} from 'lucide-react';
import api from '@/lib/api';

export default function BranchGeofencePage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params?.id as string;

  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Geofence form state
  const [lat, setLat] = useState(24.7136);
  const [lng, setLng] = useState(46.6753);
  const [radius, setRadius] = useState(250);
  const [attendanceMode, setAttendanceMode] = useState('HYBRID_BOTH');

  // Wi-Fi BSSID state
  const [bssidList, setBssidList] = useState<string[]>([
    'a4:93:3f:10:8e:c1 (HQ-Executive-5GHz)',
    'a4:93:3f:10:8e:c2 (HQ-Engineering-5GHz)'
  ]);
  const [newBssid, setNewBssid] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.branches.get(branchId);
        if (res?.data) {
          setBranch(res.data);
          setLat(res.data.geofence_latitude || 24.7136);
          setLng(res.data.geofence_longitude || 46.6753);
          setRadius(res.data.geofence_radius_meters || 250);
          setAttendanceMode(res.data.attendance_mode === 'BOTH' ? 'HYBRID_BOTH' : (res.data.attendance_mode || 'HYBRID_BOTH'));
        }
      } catch (err) {
        console.error('Failed to load branch geofence settings:', err);
      } finally {
        setLoading(false);
      }
    }
    if (branchId) {
      loadData();
    }
  }, [branchId]);

  const handleSaveGeofence = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const mode = attendanceMode === 'BOTH' ? 'HYBRID_BOTH' : attendanceMode;
      const res = await api.branches.updateGeofence(branchId, {
        geofence_latitude: Number(lat),
        geofence_longitude: Number(lng),
        geofence_radius_meters: Number(radius),
        attendance_mode: mode,
      });
      if (res.success) {
        setSuccessMsg('تم تحديث إحداثيات السياج الجغرافي وقواعد الحضور بنجاح.');
      }
    } catch (e: any) {
      alert(e.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBssid = () => {
    if (newBssid.trim()) {
      setBssidList([...bssidList, newBssid.trim()]);
      setNewBssid('');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">جاري استرجاع إحداثيات السياج الجغرافي وخوادم الحضور...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/company')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الهيكل المؤسسي والفروع</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{branch?.name || 'إعدادات الفرع الجغرافي'}</span>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Master Branch Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-800">{branch?.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {branch?.city} • {branch?.timezone}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{branch?.company?.legal_name}</span>
                <span className="text-slate-300">•</span>
                <span>العنوان: {branch?.address_line}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{branch?.employees_count || 0} موظف مسجل</span>
                </span>
              </p>
            </div>

            <button
              disabled={saving}
              onClick={handleSaveGeofence}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ وتطبيق إعدادات السياج'}</span>
            </button>
          </div>
        </div>

        {/* Geofence Radar & Config Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual GPS Radar Simulation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span>رادار السياج الجغرافي الحي (Live Geofence Radar Preview)</span>
            </h3>

            <div className="relative w-full h-80 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Radar Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
              
              {/* Concentric Circles representing geofence radius */}
              <div className="absolute w-64 h-64 rounded-full border border-indigo-500/20" />
              <div className="absolute w-44 h-44 rounded-full border border-indigo-500/30" />
              <div
                className="absolute rounded-full border-2 border-indigo-400 bg-indigo-500/10 transition-all duration-300 flex items-center justify-center"
                style={{ width: `${Math.min(260, Math.max(80, (radius / 500) * 200))}px`, height: `${Math.min(260, Math.max(80, (radius / 500) * 200))}px` }}
              >
                <div className="absolute top-2 text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  نصف القطر: {radius} متر
                </div>
              </div>

              {/* Pinpoint Center Marker */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-rose-500 ring-4 ring-rose-500/30 flex items-center justify-center animate-ping absolute" />
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg relative z-10">
                  <MapPin className="w-3 h-3" />
                </div>
                <div className="mt-2 text-xs font-mono font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 shadow-lg">
                  {Number(lat).toFixed(4)}° N, {Number(lng).toFixed(4)}° E
                </div>
              </div>

              {/* Anti-Spoofing & Geofence Badge */}
              <div className="absolute bottom-3 right-3 text-[11px] text-emerald-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>نظام حماية الموقع ومنع التزييف (Anti-Mock Location) مفعّل</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">خط العرض (Latitude):</span>
                <p className="font-mono text-slate-900 font-bold mt-0.5">{lat}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">خط الطول (Longitude):</span>
                <p className="font-mono text-slate-900 font-bold mt-0.5">{lng}</p>
              </div>
            </div>
          </div>

          {/* Configuration Form Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>إعدادات النطاق وقواعد التحقق</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      نصف قطر السياج الجغرافي (Geofence Radius):
                    </label>
                    <span className="text-sm font-black text-indigo-600 font-mono">{radius} متر</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>50م (مبنى واحد)</span>
                    <span>250م (مجمع مكتبي)</span>
                    <span>1000م (منطقة صناعية)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">خط العرض (Latitude)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={e => setLat(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">خط الطول (Longitude)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={e => setLng(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">طريقة الحضور المسموح بها في هذا الفرع</label>
                  <select
                    value={attendanceMode}
                    onChange={e => setAttendanceMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-semibold text-slate-800"
                  >
                    <option value="HYBRID_BOTH">نظام هجين مزدوج (بصمة بيومترية + تطبيق جوال GPS)</option>
                    <option value="BIOMETRIC_ONLY">أجهزة البصمة البيومترية فقط (ZKTeco ADMS)</option>
                    <option value="MOBILE_GEOFENCE_ONLY">تطبيق الجوال مع التحقق الجغرافي فقط (GPS Only)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Wi-Fi BSSID Whitelist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-600" />
                <span>القائمة البيضاء لشبكات Wi-Fi (BSSID Hardware Address)</span>
              </h3>
              <p className="text-xs text-slate-500">
                يشترط تطابق عنوان راوتر المكتب (BSSID) عند تسجيل الحضور عبر الجوال لمنع استخدام VPN أو تغيير الإحداثيات الوهمي.
              </p>

              <div className="space-y-2">
                {bssidList.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                    <span className="text-slate-800 font-semibold">{item}</span>
                    <button
                      onClick={() => setBssidList(bssidList.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBssid}
                  onChange={e => setNewBssid(e.target.value)}
                  placeholder="00:1a:2b:3c:4d:5e (Office-Router)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddBssid}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                >
                  إضافة BSSID
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Hardware Clocks Terminal Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>محطات البصمة البيومترية المتصلة بالفرع (Hardware Terminal Clocks)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">رقم الجهاز التسلسلي</th>
                  <th className="py-3 px-4">الموديل والبروتوكول</th>
                  <th className="py-3 px-4">عنوان IP الداخلي</th>
                  <th className="py-3 px-4">زمن استجابة البث (ADMS Ping)</th>
                  <th className="py-3 px-4">حالة الاتصال بالخادم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                <tr>
                  <td className="py-3 px-4 font-bold text-indigo-600">ZKT-OLAYA-01</td>
                  <td className="py-3 px-4">ZKTeco SpeedFace-V5L (ADMS Push)</td>
                  <td className="py-3 px-4">192.168.10.45:8081</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">14ms (ممتاز)</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      متصل الآن (Online)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-indigo-600">HIK-SMART-02</td>
                  <td className="py-3 px-4">Hikvision DS-K1T671 (ISAPI Listener)</td>
                  <td className="py-3 px-4">192.168.10.46:8081</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">22ms</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      متصل الآن (Online)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

