// frontend/src/components/AuthGate.jsx
// แสดง children เฉพาะเมื่อยืนยันตัวตนผ่าน NBU SSO สำเร็จแล้วเท่านั้น
'use client';

import { usePathname } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const { authState, authMessage, relogin } = useInterview();

  // หน้า callback แสดงเองอยู่แล้ว ไม่ต้อง gate ซ้อน
  if (pathname === '/auth/callback') return children;

  // หน้าแรกเป็น public landing — ให้แสดงเองตาม authState (ไม่บังคับ login ก่อนเห็นหน้า)
  if (pathname === '/') return children;

  if (authState === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-500">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (authState === 'loggedOut') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-gray-600">ออกจากระบบแล้ว</p>
        <button
          onClick={relogin}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          เข้าสู่ระบบใหม่
        </button>
        <p className="text-xs text-gray-400 max-w-sm">
          หากใช้คอมพิวเตอร์สาธารณะ กรุณาปิด Browser เพื่อความปลอดภัย
        </p>
      </div>
    );
  }

  if (authState === 'unregistered') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <p className="text-red-600 font-medium">ไม่สามารถเข้าใช้งานระบบได้</p>
        <p className="text-sm text-gray-600 max-w-md">{authMessage}</p>
      </div>
    );
  }

  // authState === 'ok'
  return children;
}
