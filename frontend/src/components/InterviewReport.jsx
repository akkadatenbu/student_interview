// frontend/src/components/InterviewReport.jsx
'use client';

import { useState, useEffect } from 'react';
import { studentService } from '@/services/studentService';

export default function InterviewReport({ faculty = null }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await studentService.getInterviewStatusSummary();
        if (response.success) {
          const data = faculty
            ? response.data.filter(item => item.faculty === faculty)
            : response.data;
          setSummary(data);
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
  }, [faculty]);
  
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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">รายงานสรุปการสัมภาษณ์</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คณะ
              </th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หลักสูตร
              </th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                นักศึกษาทั้งหมด
              </th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                สัมภาษณ์แล้ว
              </th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยังไม่ได้สัมภาษณ์
              </th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความคืบหน้า
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summary.map((item, index) => {
              const progress = item.total_students > 0 
                ? Math.round((item.interviewed_count / item.total_students) * 100) 
                : 0;
              
              return (
                <tr key={index}>
                  <td className="py-2 px-4 text-sm text-gray-900">
                    {item.faculty}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-900">
                    {item.program}
                  </td>
                  <td className="py-2 px-4 text-center text-sm text-gray-900">
                    {item.total_students}
                  </td>
                  <td className="py-2 px-4 text-center text-sm text-gray-900">
                    {item.interviewed_count}
                  </td>
                  <td className="py-2 px-4 text-center text-sm text-gray-900">
                    {item.not_interviewed_count}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{progress}%</span>
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
