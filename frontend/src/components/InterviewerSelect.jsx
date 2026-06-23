// frontend/src/components/InterviewerSelect.jsx
'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { interviewerService } from '@/services/interviewerService';

export default function InterviewerSelect() {
  const { setInterviewer, showNotification } = useInterview();
  const [interviewerId, setInterviewerId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!interviewerId.trim()) {
      showNotification('กรุณากรอกรหัสผู้สัมภาษณ์', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await interviewerService.getInterviewerById(interviewerId.trim());
      if (response.success) {
        setInterviewer(response.data);
        showNotification(`ยืนยันตัวตน: ${response.data.staff_name} (${response.data.staff_faculty})`, 'success');
      } else {
        showNotification('ไม่พบรหัสผู้สัมภาษณ์ในระบบ', 'error');
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาด: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">กรอกรหัสผู้สัมภาษณ์</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="interviewer-id" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสบุคลากร
          </label>
          <input
            id="interviewer-id"
            type="text"
            value={interviewerId}
            onChange={(e) => setInterviewerId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="กรอกรหัสบุคลากร"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="self-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  );
}
