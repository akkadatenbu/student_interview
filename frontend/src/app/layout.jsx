// frontend/src/app/layout.jsx
'use client';

import { Inter } from 'next/font/google';
import { InterviewProvider } from '@/contexts/InterviewContext.jsx';
import Header from '@/components/Header';
import Notification from '@/components/Notification';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <title>ระบบสัมภาษณ์นักศึกษา</title>
        <meta name="description" content="ระบบสัมภาษณ์นักศึกษาสำหรับเก็บข้อมูลในการดูแล" />
      </head>
      <body className={inter.className}>
        <InterviewProvider>
          <div className="min-h-screen bg-gray-100">
            <Header />

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







