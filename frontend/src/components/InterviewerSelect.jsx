// frontend/src/components/InterviewerSelect.jsx
'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { interviewerService } from '@/services/interviewerService';

export default function InterviewerSelect() {
  const { setInterviewer, showNotification } = useInterview();
  const [interviewers, setInterviewers] = useState([]);
  const [interviewerId, setInterviewerId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // โหลดข้อมูลผู้สัมภาษณ์
  useEffect(() => {
    const loadInterviewers = async () => {
      try {
        setLoading(true);
        const response = await interviewerService.getAllInterviewers();
        if (response.success) {
          setInterviewers(response.data);
        } else {
          showNotification('ไม่สามารถโหลดข้อมูลผู้สัมภาษณ์ได้', 'error');
        }
      } catch (error) {
        showNotification('เกิดข้อผิดพลาด: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadInterviewers();
  }, [showNotification]);
  
  // ค้นหาผู้สัมภาษณ์
  const handleInterviewerSelect = async () => {
    if (!interviewerId) {
      showNotification('กรุณากรอกรหัสผู้สัมภาษณ์', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await interviewerService.getInterviewerById(interviewerId);
      if (response.success) {
        setInterviewer(response.data);
        showNotification(`เลือกผู้สัมภาษณ์ ${response.data.staff_name} เรียบร้อยแล้ว`, 'success');
      } else {
        showNotification('ไม่พบข้อมูลผู้สัมภาษณ์', 'error');
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">เลือกผู้สัมภาษณ์</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="interviewer-id" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสผู้สัมภาษณ์
          </label>
          <input
            id="interviewer-id"
            type="text"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            placeholder="กรอกรหัสผู้สัมภาษณ์"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="self-end">
          <button
            onClick={handleInterviewerSelect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>
      </div>
      
      {interviewers.length > 0 && (
        <div className="mt-4">
          <label htmlFor="interviewer-select" className="block text-sm font-medium text-gray-700 mb-1">
            หรือเลือกจากรายการ
          </label>
          <select
            id="interviewer-select"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกผู้สัมภาษณ์ --</option>
            {interviewers.map((interviewer) => (
              <option key={interviewer.staff_id} value={interviewer.staff_id}>
                {interviewer.staff_id} - {interviewer.staff_name} ({interviewer.staff_faculty})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
