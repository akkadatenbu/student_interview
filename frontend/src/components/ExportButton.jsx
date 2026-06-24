// frontend/src/components/ExportButton.jsx
'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';

import { FileSpreadsheet } from 'lucide-react';

export default function ExportButton({ academicYear = null }) {
  const { downloadExcelReport } = useInterview();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await downloadExcelReport(academicYear);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
    >
      <FileSpreadsheet size={16} />
      {loading ? 'กำลังส่งออก...' : academicYear ? `Export ปี ${academicYear}` : 'ส่งออกข้อมูลเป็น Excel'}
    </button>
  );
}
