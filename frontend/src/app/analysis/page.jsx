'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '@/services/api';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import {
  Lock, Bot, AlertTriangle, Info, CheckCircle,
  Users, ShieldAlert, ShieldCheck, Activity, Loader
} from 'lucide-react';

const RISK_COLOR = { 'สูง': '#ef4444', 'ปานกลาง': '#f59e0b', 'ต่ำ': '#22c55e' };
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];

/* ── small helpers ── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-full ${color}`}><Icon size={20} className="text-white" /></div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const objToPieData = (obj) =>
  Object.entries(obj).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

const RiskBadge = ({ level }) => {
  const cfg = {
    'สูง':      'bg-red-100 text-red-700',
    'ปานกลาง': 'bg-yellow-100 text-yellow-700',
    'ต่ำ':      'bg-green-100 text-green-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg[level] || ''}`}>{level}</span>;
};

/* ── Section 3: Category chart card ── */
const CategoryCard = ({ title, data, colors }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => percent > 0.05 ? `${(percent*100).toFixed(0)}%` : ''} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip formatter={v => v.toLocaleString()} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

/* ══ MAIN PAGE ══ */
export default function AnalysisPage() {
  const { interviewer, isAdmin } = useInterview();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(undefined);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [riskFilter, setRiskFilter] = useState('');       // '' | 'สูง' | 'ปานกลาง'
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const facultyFilter = isAdmin ? selectedFaculty : interviewer?.staff_faculty;

  /* load years */
  useEffect(() => {
    if (!interviewer) return;
    studentService.getAcademicYears().then(res => {
      if (res.success && res.data.length > 0) { setAcademicYears(res.data); setSelectedYear(res.data[0]); }
      else setSelectedYear(null);
    }).catch(() => setSelectedYear(null));
  }, [interviewer]);

  /* load cohort stats */
  useEffect(() => {
    if (!interviewer || selectedYear === undefined) return;
    setLoading(true);
    setStats(null);
    setAiResult(null);
    const qs = new URLSearchParams();
    if (selectedYear) qs.set('academic_year', selectedYear);
    if (facultyFilter) qs.set('faculty', facultyFilter);
    api.get(`ai/cohort-stats?${qs}`).then(res => {
      if (res.success) setStats(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [interviewer, selectedYear, facultyFilter]);

  /* faculties list (admin) */
  const faculties = useMemo(() => {
    if (!stats) return [];
    return [...new Set(stats.student_risks.map(s => s.faculty))].sort();
  }, [stats]);

  /* filtered risk table */
  const riskStudents = useMemo(() => {
    if (!stats) return [];
    return stats.student_risks.filter(s => {
      if (riskFilter && s.risk_level !== riskFilter) return false;
      return true;
    }).sort((a, b) => {
      const order = { 'สูง': 0, 'ปานกลาง': 1, 'ต่ำ': 2 };
      return order[a.risk_level] - order[b.risk_level];
    });
  }, [stats, riskFilter]);

  /* summary counts */
  const riskCounts = useMemo(() => {
    if (!stats) return { high: 0, medium: 0, low: 0, total: 0 };
    const r = { high: 0, medium: 0, low: 0, total: stats.student_risks.length };
    stats.student_risks.forEach(s => {
      if (s.risk_level === 'สูง') r.high++;
      else if (s.risk_level === 'ปานกลาง') r.medium++;
      else r.low++;
    });
    return r;
  }, [stats]);

  const runAI = async () => {
    setAiLoading(true); setAiError('');
    try {
      const res = await api.post('ai/cohort-summary', {
        open_ended_texts: stats.open_ended_texts,
        total: stats.total_interviewed,
        faculty: facultyFilter || '',
      });
      if (res.success) setAiResult(res.data);
      else setAiError(res.message);
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  };

  /* ── LOGIN GUARD ── */
  if (!interviewer) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
        <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
        <h2 className="text-xl font-semibold mb-2">กรุณายืนยันตัวตนก่อน</h2>
        <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">ไปยืนยันรหัสบุคลากร</Link>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-0 space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ภาพรวม</h1>
          {!isAdmin && <p className="text-sm text-gray-500 mt-0.5">คณะ: {interviewer.staff_faculty}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {academicYears.length > 0 && (
            <select value={selectedYear ?? ''} onChange={e => setSelectedYear(e.target.value !== '' ? parseInt(e.target.value) : null)}
              className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">ทุกปี</option>
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {isAdmin && faculties.length > 0 && (
            <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px]">
              <option value="">ทุกคณะ</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          {/* AI button */}
          {stats && (
            <button onClick={runAI} disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-300">
              {aiLoading ? <Loader size={14} className="animate-spin" /> : <Bot size={14} />}
              {aiLoading ? 'กำลังวิเคราะห์...' : 'AI วิเคราะห์'}
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-20 text-gray-400">กำลังโหลดข้อมูล...</div>}

      {stats && (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Users}       label="สัมภาษณ์แล้ว"     value={riskCounts.total}  color="bg-blue-500" />
            <StatCard icon={ShieldAlert} label="ความเสี่ยงสูง"     value={riskCounts.high}   color="bg-red-500"    sub={`${riskCounts.total ? Math.round(riskCounts.high/riskCounts.total*100) : 0}%`} />
            <StatCard icon={Activity}    label="ความเสี่ยงปานกลาง" value={riskCounts.medium} color="bg-amber-500"  sub={`${riskCounts.total ? Math.round(riskCounts.medium/riskCounts.total*100) : 0}%`} />
            <StatCard icon={ShieldCheck} label="ปกติ"              value={riskCounts.low}    color="bg-green-500"  sub={`${riskCounts.total ? Math.round(riskCounts.low/riskCounts.total*100) : 0}%`} />
          </div>

          {/* ── Section 2: Faculty cohort ── */}
          {stats.faculty_risks.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">สรุปภาพรวมรายคณะ</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.faculty_risks} margin={{ left: -10, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="faculty" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: 8 }} formatter={n => ({ high: 'สูง', medium: 'ปานกลาง', low: 'ต่ำ' }[n] || n)} />
                  <Bar dataKey="high"   name="high"   stackId="a" fill="#ef4444" />
                  <Bar dataKey="medium" name="medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="low"    name="low"    stackId="a" fill="#22c55e" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Section 3: Category stats ── */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">วิเคราะห์ตามหมวดหมู่</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <CategoryCard title="แอลกอฮอล์" data={objToPieData(stats.category_stats.alcohol)}  colors={['#22c55e','#86efac','#f59e0b','#ef4444']} />
              <CategoryCard title="บุหรี่"    data={objToPieData(stats.category_stats.smoking)}  colors={['#22c55e','#f59e0b','#ef4444']} />
              <CategoryCard title="สารเสพติด" data={objToPieData(stats.category_stats.drugs)}    colors={['#22c55e','#ef4444']} />
              <CategoryCard title="สุขภาพ"    data={objToPieData(stats.category_stats.health)}   colors={['#22c55e','#f59e0b']} />
              <CategoryCard title="ค่าใช้จ่าย" data={objToPieData(stats.category_stats.expense)} colors={PIE_COLORS} />
              <CategoryCard title="ความสนใจ"  data={objToPieData(stats.category_stats.interest)} colors={['#3b82f6','#ef4444']} />
            </div>
          </div>

          {/* ── Section 1: Risk table ── */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">สัญญาณเตือนระดับรายบุคคล</h2>
              <div className="flex gap-2">
                {['', 'สูง', 'ปานกลาง'].map(f => (
                  <button key={f} onClick={() => setRiskFilter(f)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${riskFilter === f ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                    {f || 'ทั้งหมด'}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs text-gray-500 font-medium uppercase">นักศึกษา</th>
                    <th className="py-2 px-3 text-left text-xs text-gray-500 font-medium uppercase">คณะ / หลักสูตร</th>
                    <th className="py-2 px-3 text-center text-xs text-gray-500 font-medium uppercase">ความเสี่ยง</th>
                    <th className="py-2 px-3 text-left text-xs text-gray-500 font-medium uppercase">สัญญาณที่พบ</th>
                    <th className="py-2 px-3 text-center text-xs text-gray-500 font-medium uppercase">ดูข้อมูล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riskStudents.map(s => (
                    <tr key={s.student_id} className="hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <p className="font-medium text-gray-900">{s.student_name}</p>
                        <p className="text-xs text-gray-400">{s.student_id}</p>
                      </td>
                      <td className="py-2 px-3">
                        <p className="text-gray-700 text-xs">{s.faculty}</p>
                        <p className="text-gray-400 text-xs">{s.program}</p>
                      </td>
                      <td className="py-2 px-3 text-center"><RiskBadge level={s.risk_level} /></td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {s.flags.length > 0
                            ? s.flags.map((f, i) => <span key={i} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded">{f}</span>)
                            : <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Link href={`/interviews/${s.interview_id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">ดูรายละเอียด</Link>
                      </td>
                    </tr>
                  ))}
                  {riskStudents.length === 0 && (
                    <tr><td colSpan={5} className="py-10 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 text-xs text-gray-400 border-t">
              แสดง {riskStudents.length} รายการ
            </div>
          </div>

          {/* ── Section 4: AI open-ended ── */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-purple-600" />
                <h2 className="text-base font-semibold text-gray-800">AI สรุปคำตอบปลายเปิด</h2>
                <span className="text-xs text-gray-400">({stats.open_ended_texts.length} รายการ)</span>
              </div>
            </div>

            {aiError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-3">{aiError}</div>}

            {!aiResult && !aiLoading && (
              <div className="text-center py-8 text-gray-400">
                <Bot size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">กดปุ่ม <strong>AI วิเคราะห์</strong> มุมขวาบนเพื่อสรุปคำตอบปลายเปิดของนักศึกษา</p>
                <p className="text-xs mt-1">มีข้อความรอวิเคราะห์ {stats.open_ended_texts.length} รายการ</p>
              </div>
            )}

            {aiLoading && <div className="text-center py-8 text-purple-400"><Loader size={28} className="mx-auto animate-spin mb-2" /><p className="text-sm">กำลังวิเคราะห์...</p></div>}

            {aiResult && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg text-sm text-purple-900 leading-relaxed">{aiResult.summary}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'main_themes',      label: 'ประเด็นหลักที่พบ',          color: 'text-blue-600',  dot: 'bg-blue-400' },
                    { key: 'concerns',         label: 'ความกังวล / ปัญหาที่พบ',    color: 'text-red-600',   dot: 'bg-red-400'  },
                    { key: 'positive_aspects', label: 'ด้านบวกที่น่าสนใจ',         color: 'text-green-600', dot: 'bg-green-400'},
                    { key: 'recommendations',  label: 'ข้อเสนอแนะสำหรับสถาบัน',   color: 'text-amber-600', dot: 'bg-amber-400'},
                  ].map(({ key, label, color, dot }) => aiResult[key]?.length > 0 && (
                    <div key={key}>
                      <h3 className={`text-xs font-semibold uppercase mb-2 ${color}`}>{label}</h3>
                      <ul className="space-y-1">
                        {aiResult[key].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-right">วิเคราะห์โดย AI — ใช้เป็นข้อมูลประกอบเท่านั้น</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
