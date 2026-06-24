// frontend/src/app/layout.jsx
'use client';

import { Prompt } from 'next/font/google';
import { InterviewProvider } from '@/contexts/InterviewContext.jsx';
import Header from '@/components/Header';
import Notification from '@/components/Notification';
import './globals.css';

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <title>ระบบสัมภาษณ์นักศึกษา</title>
        <meta name="description" content="ระบบสัมภาษณ์นักศึกษาสำหรับเก็บข้อมูลในการดูแล" />
      </head>
      <body className={prompt.className}>
        <InterviewProvider>
          <div className="min-h-screen bg-gray-100">
            <Header />

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-white shadow-inner py-5 mt-8 print:hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-700">ระบบสัมภาษณ์นักศึกษา</p>
                  <p className="text-xs text-gray-500">
                    พัฒนาโดย <span className="font-medium text-blue-600">สำนักเทคโนโลยีสารสนเทศ</span>
                  </p>
                  <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} มหาวิทยาลัยนอร์ทกรุงเทพ</p>
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







