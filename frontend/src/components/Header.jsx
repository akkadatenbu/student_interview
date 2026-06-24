'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { Crown, LogOut, UserCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { interviewer, isAdmin, logout } = useInterview();

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        pathname === href
          ? 'border-blue-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">ระบบสัมภาษณ์นักศึกษา</h1>
            </div>
            <nav className="ml-6 flex space-x-8">
              {navLink('/', 'หน้าแรก')}
              {navLink('/interview', 'สัมภาษณ์')}
              {interviewer && navLink('/interviews', 'ผลสัมภาษณ์')}
              {interviewer && navLink('/reports', 'รายงาน')}
              {interviewer && isAdmin && navLink('/manage', 'จัดการข้อมูล')}
            </nav>
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center">
            {interviewer ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isAdmin
                    ? <Crown size={16} className="text-yellow-500" />
                    : <UserCircle size={16} className="text-blue-500" />
                  }
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{interviewer.staff_name}</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {isAdmin ? 'ผู้บริหาร' : interviewer.staff_faculty}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  <LogOut size={14} />
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">กรุณายืนยันรหัสบุคลากรก่อนใช้งาน</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
