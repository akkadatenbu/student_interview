// frontend/src/components/ExportButton.jsx
'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';

export default function ExportButton() {
  const { downloadExcelReport } = useInterview();
  const [loading, setLoading] = useState(false);
  
  const handleExport = async () => {
    try {
      setLoading(true);
      await downloadExcelReport();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
    >
      {loading ? 'กำลังส่งออก...' : 'ส่งออกข้อมูลเป็น Excel'}
    </button>
  );
}
