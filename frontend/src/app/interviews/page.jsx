'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInterview } from '@/hooks/useInterview';
import { interviewService } from '@/services/interviewService';
import { studentService } from '@/services/studentService';
import { Lock } from 'lucide-react';

export default function InterviewsPage() {
  const { interviewer, isAdmin } = useInterview();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(undefined);

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
    }).catch(() => { setSelectedYear(null); });
  }, [interviewer]);

  // โหลดรายการสัมภาษณ์
  useEffect(() => {
    if (!interviewer || selectedYear === undefined) return;
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await interviewService.getAllInterviews(selectedYear);
        if (response.success) {
          const data = isAdmin
            ? response.data
            : response.data.filter(i => i.faculty === interviewer.staff_faculty);
          setInterviews(data);
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [interviewer, isAdmin, selectedYear]);

  if (!interviewer) {
    return (
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <p className="text-gray-500 mb-6">กรอกรหัสบุคลากรที่หน้าสัมภาษณ์ก่อนจึงจะดูข้อมูลได้</p>
          <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  const filtered = interviews.filter(i =>
    i.student_name?.includes(search) ||
    String(i.student_id).includes(search) ||
    i.interviewer_name?.includes(search)
  );

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผลการสัมภาษณ์</h1>
          {!isAdmin && <p className="text-sm text-gray-500 mt-1">คณะ: {interviewer.staff_faculty}</p>}
          {isAdmin && <p className="text-sm text-blue-600 mt-1">ผู้บริหาร — แสดงข้อมูลทุกคณะ</p>}
        </div>
        <div className="flex items-center gap-3">
          {academicYears.length > 0 && (
            <div className="flex items-center gap-2">
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
          <span className="text-sm text-gray-500">ทั้งหมด {interviews.length} คน</span>
        </div>
      </div>

      {/* ค้นหา */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาด้วยชื่อนักศึกษา, รหัส, หรือชื่อผู้สัมภาษณ์"
          className="w-full md:w-96 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ชื่อนักศึกษา</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ผู้สัมภาษณ์</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.interview_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm text-gray-900">{item.student_id}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{item.student_name}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{item.faculty}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{item.program}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{item.interviewer_name}</td>
                    <td className="py-2 px-4 text-sm text-gray-500">
                      {item.interview_date
                        ? new Date(item.interview_date).toLocaleDateString('th-TH')
                        : '-'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Link
                        href={`/interviews/${item.interview_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {interviews.length === 0 ? 'ยังไม่มีการสัมภาษณ์' : 'ไม่พบข้อมูลที่ค้นหา'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
