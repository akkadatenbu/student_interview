// frontend/src/components/StudentSearch.jsx
'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { studentService } from '@/services/studentService';

export default function StudentSearch({ prefilledId = null }) {
  const { setStudent, showNotification } = useInterview();
  const [studentId, setStudentId] = useState(prefilledId || '');
  const [loading, setLoading] = useState(false);

  // auto-search เมื่อมี prefilledId จาก URL
  useEffect(() => {
    if (prefilledId) {
      handleStudentSearch(prefilledId);
    }
  }, [prefilledId]);

  // ค้นหานักศึกษา
  const handleStudentSearch = async (searchId) => {
    const id = searchId || studentId;
    if (!id) {
      showNotification('กรุณากรอกรหัสนักศึกษา', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await studentService.getStudentById(id);
      if (response.success) {
        if (response.data.interviewed) {
          showNotification('นักศึกษาคนนี้ได้รับการสัมภาษณ์แล้ว', 'warning');
          return;
        }
        
        setStudent(response.data);
        showNotification(`เลือกนักศึกษา ${response.data.student_name} เรียบร้อยแล้ว`, 'success');
      } else {
        showNotification('ไม่พบข้อมูลนักศึกษา', 'error');
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">ค้นหานักศึกษา</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสนักศึกษา
          </label>
          <input
            id="student-id"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStudentSearch()}
            placeholder="กรอกรหัสนักศึกษา"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="self-end">
          <button
            onClick={() => handleStudentSearch()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>
      </div>
    </div>
  );
}
