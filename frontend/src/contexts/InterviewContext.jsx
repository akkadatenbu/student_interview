// frontend/src/contexts/InterviewContext.jsx
'use client';

import { createContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { questionService } from '@/services/questionService';
import { authService } from '@/services/authService';
import { getToken, loginWithSSO, logout as ssoLogout, isLoggedOut, relogin as ssoRelogin } from '@/lib/sso';

// สร้าง Context สำหรับข้อมูลการสัมภาษณ์
export const InterviewContext = createContext();

// Provider Component
export const InterviewProvider = ({ children }) => {
  const pathname = usePathname();

  // ── Auth state: ยืนยันตัวตนผ่าน NBU SSO ──────────────────────
  // 'checking' | 'guest' | 'ok' | 'loggedOut' | 'unregistered' | 'error'
  const [authState, setAuthState] = useState('checking');
  const [authMessage, setAuthMessage] = useState('');
  const [interviewer, setInterviewerState] = useState(null);

  useEffect(() => {
    // หน้า callback จัดการ token เอง — ห้าม auto-redirect ซ้อนกัน
    if (pathname === '/auth/callback') return;

    const token = getToken();

    if (!token) {
      // หน้าแรกเป็น public landing — ไม่บังคับ auto-redirect ให้ผู้ใช้กดปุ่มเข้าสู่ระบบเอง
      if (pathname === '/') {
        setAuthState('guest');
        return;
      }
      if (isLoggedOut()) {
        setAuthState('loggedOut');
      } else {
        loginWithSSO(); // auto-redirect ทันที ไม่ต้องมีปุ่ม
      }
      return;
    }

    authService.getMe()
      .then((res) => {
        if (res.success) {
          setInterviewerState(res.data);
          setAuthState('ok');
        } else {
          setAuthMessage(res.message || 'ไม่สามารถยืนยันตัวตนได้');
          setAuthState('unregistered');
        }
      })
      .catch((err) => {
        setAuthMessage(err.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
        setAuthState('unregistered');
      });
  }, [pathname]);

  const isAdmin = interviewer?.isAdmin || false;

  // ออกจากระบบ — ตั้ง flag ป้องกัน auto-redirect วนซ้ำ (ดู lib/sso.js)
  const logout = () => {
    ssoLogout();
    setInterviewerState(null);
    setStudent(null);
    setAnswers({});
    setAuthState('loggedOut');
  };

  const relogin = () => {
    ssoRelogin();
  };

  // สถานะสำหรับนักศึกษา
  const [student, setStudent] = useState(null);

  // สถานะสำหรับคำถามทั้งหมด
  const [questions, setQuestions] = useState([]);

  // สถานะสำหรับคำตอบ
  const [answers, setAnswers] = useState({});

  // สถานะสำหรับคำถามที่แสดง (ตามเงื่อนไข)
  const [visibleQuestions, setVisibleQuestions] = useState([]);

  // สถานะแสดงความคืบหน้า
  const [loading, setLoading] = useState(false);

  // สถานะข้อความแจ้งเตือน
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // โหลดคำถามเมื่อ login สำเร็จแล้วเท่านั้น
  useEffect(() => {
    if (authState !== 'ok') return;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await questionService.getAllQuestions();
        if (response.success) {
          setQuestions(response.data);
          // เริ่มต้นให้คำถามทั้งหมดแสดง
          setVisibleQuestions(response.data);
        }
      } catch (error) {
        showNotification('ไม่สามารถโหลดคำถามได้: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [authState]);

  // อัปเดตคำถามที่มองเห็นตามเงื่อนไข
  useEffect(() => {
    if (questions.length === 0) return;

    // กรองคำถามตามเงื่อนไข
    const evaluateConditions = () => {
      const visible = questions.filter(question => {
        // ถ้าไม่มีเงื่อนไข ให้แสดงคำถามนั้น
        if (!question.condition_logic || question.condition_logic.trim() === '') {
          return true;
        }

        try {
          // แยกเงื่อนไขเป็น [questionId, operator, value]
          const conditions = question.condition_logic.split(',').map(c => c.trim());

          // ตรวจสอบทุกเงื่อนไข
          return conditions.every(condition => {
            const parts = condition.split(':');
            if (parts.length !== 3) return true;

            const [qId, operator, expectedValue] = parts;
            const questionId = parseInt(qId);
            const actualValue = answers[questionId] || '';

            switch (operator) {
              case 'eq':
                return actualValue === expectedValue;
              case 'neq':
                return actualValue !== expectedValue;
              case 'contains':
                return actualValue.includes(expectedValue);
              case 'gt':
                return parseFloat(actualValue) > parseFloat(expectedValue);
              case 'lt':
                return parseFloat(actualValue) < parseFloat(expectedValue);
              default:
                return true;
            }
          });
        } catch (error) {
          console.error(`Error evaluating condition for question ${question.question_id}:`, error);
          return true; // แสดงคำถามถ้าการประเมินเงื่อนไขมีข้อผิดพลาด
        }
      });

      setVisibleQuestions(visible);
    };

    evaluateConditions();
  }, [questions, answers]);

  // บันทึกคำตอบ
  const saveAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // รีเซ็ตข้อมูลการสัมภาษณ์
  const resetInterview = () => {
    setStudent(null);
    setAnswers({});
  };

  // แสดงข้อความแจ้งเตือน
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });

    // ซ่อนข้อความแจ้งเตือนหลังจาก 5 วินาที
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  return (
    <InterviewContext.Provider
      value={{
        authState,
        authMessage,
        relogin,
        interviewer,
        isAdmin,
        student,
        setStudent,
        questions,
        answers,
        saveAnswer,
        visibleQuestions,
        loading,
        setLoading,
        notification,
        showNotification,
        resetInterview,
        logout
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
