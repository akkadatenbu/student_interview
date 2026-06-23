// frontend/src/services/questionService.js
import { api } from "./api";

export const questionService = {
  /**
   * ดึงข้อมูลคำถามทั้งหมด
   * @returns {Promise} - ข้อมูลคำถาม
   */
  async getAllQuestions() {
    return api.get("questions");
  },

  /**
   * ดึงข้อมูลคำถามตาม ID
   * @param {number} id - รหัสคำถาม
   * @returns {Promise} - ข้อมูลคำถาม
   */
  async getQuestionById(id) {
    return api.get(`questions/${id}`);
  },
};
