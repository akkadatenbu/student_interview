'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import InterviewReport from '@/components/InterviewReport';
import ExportButton from '@/components/ExportButton';

export default function ReportsPage() {
  const { interviewer, isAdmin } = useInterview();
  const [notInterviewed, setNotInterviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // คณะของผู้สัมภาษณ์ — admin เห็นทั้งหมด (null = ไม่กรอง)
  const facultyFilter = isAdmin ? null : interviewer?.staff_faculty;

  useEffect(() => {
    if (!interviewer) return;

    const fetchNotInterviewed = async () => {
      try {
        setLoading(true);
        const response = await studentService.getNotInterviewedStudents();
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
  }, [interviewer, facultyFilter]);

  // ยังไม่ได้ login
  if (!interviewer) {
    return (
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="text-5xl mb-4">🔒</div>
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
          {!isAdmin && (
            <p className="text-sm text-gray-500 mt-1">คณะ: {interviewer.staff_faculty}</p>
          )}
          {isAdmin && (
            <p className="text-sm text-blue-600 mt-1">ผู้บริหาร — แสดงข้อมูลทุกคณะ</p>
          )}
        </div>
        {isAdmin && <ExportButton />}
      </div>

      {/* รายงานสรุป */}
      <InterviewReport faculty={facultyFilter} />

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
