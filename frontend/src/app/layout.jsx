// frontend/src/app/layout.jsx
'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { InterviewProvider } from '@/contexts/InterviewContext.jsx';
import Notification from '@/components/Notification';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  return (
    <html lang="th">
      <head>
        <title>ระบบสัมภาษณ์นักศึกษา</title>
        <meta name="description" content="ระบบสัมภาษณ์นักศึกษาสำหรับเก็บข้อมูลในการดูแล" />
      </head>
      <body className={inter.className}>
        <InterviewProvider>
          <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-blue-600">ระบบสัมภาษณ์นักศึกษา</h1>
                    </div>
                    <nav className="ml-6 flex space-x-8">
                      <Link
                        href="/"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          pathname === '/' 
                            ? 'border-blue-500 text-gray-900' 
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        หน้าแรก
                      </Link>
                      <Link
                        href="/interview"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          pathname === '/interview' 
                            ? 'border-blue-500 text-gray-900' 
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        สัมภาษณ์
                      </Link>
                      <Link
                        href="/reports"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          pathname === '/reports'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        รายงาน
                      </Link>
                      <Link
                        href="/manage"
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          pathname === '/manage'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        จัดการข้อมูล
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-white shadow-inner py-4 mt-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>&copy; {new Date().getFullYear()} ระบบสัมภาษณ์นักศึกษา</p>
                </div>
              </div>
            </footer>
            
            {/* Notification component */}
            <Notification />
          </div>
        </InterviewProvider>
      </body>
    </html>
  );
}







