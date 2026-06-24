'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from 'recharts';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import InterviewReport from '@/components/InterviewReport';
import ExportButton from '@/components/ExportButton';
import { Lock, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

// Summary card
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Custom pie label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportsPage() {
  const { interviewer, isAdmin } = useInterview();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(undefined);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const facultyFilter = isAdmin ? null : interviewer?.staff_faculty;

  // โหลดปีการศึกษา
  useEffect(() => {
    if (!interviewer) return;
    studentService.getAcademicYears().then(res => {
      if (res.success && res.data.length > 0) {
        setAcademicYears(res.data);
        setSelectedYear(res.data[0]);
      } else {
        setSelectedYear(null);
      }
    }).catch(() => setSelectedYear(null));
  }, [interviewer]);

  // โหลด summary data
  useEffect(() => {
    if (!interviewer || selectedYear === undefined) return;
    setLoading(true);
    studentService.getInterviewStatusSummary(selectedYear).then(res => {
      if (res.success) {
        const data = facultyFilter
          ? res.data.filter(d => d.faculty === facultyFilter)
          : res.data;
        setSummary(data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [interviewer, selectedYear, facultyFilter]);

  // Faculties list (admin only)
  const faculties = useMemo(() =>
    [...new Set(summary.map(d => d.faculty))].sort(),
    [summary]
  );

  // กรองตาม faculty ที่ admin เลือก
  const filteredSummary = useMemo(() =>
    selectedFaculty ? summary.filter(d => d.faculty === selectedFaculty) : summary,
    [summary, selectedFaculty]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredSummary.reduce((s, d) => s + parseInt(d.total_students), 0);
    const interviewed = filteredSummary.reduce((s, d) => s + parseInt(d.interviewed_count), 0);
    const pending = total - interviewed;
    const pct = total > 0 ? Math.round((interviewed / total) * 100) : 0;
    return { total, interviewed, pending, pct };
  }, [filteredSummary]);

  // Bar chart data — group by faculty
  const barData = useMemo(() => {
    const map = {};
    filteredSummary.forEach(d => {
      if (!map[d.faculty]) map[d.faculty] = { faculty: d.faculty.replace('คณะ', '').trim(), interviewed: 0, pending: 0 };
      map[d.faculty].interviewed += parseInt(d.interviewed_count);
      map[d.faculty].pending += parseInt(d.not_interviewed_count);
    });
    return Object.values(map);
  }, [filteredSummary]);

  // Pie chart data
  const pieData = [
    { name: 'สัมภาษณ์แล้ว', value: stats.interviewed },
    { name: 'รอสัมภาษณ์', value: stats.pending },
  ];

  if (!interviewer) {
    return (
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <p className="text-gray-500 mb-6">คุณต้องกรอกรหัสบุคลากรที่หน้าสัมภาษณ์ก่อนจึงจะดูรายงานได้</p>
          <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard รายงาน</h1>
          {!isAdmin && <p className="text-sm text-gray-500 mt-0.5">คณะ: {interviewer.staff_faculty}</p>}
          {isAdmin && <p className="text-sm text-blue-600 mt-0.5">ผู้บริหาร — แสดงข้อมูลทุกคณะ</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* ปีการศึกษา */}
          {academicYears.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-gray-600 whitespace-nowrap">ปีการศึกษา:</label>
              <select
                value={selectedYear ?? ''}
                onChange={e => setSelectedYear(e.target.value !== '' ? parseInt(e.target.value) : null)}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
          {/* filter คณะ (admin) */}
          {isAdmin && faculties.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-gray-600 whitespace-nowrap">คณะ:</label>
              <select
                value={selectedFaculty}
                onChange={e => setSelectedFaculty(e.target.value)}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
              >
                <option value="">ทั้งหมด</option>
                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}
          {isAdmin && <ExportButton academicYear={selectedYear} />}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="นักศึกษาทั้งหมด" value={stats.total} color="bg-blue-500" />
            <StatCard icon={CheckCircle} label="สัมภาษณ์แล้ว" value={stats.interviewed} sub={`${stats.pct}% ของทั้งหมด`} color="bg-green-500" />
            <StatCard icon={Clock} label="รอสัมภาษณ์" value={stats.pending} color="bg-amber-500" />
            <StatCard icon={TrendingUp} label="ความคืบหน้า" value={stats.pct} sub="เปอร์เซ็นต์" color="bg-purple-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">ความคืบหน้าแยกตามคณะ</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 0, right: 10, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="faculty"
                    tick={{ fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) => [value.toLocaleString(), name === 'interviewed' ? 'สัมภาษณ์แล้ว' : 'รอสัมภาษณ์']}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend
                    formatter={name => name === 'interviewed' ? 'สัมภาษณ์แล้ว' : 'รอสัมภาษณ์'}
                    wrapperStyle={{ paddingTop: 12 }}
                  />
                  <Bar dataKey="interviewed" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
              <h2 className="text-base font-semibold text-gray-800 mb-4">สัดส่วนภาพรวม</h2>
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#fbbf24" />
                    </Pie>
                    <Tooltip formatter={v => v.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    สัมภาษณ์แล้ว ({stats.interviewed.toLocaleString()})
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    รอสัมภาษณ์ ({stats.pending.toLocaleString()})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          {selectedYear !== undefined && (
            <InterviewReport data={filteredSummary} />
          )}
        </>
      )}
    </div>
  );
}
