// frontend/src/components/InterviewReport.jsx
'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/services/studentService';

export default function InterviewReport({ faculty = null, academicYear = null, data = null }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ถ้าได้รับ data จาก parent ใช้เลย ไม่ต้อง fetch ซ้ำ
    if (data !== null) {
      setSummary(data);
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await studentService.getInterviewStatusSummary(academicYear);
        if (response.success) {
          const filtered = faculty
            ? response.data.filter(item => item.faculty === faculty)
            : response.data;
          setSummary(filtered);
        } else {
          setError('ไม่สามารถโหลดข้อมูลสรุปได้');
        }
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [faculty, academicYear, data]);
  
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-center py-8">
          <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h2 className="text-base font-semibold mb-3 text-gray-800">รายงานสรุปการสัมภาษณ์</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed bg-white text-sm">
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '50%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
              <th className="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
              <th className="py-2 px-2 border-b text-center text-xs font-medium text-gray-500 uppercase">ทั้งหมด</th>
              <th className="py-2 px-2 border-b text-center text-xs font-medium text-gray-500 uppercase">สัมภาษณ์</th>
              <th className="py-2 px-2 border-b text-center text-xs font-medium text-gray-500 uppercase">รอ</th>
              <th className="py-2 px-3 border-b text-center text-xs font-medium text-gray-500 uppercase">ความคืบหน้า</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summary.map((item, index) => {
              const progress = item.total_students > 0
                ? Math.round((item.interviewed_count / item.total_students) * 100)
                : 0;
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900 truncate">{item.faculty}</td>
                  <td className="py-2 px-3 text-gray-700 truncate">{item.program}</td>
                  <td className="py-2 px-2 text-center text-gray-900 font-medium">{item.total_students}</td>
                  <td className="py-2 px-2 text-center text-blue-600 font-medium">{item.interviewed_count}</td>
                  <td className="py-2 px-2 text-center text-amber-600 font-medium">{item.not_interviewed_count}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {summary.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
