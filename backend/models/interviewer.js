// backend/models/interviewer.js
const db = require("../config/db");

/**
 * โมเดลสำหรับข้อมูลผู้สัมภาษณ์
 */
class Interviewer {
  /**
   * ดึงข้อมูลผู้สัมภาษณ์ทั้งหมด
   * @returns {Promise<Array>} - ข้อมูลผู้สัมภาษณ์ทั้งหมด
   */
  static async findAll() {
    try {
      const result = await db.query(
        "SELECT * FROM interviewer ORDER BY staff_id"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all interviewers: ${error.message}`);
    }
  }

  /**
   * ค้นหาผู้สัมภาษณ์ตาม ID
   * @param {number} id - รหัสผู้สัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลผู้สัมภาษณ์
   */
  static async findById(id) {
    try {
      const result = await db.query(
        "SELECT * FROM interviewer WHERE staff_id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching interviewer by ID: ${error.message}`);
    }
  }

  /**
   * เพิ่มข้อมูลผู้สัมภาษณ์ใหม่
   * @param {Object} data - ข้อมูลผู้สัมภาษณ์
   * @param {number} data.staff_id - รหัสผู้สัมภาษณ์
   * @param {string} data.staff_name - ชื่อผู้สัมภาษณ์
   * @param {string} data.staff_faculty - คณะของผู้สัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลผู้สัมภาษณ์ที่เพิ่ม
   */
  static async create(data) {
    try {
      const { staff_id, staff_name, staff_faculty } = data;

      const result = await db.query(
        "INSERT INTO interviewer (staff_id, staff_name, staff_faculty) VALUES ($1, $2, $3) RETURNING *",
        [staff_id, staff_name, staff_faculty]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating interviewer: ${error.message}`);
    }
  }

  /**
   * อัปเดตข้อมูลผู้สัมภาษณ์
   * @param {number} id - รหัสผู้สัมภาษณ์
   * @param {Object} data - ข้อมูลที่จะอัปเดต
   * @param {string} data.staff_name - ชื่อผู้สัมภาษณ์
   * @param {string} data.staff_faculty - คณะของผู้สัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลผู้สัมภาษณ์ที่อัปเดต
   */
  static async update(id, data) {
    try {
      const { staff_name, staff_faculty } = data;

      const result = await db.query(
        "UPDATE interviewer SET staff_name = $1, staff_faculty = $2 WHERE staff_id = $3 RETURNING *",
        [staff_name, staff_faculty, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating interviewer: ${error.message}`);
    }
  }

  /**
   * ลบข้อมูลผู้สัมภาษณ์
   * @param {number} id - รหัสผู้สัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลผู้สัมภาษณ์ที่ลบ
   */
  static async delete(id) {
    try {
      // ตรวจสอบว่ามีการสัมภาษณ์ที่เชื่อมโยงกับผู้สัมภาษณ์นี้หรือไม่
      const checkResult = await db.query(
        "SELECT COUNT(*) FROM interview WHERE interviewer_id = $1",
        [id]
      );

      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error("Cannot delete interviewer with associated interviews");
      }

      const result = await db.query(
        "DELETE FROM interviewer WHERE staff_id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting interviewer: ${error.message}`);
    }
  }
}

module.exports = Interviewer;
