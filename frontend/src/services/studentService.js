// frontend/src/services/studentService.js
import { api } from "./api";

export const studentService = {
  /**
   * ดึงข้อมูลนักศึกษาทั้งหมด
   * @returns {Promise} - ข้อมูลนักศึกษา
   */
  async getAllStudents() {
    return api.get("students");
  },

  /**
   * ดึงข้อมูลนักศึกษาตาม ID
   * @param {number} id - รหัสนักศึกษา
   * @returns {Promise} - ข้อมูลนักศึกษา
   */
  async getStudentById(id) {
    return api.get(`students/${id}`);
  },

  /**
   * ดึงข้อมูลนักศึกษาตามคณะ
   * @param {string} faculty - ชื่อคณะ
   * @returns {Promise} - ข้อมูลนักศึกษา
   */
  async getStudentsByFaculty(faculty) {
    return api.get(`students/faculty/${encodeURIComponent(faculty)}`);
  },

  /**
   * ดึงข้อมูลนักศึกษาตามหลักสูตร
   * @param {string} program - ชื่อหลักสูตร
   * @returns {Promise} - ข้อมูลนักศึกษา
   */
  async getStudentsByProgram(program) {
    return api.get(`students/program/${encodeURIComponent(program)}`);
  },

  /**
   * ดึงข้อมูลนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์
   * @returns {Promise} - ข้อมูลนักศึกษา
   */
  async getNotInterviewedStudents() {
    return api.get("students/not-interviewed");
  },

  /**
   * ดึงข้อมูลสรุปสถานะการสัมภาษณ์
   * @returns {Promise} - ข้อมูลสรุป
   */
  async getInterviewStatusSummary() {
    return api.get("students/summary");
  },
};
