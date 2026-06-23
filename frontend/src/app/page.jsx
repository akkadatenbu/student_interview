// frontend/src/app/page.jsx
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับสู่ระบบสัมภาษณ์นักศึกษา</h1>
            <p className="text-xl text-gray-500 mb-6">
              ระบบเก็บข้อมูลการสัมภาษณ์นักศึกษาเพื่อการดูแลและช่วยเหลือ
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-blue-700 mb-2">สัมภาษณ์นักศึกษา</h2>
                <p className="text-gray-600 mb-4">
                  เริ่มการสัมภาษณ์นักศึกษาชั้นปีที่ 1 ทุกคณะและสาขาวิชา
                </p>
                <Link
                  href="/interview"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ไปที่หน้าสัมภาษณ์
                </Link>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-green-700 mb-2">ดูรายงาน</h2>
                <p className="text-gray-600 mb-4">
                  ตรวจสอบผลการสัมภาษณ์ สถิติ และส่งออกข้อมูลเป็น Excel
                </p>
                <Link
                  href="/reports"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ไปที่หน้ารายงาน
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">ภาพรวมระบบ</h2>
              <ul className="text-left max-w-lg mx-auto text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>สัมภาษณ์นักศึกษาชั้นปีที่ 1 ทุกหลักสูตร ทุกคณะ</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>คำถามเกี่ยวกับข้อมูลส่วนบุคคลนักศึกษา เพื่อเป็นข้อมูลในการช่วยเหลือดูแล</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>รายงานสถิติ จำนวนนักศึกษาที่ตอบแบบสอบถาม และยังไม่ตอบ</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>ดูรายชื่อผู้ยังไม่ตอบแบบสัมภาษณ์ได้</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>ส่งออกข้อมูลการสัมภาษณ์ทั้งหมดเป็น Excel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
