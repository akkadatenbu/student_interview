'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import InterviewReport from '@/components/InterviewReport';
import ExportButton from '@/components/ExportButton';
import { Lock } from 'lucide-react';

export default function ReportsPage() {
  const { interviewer, isAdmin } = useInterview();
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(undefined);

  const facultyFilter = isAdmin ? null : interviewer?.staff_faculty;

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
          {isAdmin && <ExportButton academicYear={selectedYear} />}
        </div>
      </div>

      {/* รายงานสรุป — รอให้ปีโหลดก่อน */}
      {selectedYear !== undefined && (
        <InterviewReport faculty={facultyFilter} academicYear={selectedYear} />
      )}
    </div>
  );
}
