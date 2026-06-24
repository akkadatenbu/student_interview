// frontend/src/services/interviewService.js
import { api } from "./api";

export const interviewService = {
  /**
   * ดึงข้อมูลการสัมภาษณ์ทั้งหมด
   * @returns {Promise} - ข้อมูลการสัมภาษณ์
   */
  async getAllInterviews() {
    return api.get("interviews");
  },

  /**
   * ดึงข้อมูลการสัมภาษณ์ตาม ID
   * @param {number} id - รหัสการสัมภาษณ์
   * @returns {Promise} - ข้อมูลการสัมภาษณ์
   */
  async getInterviewById(id) {
    return api.get(`interviews/${id}`);
  },

  /**
   * ดึงข้อมูลการสัมภาษณ์ตามรหัสนักศึกษา
   * @param {number} studentId - รหัสนักศึกษา
   * @returns {Promise} - ข้อมูลการสัมภาษณ์
   */
  async getInterviewByStudentId(studentId) {
    return api.get(`interviews/student/${studentId}`);
  },

  /**
   * สร้างการสัมภาษณ์ใหม่
   * @param {object} interviewData - ข้อมูลการสัมภาษณ์
   * @returns {Promise} - ข้อมูลการสัมภาษณ์ที่สร้าง
   */
  async createInterview(interviewData) {
    return api.post("interviews", interviewData);
  },

  /**
   * อัปเดตคำตอบในการสัมภาษณ์
   * @param {number} id - รหัสการสัมภาษณ์
   * @param {object} answersData - ข้อมูลคำตอบที่จะอัปเดต
   * @returns {Promise} - ข้อมูลคำตอบที่อัปเดต
   */
  async updateInterviewAnswers(id, answersData) {
    return api.put(`interviews/${id}`, answersData);
  },

  /**
   * ส่งออกข้อมูลการสัมภาษณ์เป็น Excel
   * @returns {Promise} - Blob ไฟล์ Excel
   */
  async exportInterviewsToExcel(academicYear = null) {
    const query = academicYear ? `?academic_year=${academicYear}` : '';
    return api.downloadFile(`interviews/export${query}`);
  },
};
