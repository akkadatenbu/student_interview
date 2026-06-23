// backend/models/question.js
const db = require("../config/db");

/**
 * โมเดลสำหรับข้อมูลคำถาม
 */
class Question {
  /**
   * ดึงข้อมูลคำถามทั้งหมด
   * @returns {Promise<Array>} - ข้อมูลคำถามทั้งหมด
   */
  static async findAll() {
    try {
      const result = await db.query(
        "SELECT * FROM question ORDER BY question_id"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all questions: ${error.message}`);
    }
  }

  /**
   * ค้นหาคำถามตาม ID
   * @param {number} id - รหัสคำถาม
   * @returns {Promise<Object>} - ข้อมูลคำถาม
   */
  static async findById(id) {
    try {
      const result = await db.query(
        "SELECT * FROM question WHERE question_id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching question by ID: ${error.message}`);
    }
  }

  /**
   * เพิ่มข้อมูลคำถามใหม่
   * @param {Object} data - ข้อมูลคำถาม
   * @param {number} data.question_id - รหัสคำถาม
   * @param {string} data.question_text - ข้อความคำถาม
   * @param {string} data.question_type - รูปแบบคำถาม
   * @param {string} data.answer_options - ตัวเลือกคำตอบ
   * @param {string} data.condition_logic - เงื่อนไขการแสดงคำถาม
   * @param {string} data.condition_display - คำอธิบายเงื่อนไข
   * @returns {Promise<Object>} - ข้อมูลคำถามที่เพิ่ม
   */
  static async create(data) {
    try {
      const {
        question_id,
        question_text,
        question_type,
        answer_options,
        condition_logic,
        condition_display,
      } = data;

      const result = await db.query(
        `INSERT INTO question 
          (question_id, question_text, question_type, answer_options, condition_logic, condition_display) 
         VALUES 
          ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          question_id,
          question_text,
          question_type,
          answer_options,
          condition_logic,
          condition_display,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating question: ${error.message}`);
    }
  }

  /**
   * อัปเดตข้อมูลคำถาม
   * @param {number} id - รหัสคำถาม
   * @param {Object} data - ข้อมูลที่จะอัปเดต
   * @param {string} data.question_text - ข้อความคำถาม
   * @param {string} data.question_type - รูปแบบคำถาม
   * @param {string} data.answer_options - ตัวเลือกคำตอบ
   * @param {string} data.condition_logic - เงื่อนไขการแสดงคำถาม
   * @param {string} data.condition_display - คำอธิบายเงื่อนไข
   * @returns {Promise<Object>} - ข้อมูลคำถามที่อัปเดต
   */
  static async update(id, data) {
    try {
      const {
        question_text,
        question_type,
        answer_options,
        condition_logic,
        condition_display,
      } = data;

      const result = await db.query(
        `UPDATE question 
         SET question_text = $1, question_type = $2, answer_options = $3, 
             condition_logic = $4, condition_display = $5 
         WHERE question_id = $6 
         RETURNING *`,
        [
          question_text,
          question_type,
          answer_options,
          condition_logic,
          condition_display,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating question: ${error.message}`);
    }
  }

  /**
   * ลบข้อมูลคำถาม
   * @param {number} id - รหัสคำถาม
   * @returns {Promise<Object>} - ข้อมูลคำถามที่ลบ
   */
  static async delete(id) {
    try {
      // ตรวจสอบว่ามีคำตอบที่เชื่อมโยงกับคำถามนี้หรือไม่
      const checkAnswers = await db.query(
        "SELECT COUNT(*) FROM interview_answer WHERE question_id = $1",
        [id]
      );

      if (parseInt(checkAnswers.rows[0].count) > 0) {
        throw new Error("Cannot delete question with associated answers");
      }

      const result = await db.query(
        "DELETE FROM question WHERE question_id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting question: ${error.message}`);
    }
  }
}

module.exports = Question;
