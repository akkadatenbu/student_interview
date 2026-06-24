// frontend/src/app/manage/page.jsx
'use client';

import { useState } from 'react';
import StudentImport from '@/components/StudentImport';
import InterviewerImport from '@/components/InterviewerImport';
import AISettings from '@/components/AISettings';
import { GraduationCap, UserCog, Bot } from 'lucide-react';

const TABS = [
  { key: 'student',     label: 'นำเข้าข้อมูลนักศึกษา',   Icon: GraduationCap },
  { key: 'interviewer', label: 'นำเข้าข้อมูลผู้สัมภาษณ์', Icon: UserCog },
  { key: 'ai',          label: 'ตั้งค่า AI',               Icon: Bot },
];

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูล</h1>
        <p className="text-gray-500 mt-1">นำเข้าข้อมูลนักศึกษาและผู้สัมภาษณ์จากไฟล์ CSV</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'student' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">นำเข้าข้อมูลนักศึกษา</h2>
              <p className="text-sm text-gray-500 mt-1">
                รองรับ Upsert — ถ้า student_id ซ้ำจะอัปเดตข้อมูล, ถ้าใหม่จะเพิ่ม
              </p>
              <div className="mt-3 rounded-lg border border-blue-200 overflow-hidden text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="py-2 px-3 text-left font-medium">Field (ชื่อคอลัมน์ใน CSV)</th>
                      <th className="py-2 px-3 text-left font-medium">คำอธิบาย</th>
                      <th className="py-2 px-3 text-center font-medium">จำเป็น</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {[
                      { field: 'student_id',       desc: 'รหัสนักศึกษา (ตัวเลข)',         required: true  },
                      { field: 'student_name',     desc: 'ชื่อ-นามสกุล',                  required: true  },
                      { field: 'program',          desc: 'หลักสูตร / สาขาวิชา',           required: true  },
                      { field: 'faculty',          desc: 'คณะ',                            required: true  },
                      { field: 'campus',           desc: 'วิทยาเขต',                       required: true  },
                      { field: 'level',            desc: 'ระดับการศึกษา เช่น ปริญญาตรี', required: true  },
                      { field: 'academic_year',    desc: 'ปีการศึกษา เช่น 2569',          required: false },
                      { field: 'phone',            desc: 'เบอร์โทรศัพท์',                 required: false },
                      { field: 'scholarship',      desc: 'ทุนการศึกษา',                   required: false },
                      { field: 'graduated_school', desc: 'โรงเรียนที่จบการศึกษา',         required: false },
                      { field: 'hometown',         desc: 'ภูมิลำเนา',                     required: false },
                    ].map(row => (
                      <tr key={row.field} className="bg-white hover:bg-blue-50">
                        <td className="py-1.5 px-3 font-mono text-blue-800 font-medium">{row.field}</td>
                        <td className="py-1.5 px-3 text-gray-700">{row.desc}</td>
                        <td className="py-1.5 px-3 text-center">
                          {row.required
                            ? <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">จำเป็น</span>
                            : <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">ไม่บังคับ</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <StudentImport />
          </div>
        )}

        {activeTab === 'ai' && <AISettings />}

        {activeTab === 'interviewer' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">นำเข้าข้อมูลผู้สัมภาษณ์</h2>
              <p className="text-sm text-gray-500 mt-1">
                รองรับ Upsert — ถ้า staff_id ซ้ำจะอัปเดตข้อมูล, ถ้าใหม่จะเพิ่ม
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>Field ที่จำเป็น:</strong> รหัสอาจารย์, ชื่อ-นามสกุล, คณะ/สังกัด
              </div>
            </div>
            <InterviewerImport />
          </div>
        )}
      </div>
    </div>
  );
}
