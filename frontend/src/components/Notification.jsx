
// frontend/src/components/Notification.jsx
'use client';

import { useInterview } from '@/hooks/useInterview';

export default function Notification() {
  const { notification } = useInterview();
  
  if (!notification.show) return null;
  
  // กำหนดสีตามประเภทการแจ้งเตือน
  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md border-l-4 shadow-md ${getNotificationStyle()}`}>
      <p className="font-medium">{notification.message}</p>
    </div>
  );
}