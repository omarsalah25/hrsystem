'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Briefcase,
  Users,
  UserPlus,
  Star,
  ArrowRight,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import api from '@/lib/api';

const STAGES = [
  { id: 'APPLIED', title: 'تقديم الطلب', color: 'border-slate-300 bg-slate-50/50' },
  { id: 'SCREENING', title: 'الفرز والتدقيق', color: 'border-blue-300 bg-blue-50/30' },
  { id: 'INTERVIEW', title: 'المقابلة الفنية', color: 'border-amber-300 bg-amber-50/30' },
  { id: 'OFFER', title: 'العرض الوظيفي', color: 'border-purple-300 bg-purple-50/30' },
  { id: 'HIRED', title: 'تم التعيين (Hired)', color: 'border-emerald-300 bg-emerald-50/30' },
];

export default function JobOpeningPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const openingId = params?.id as string;

  const [opening, setOpening] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    expected_salary: '',
  });

  const [scorecardApp, setScorecardApp] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.recruitment.getOpening(openingId);
      if (res?.data) {
        setOpening(res.data);
      }
    } catch (err) {
      console.error('Failed to load opening pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openingId) {
      loadData();
    }
  }, [openingId]);

  const handleStageChange = async (appId: string, newStage: string) => {
    try {
      await api.recruitment.updateStage(appId, newStage);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل تحديث مرحلة المرشح');
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recruitment.createApplication(openingId, {
        ...newCandidate,
        expected_salary: Number(newCandidate.expected_salary) || null,
      });
      setIsAddCandidateOpen(false);
      setNewCandidate({ candidate_name: '', candidate_email: '', candidate_phone: '', expected_salary: '' });
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل إضافة المرشح');
    }
  };

  const handleSaveScorecard = async () => {
    if (!scorecardApp) return;
    try {
      await api.recruitment.updateScorecard(scorecardApp.id, {
        scorecard_rating: rating,
        interviewer_feedback: feedback,
      });
      setScorecardApp(null);
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل حفظ التقييم');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-medium">جاري تحميل مسار التوظيف والفرز الذكي...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!opening) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-6">
          <p className="text-slate-600">لم يتم العثور على الوظيفة المطلوبة.</p>
        </div>
      </DashboardLayout>
    );
  }

  const applications = opening.applications || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button
            onClick={() => router.push('/recruitment')}
            className="flex items-center gap-1 hover:text-indigo-600 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بوابة التوظيف واستقطاب المواهب</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{opening.title_ar}</span>
        </div>

        {/* Master Opening Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-800">{opening.title_ar}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {opening.status}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {opening.employment_type}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {opening.title_en} • إدارة {opening.department?.name || 'التقنية'} • الميزانية: {Number(opening.min_budget || 0).toLocaleString()} - {Number(opening.max_budget || 0).toLocaleString()} SAR
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddCandidateOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مرشح جديد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-w-[1000px] pb-6">
          {STAGES.map(col => {
            const stageApps = applications.filter((a: any) => a.stage === col.id);

            return (
              <div key={col.id} className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-800 text-sm">{col.title}</span>
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {stageApps.length}
                  </span>
                </div>

                <div className={`p-2 rounded-2xl border min-h-[500px] space-y-3 ${col.color}`}>
                  {stageApps.map((candidate: any) => (
                    <div
                      key={candidate.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-sm">{candidate.candidate_name}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="text-xs font-bold">{candidate.scorecard_rating || 0}/5</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{candidate.candidate_email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{candidate.candidate_phone}</span>
                        </p>
                        {candidate.expected_salary && (
                          <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            <span>المتوقع: {Number(candidate.expected_salary).toLocaleString()} SAR</span>
                          </p>
                        )}
                      </div>

                      {candidate.interviewer_feedback && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          "{candidate.interviewer_feedback}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setScorecardApp(candidate);
                            setRating(candidate.scorecard_rating || 5);
                            setFeedback(candidate.interviewer_feedback || '');
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          تقييم المقابلة
                        </button>

                        <div className="flex items-center gap-1">
                          {col.id !== 'APPLIED' && (
                            <button
                              onClick={() => {
                                const currentIndex = STAGES.findIndex(s => s.id === col.id);
                                if (currentIndex > 0) {
                                  handleStageChange(candidate.id, STAGES[currentIndex - 1].id);
                                }
                              }}
                              title="إرجاع للمرحلة السابقة"
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'HIRED' && (
                            <button
                              onClick={() => {
                                const currentIndex = STAGES.findIndex(s => s.id === col.id);
                                if (currentIndex < STAGES.length - 1) {
                                  handleStageChange(candidate.id, STAGES[currentIndex + 1].id);
                                }
                              }}
                              title="ترقية للمرحلة التالية"
                              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      لا يوجد مرشحون
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Candidate Modal */}
        {isAddCandidateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">إضافة مرشح جديد إلى الوظيفة</h3>
                <button onClick={() => setIsAddCandidateOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCandidate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المرشح *</label>
                  <input
                    type="text"
                    required
                    value={newCandidate.candidate_name}
                    onChange={e => setNewCandidate({ ...newCandidate, candidate_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={newCandidate.candidate_email}
                    onChange={e => setNewCandidate({ ...newCandidate, candidate_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={newCandidate.candidate_phone}
                    onChange={e => setNewCandidate({ ...newCandidate, candidate_phone: e.target.value })}
                    placeholder="+966500000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الراتب المتوقع (SAR)</label>
                  <input
                    type="number"
                    value={newCandidate.expected_salary}
                    onChange={e => setNewCandidate({ ...newCandidate, expected_salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddCandidateOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
                  >
                    إضافة المرشح
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Scorecard Modal */}
        {scorecardApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">بطاقة تقييم المقابلة: {scorecardApp.candidate_name}</h3>
                <button onClick={() => setScorecardApp(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">تقييم الكفاءة والمقابلة (من 1 إلى 5 نجوم):</label>
                  <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ملاحظات وملاحظات لجنة المقابلة:</label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="تقييم الجوانب التقنية، الملاءمة الثقافية، وإتقان معايير العمل..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScorecardApp(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveScorecard}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700"
                >
                  حفظ بطاقة التقييم
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

