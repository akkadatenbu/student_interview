// frontend/src/app/interview/page.jsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useInterview } from '../../hooks/useInterview';
import InterviewerSelect from '@/components/InterviewerSelect';
import StudentSearch from '@/components/StudentSearch';
import StudentInfo from '@/components/StudentInfo';
import QuestionForm from '@/components/QuestionForm';

export default function InterviewPage() {
  const { interviewer, student } = useInterview();
  const searchParams = useSearchParams();
  const prefilledStudentId = searchParams.get('student_id');
  
  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">สัมภาษณ์นักศึกษา</h1>
      
      {/* ส่วนเลือกผู้สัมภาษณ์ — แสดงเฉพาะเมื่อยังไม่ได้ login */}
      {!interviewer && <InterviewerSelect />}
      
      {interviewer && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลผู้สัมภาษณ์</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">รหัส</p>
              <p className="font-medium">{interviewer.staff_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
              <p className="font-medium">{interviewer.staff_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">คณะ</p>
              <p className="font-medium">{interviewer.staff_faculty}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* ส่วนค้นหานักศึกษา */}
      {interviewer && <StudentSearch prefilledId={prefilledStudentId} />}
      
      {/* ส่วนแสดงข้อมูลนักศึกษา */}
      {student && <StudentInfo />}
      
      {/* ส่วนแบบสัมภาษณ์ */}
      {interviewer && student && <QuestionForm />}
    </div>
  );
}
