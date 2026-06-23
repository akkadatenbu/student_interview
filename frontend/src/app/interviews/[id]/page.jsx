'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { interviewService } from '@/services/interviewService';

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
        if (response.success) {
          setData(response.data);
        } else {
          setError('ไม่พบข้อมูลการสัมภาษณ์');
        }
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
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/interviews" className="text-blue-600 hover:underline">กลับรายการ</Link>
      </div>
    );
  }

  const interviewDate = data?.interview_date
    ? new Date(data.interview_date).toLocaleString('th-TH')
    : '-';

  return (
    <div className="px-4 sm:px-0 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/interviews" className="text-blue-600 hover:text-blue-800 text-sm">
          ← กลับรายการสัมภาษณ์
        </Link>
      </div>

      {/* ข้อมูลนักศึกษา */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">ข้อมูลนักศึกษา</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">รหัสนักศึกษา:</span> <span className="font-medium">{data?.student_id}</span></div>
          <div><span className="text-gray-500">ชื่อ-นามสกุล:</span> <span className="font-medium">{data?.student_name}</span></div>
          <div><span className="text-gray-500">คณะ:</span> <span className="font-medium">{data?.faculty}</span></div>
          <div><span className="text-gray-500">หลักสูตร:</span> <span className="font-medium">{data?.program}</span></div>
          <div><span className="text-gray-500">ผู้สัมภาษณ์:</span> <span className="font-medium">{data?.staff_name}</span></div>
          <div><span className="text-gray-500">วันที่สัมภาษณ์:</span> <span className="font-medium">{interviewDate}</span></div>
        </div>
      </div>

      {/* คำถาม-คำตอบ */}
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          ผลการสัมภาษณ์
          <span className="ml-2 text-sm font-normal text-gray-500">({data?.answers?.length || 0} ข้อ)</span>
        </h2>
        <div className="space-y-4">
          {data?.answers?.length > 0 ? (
            data.answers.map((ans, index) => (
              <div key={ans.answer_id} className="border-b pb-3 last:border-b-0">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {index + 1}. {ans.question_text}
                </p>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                  {ans.answer_text || <span className="text-gray-400 italic">ไม่ได้ตอบ</span>}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">ไม่พบข้อมูลคำตอบ</p>
          )}
        </div>
      </div>
    </div>
  );
}
