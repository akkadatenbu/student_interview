'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { interviewService } from '@/services/interviewService';
import { Lock, Printer, ChevronLeft } from 'lucide-react';
import AIAnalysis from '@/components/AIAnalysis';

export default function InterviewDetailPage() {
  const { id } = useParams();
  const { interviewer } = useInterview();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!interviewer || !id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await interviewService.getInterviewById(id);
        if (response.success) setData(response.data);
        else setError('ไม่พบข้อมูลการสัมภาษณ์');
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [interviewer, id]);

  if (!interviewer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>;

  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/interviews" className="text-blue-600 hover:underline">กลับรายการ</Link>
    </div>
  );

  const interviewDate = data?.interview_date
    ? new Date(data.interview_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1.2cm; }
          body { font-size: 10pt; }
          .no-print { display: none !important; }
          .print-container { max-width: 100% !important; padding: 0 !important; }
          .print-box { box-shadow: none !important; border: 1px solid #ddd; margin-bottom: 6pt; padding: 8pt !important; }
        }
      `}</style>

      <div className="px-4 sm:px-0 max-w-3xl mx-auto print-container">

        {/* ปุ่ม — ซ่อนตอนพิมพ์ */}
        <div className="mb-3 flex justify-between items-center no-print">
          <Link href="/interviews" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
            <ChevronLeft size={16} /> กลับรายการ
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800"
          >
            <Printer size={15} /> พิมพ์ / บันทึก PDF
          </button>
        </div>

        {/* ข้อมูลนักศึกษา */}
        <div className="bg-white rounded-lg shadow-md mb-3 p-4 print-box">
          <h2 className="text-sm font-bold text-gray-800 mb-2 pb-1 border-b">ข้อมูลนักศึกษา</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">รหัสนักศึกษา:</span><span className="font-medium">{data?.student_id}</span></div>
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">ชื่อ-นามสกุล:</span><span className="font-medium">{data?.student_name}</span></div>
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">คณะ:</span><span className="font-medium">{data?.faculty}</span></div>
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">หลักสูตร:</span><span className="font-medium">{data?.program}</span></div>
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">ผู้สัมภาษณ์:</span><span className="font-medium">{data?.interviewer_name}</span></div>
            <div className="flex gap-1"><span className="text-gray-500 shrink-0">วันที่สัมภาษณ์:</span><span className="font-medium">{interviewDate}</span></div>
          </div>
        </div>

        {/* AI Analysis */}
        <AIAnalysis interviewId={id} />

        {/* คำถาม-คำตอบ */}
        <div className="bg-white rounded-lg shadow-md p-4 print-box">
          <h2 className="text-sm font-bold text-gray-800 mb-2 pb-1 border-b">
            ผลการสัมภาษณ์
          </h2>
          <div>
            {data?.answers?.length > 0 ? data.answers.map((ans, index) => (
              <div key={ans.answer_id} className="text-xs py-1 leading-snug">
                <p className="text-gray-600">{index + 1}. {ans.question_text}</p>
                <p className="text-gray-900 font-medium pl-4">
                  {ans.answer_text || <span className="text-gray-300 italic font-normal">-</span>}
                </p>
              </div>
            )) : (
              <p className="text-center text-gray-400 text-xs py-2">ไม่พบข้อมูลคำตอบ</p>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
