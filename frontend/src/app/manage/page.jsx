// frontend/src/app/manage/page.jsx
'use client';

import { useState } from 'react';
import StudentImport from '@/components/StudentImport';
import InterviewerImport from '@/components/InterviewerImport';

const TABS = [
  { key: 'student',      label: 'นำเข้าข้อมูลนักศึกษา',    icon: '🎓' },
  { key: 'interviewer',  label: 'นำเข้าข้อมูลผู้สัมภาษณ์',  icon: '👤' },
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
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
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
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>Field ที่จำเป็น:</strong> รหัสนักศึกษา, ชื่อ-นามสกุล, หลักสูตร, คณะ, วิทยาเขต, ระดับ
              </div>
            </div>
            <StudentImport />
          </div>
        )}

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
