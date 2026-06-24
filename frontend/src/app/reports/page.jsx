'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import InterviewReport from '@/components/InterviewReport';
import ExportButton from '@/components/ExportButton';
import { Lock } from 'lucide-react';

export default function ReportsPage() {
  const { interviewer, isAdmin } = useInterview();
  const [notInterviewed, setNotInterviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const facultyFilter = isAdmin ? null : interviewer?.staff_faculty;

  // โหลดปีการศึกษาที่มีในระบบ และเลือกปีล่าสุดเป็น default
  useEffect(() => {
    if (!interviewer) return;
    studentService.getAcademicYears().then(res => {
      if (res.success && res.data.length > 0) {
        setAcademicYears(res.data);
        setSelectedYear(res.data[0]); // ปีล่าสุด (sort DESC แล้ว)
      }
    }).catch(() => {});
  }, [interviewer]);

  useEffect(() => {
    if (!interviewer) return;

    const fetchNotInterviewed = async () => {
      try {
        setLoading(true);
        const response = await studentService.getNotInterviewedStudents(selectedYear);
        if (response.success) {
          const data = facultyFilter
            ? response.data.filter(s => s.faculty === facultyFilter)
            : response.data;
          setNotInterviewed(data);
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchNotInterviewed();
  }, [interviewer, facultyFilter, selectedYear]);

  // ยังไม่ได้ login
  if (!interviewer) {
    return (
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <p className="text-gray-500 mb-6">
            คุณต้องกรอกรหัสบุคลากรที่หน้าสัมภาษณ์ก่อนจึงจะดูรายงานได้
          </p>
          <Link
            href="/interview"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
          {!isAdmin && <p className="text-sm text-gray-500 mt-1">คณะ: {interviewer.staff_faculty}</p>}
          {isAdmin && <p className="text-sm text-blue-600 mt-1">ผู้บริหาร — แสดงข้อมูลทุกคณะ</p>}
        </div>
        <div className="flex items-center gap-3">
          {academicYears.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">ปีการศึกษา:</label>
              <select
                value={selectedYear || ''}
                onChange={e => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                {academicYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
          {isAdmin && <ExportButton />}
        </div>
      </div>

      {/* รายงานสรุป */}
      <InterviewReport faculty={facultyFilter} academicYear={selectedYear} />

      {/* รายชื่อนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์ */}
      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">
          รายชื่อนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์
          <span className="ml-2 text-sm font-normal text-gray-500">({notInterviewed.length} คน)</span>
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คณะ</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร</th>
                  <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notInterviewed.map((student) => (
                  <tr key={student.student_id}>
                    <td className="py-2 px-4 text-sm text-gray-900">{student.student_id}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{student.student_name}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{student.faculty}</td>
                    <td className="py-2 px-4 text-sm text-gray-900">{student.program}</td>
                    <td className="py-2 px-4 text-center">
                      <Link href="/interview" className="text-blue-600 hover:text-blue-800">
                        สัมภาษณ์
                      </Link>
                    </td>
                  </tr>
                ))}
                {notInterviewed.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      นักศึกษาทุกคนได้รับการสัมภาษณ์แล้ว
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
