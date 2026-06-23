// frontend/src/hooks/useInterview.js
"use client";

import { useContext } from "react";
import { InterviewContext } from "@/contexts/InterviewContext.jsx";
import { interviewService } from "@/services/interviewService";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const {
    interviewer,
    student,
    answers,
    questions,
    visibleQuestions,
    setLoading,
    showNotification,
    resetInterview,
  } = context;

  /**
   * บันทึกการสัมภาษณ์
   * @returns {Promise<boolean>} สถานะการบันทึก
   */
  const submitInterview = async () => {
    // ตรวจสอบข้อมูลจำเป็น
    if (!interviewer) {
      showNotification("กรุณาเลือกผู้สัมภาษณ์", "error");
      return false;
    }

    if (!student) {
      showNotification("กรุณาเลือกนักศึกษา", "error");
      return false;
    }

    // ตรวจสอบคำตอบ — ข้อที่มี "(ถ้ามี)" ในชื่อไม่บังคับตอบ
    const requiredQuestions = visibleQuestions.filter(
      (q) => !q.question_text?.includes('(ถ้ามี)')
    );
    const unansweredQuestions = requiredQuestions.filter(
      (q) => !answers[q.question_id]
    );

    if (unansweredQuestions.length > 0) {
      showNotification(
        `กรุณาตอบคำถามที่จำเป็น (ยังเหลืออีก ${unansweredQuestions.length} ข้อ)`,
        "warning"
      );
      return false;
    }

    try {
      setLoading(true);

      // แปลงคำตอบเป็นรูปแบบที่ API ต้องการ
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId),
        answer_text: answers[questionId],
      }));

      // สร้างข้อมูลการสัมภาษณ์
      const interviewData = {
        student_id: student.student_id,
        interviewer_id: interviewer.staff_id,
        answers: answersArray,
      };

      // บันทึกข้อมูลการสัมภาษณ์
      const response = await interviewService.createInterview(interviewData);

      if (response.success) {
        showNotification("บันทึกข้อมูลการสัมภาษณ์เรียบร้อยแล้ว", "success");
        resetInterview();
        return true;
      } else {
        showNotification(
          response.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          "error"
        );
        return false;
      }
    } catch (error) {
      showNotification(
        "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message,
        "error"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ดาวน์โหลดข้อมูลการสัมภาษณ์เป็น Excel
   */
  const downloadExcelReport = async () => {
    try {
      setLoading(true);

      // ดึงข้อมูล Excel
      const blob = await interviewService.exportInterviewsToExcel();

      // สร้าง URL สำหรับดาวน์โหลด
      const url = window.URL.createObjectURL(blob);

      // สร้างลิงก์ดาวน์โหลด
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview_data_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();

      // ลบลิงก์
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification("ดาวน์โหลดรายงาน Excel เรียบร้อยแล้ว", "success");
    } catch (error) {
      showNotification(
        "เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน: " + error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    ...context,
    submitInterview,
    downloadExcelReport,
  };
};
