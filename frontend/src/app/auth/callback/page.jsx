// frontend/src/app/auth/callback/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveToken, isExpired } from '@/lib/sso';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (token && !isExpired(token)) {
      saveToken(token);
      router.replace('/');
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}
