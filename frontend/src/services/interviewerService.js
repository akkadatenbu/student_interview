// frontend/src/services/interviewerService.js
import { api } from "./api";

export const interviewerService = {
  /**
   * ดึงข้อมูลผู้สัมภาษณ์ทั้งหมด
   * @returns {Promise} - ข้อมูลผู้สัมภาษณ์
   */
  async getAllInterviewers() {
    return api.get("interviewers");
  },

  /**
   * ดึงข้อมูลผู้สัมภาษณ์ตาม ID
   * @param {number} id - รหัสผู้สัมภาษณ์
   * @returns {Promise} - ข้อมูลผู้สัมภาษณ์
   */
  async getInterviewerById(id) {
    return api.get(`interviewers/${id}`);
  },
};
