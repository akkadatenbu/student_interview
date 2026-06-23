// frontend/src/components/StudentInfo.jsx
'use client';

import { useInterview } from '@/hooks/useInterview';

export default function StudentInfo() {
  const { student } = useInterview();
  
  if (!student) return null;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">ข้อมูลนักศึกษา</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">รหัสนักศึกษา</p>
          <p className="font-medium">{student.student_id}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
          <p className="font-medium">{student.student_name}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">คณะ</p>
          <p className="font-medium">{student.faculty}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">หลักสูตร</p>
          <p className="font-medium">{student.program}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">วิทยาเขต</p>
          <p className="font-medium">{student.campus}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">ระดับ</p>
          <p className="font-medium">{student.level}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
          <p className="font-medium">{student.phone || '-'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">ทุนการศึกษา</p>
          <p className="font-medium">{student.scholarship || '-'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">โรงเรียนที่จบ</p>
          <p className="font-medium">{student.graduated_school || '-'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">ภูมิลำเนา</p>
          <p className="font-medium">{student.hometown || '-'}</p>
        </div>
      </div>
    </div>
  );
}