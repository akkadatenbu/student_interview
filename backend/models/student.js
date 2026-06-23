// backend/models/student.js
const db = require("../config/db");

/**
 * โมเดลสำหรับข้อมูลนักศึกษา
 */
class Student {
  /**
   * ดึงข้อมูลนักศึกษาทั้งหมดพร้อมสถานะการสัมภาษณ์
   * @returns {Promise<Array>} - ข้อมูลนักศึกษาทั้งหมด
   */
  static async findAll() {
    try {
      const result = await db.query(`
        SELECT 
          s.*, 
          CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
        FROM 
          student s
        LEFT JOIN 
          interview i ON s.student_id = i.student_id
        ORDER BY 
          s.student_id
      `);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all students: ${error.message}`);
    }
  }

  /**
   * ค้นหานักศึกษาตาม ID
   * @param {number} id - รหัสนักศึกษา
   * @returns {Promise<Object>} - ข้อมูลนักศึกษา
   */
  static async findById(id) {
    try {
      const result = await db.query(
        `
        SELECT 
          s.*, 
          CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
        FROM 
          student s
        LEFT JOIN 
          interview i ON s.student_id = i.student_id
        WHERE 
          s.student_id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching student by ID: ${error.message}`);
    }
  }

  /**
   * ค้นหานักศึกษาตามคณะ
   * @param {string} faculty - ชื่อคณะ
   * @returns {Promise<Array>} - ข้อมูลนักศึกษาตามคณะ
   */
  static async findByFaculty(faculty) {
    try {
      const result = await db.query(
        `
        SELECT 
          s.*, 
          CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
        FROM 
          student s
        LEFT JOIN 
          interview i ON s.student_id = i.student_id
        WHERE 
          s.faculty = $1
        ORDER BY 
          s.student_id
      `,
        [faculty]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching students by faculty: ${error.message}`);
    }
  }

  /**
   * ค้นหานักศึกษาตามหลักสูตร
   * @param {string} program - ชื่อหลักสูตร
   * @returns {Promise<Array>} - ข้อมูลนักศึกษาตามหลักสูตร
   */
  static async findByProgram(program) {
    try {
      const result = await db.query(
        `
        SELECT 
          s.*, 
          CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
        FROM 
          student s
        LEFT JOIN 
          interview i ON s.student_id = i.student_id
        WHERE 
          s.program = $1
        ORDER BY 
          s.student_id
      `,
        [program]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching students by program: ${error.message}`);
    }
  }

  /**
   * ค้นหานักศึกษาที่ยังไม่ได้รับการสัมภาษณ์
   * @returns {Promise<Array>} - ข้อมูลนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์
   */
  static async findNotInterviewed() {
    try {
      const result = await db.query(`
        SELECT 
          s.*
        FROM 
          student s
        LEFT JOIN 
          interview i ON s.student_id = i.student_id
        WHERE 
          i.student_id IS NULL
        ORDER BY 
          s.faculty, s.program, s.student_id
      `);

      return result.rows;
    } catch (error) {
      throw new Error(
        `Error fetching not interviewed students: ${error.message}`
      );
    }
  }

  /**
   * เพิ่มข้อมูลนักศึกษาใหม่
   * @param {Object} data - ข้อมูลนักศึกษา
   * @returns {Promise<Object>} - ข้อมูลนักศึกษาที่เพิ่ม
   */
  static async create(data) {
    try {
      const {
        student_id,
        student_name,
        program,
        faculty,
        campus,
        level,
        phone,
        scholarship,
        graduated_school,
        hometown,
      } = data;

      const result = await db.query(
        `INSERT INTO student 
          (student_id, student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          student_id,
          student_name,
          program,
          faculty,
          campus,
          level,
          phone,
          scholarship,
          graduated_school,
          hometown,
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }
  }

  /**
   * อัปเดตข้อมูลนักศึกษา
   * @param {number} id - รหัสนักศึกษา
   * @param {Object} data - ข้อมูลที่จะอัปเดต
   * @returns {Promise<Object>} - ข้อมูลนักศึกษาที่อัปเดต
   */
  static async update(id, data) {
    try {
      const {
        student_name,
        program,
        faculty,
        campus,
        level,
        phone,
        scholarship,
        graduated_school,
        hometown,
      } = data;

      const result = await db.query(
        `UPDATE student 
         SET student_name = $1, program = $2, faculty = $3, campus = $4, level = $5, 
             phone = $6, scholarship = $7, graduated_school = $8, hometown = $9
         WHERE student_id = $10 
         RETURNING *`,
        [
          student_name,
          program,
          faculty,
          campus,
          level,
          phone,
          scholarship,
          graduated_school,
          hometown,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating student: ${error.message}`);
    }
  }

  /**
   * ลบข้อมูลนักศึกษา
   * @param {number} id - รหัสนักศึกษา
   * @returns {Promise<Object>} - ข้อมูลนักศึกษาที่ลบ
   */
  static async delete(id) {
    try {
      // แบบ transaction จะดีกว่า แต่ตัวอย่างนี้ทำแบบธรรมดา
      // ลบข้อมูลการสัมภาษณ์ที่เกี่ยวข้อง
      await db.query(
        "DELETE FROM interview_answer WHERE interview_id IN (SELECT interview_id FROM interview WHERE student_id = $1)",
        [id]
      );
      await db.query("DELETE FROM interview WHERE student_id = $1", [id]);

      // ลบข้อมูลนักศึกษา
      const result = await db.query(
        "DELETE FROM student WHERE student_id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting student: ${error.message}`);
    }
  }

  /**
   * ดึงข้อมูลสรุปสถานะการสัมภาษณ์
   * @returns {Promise<Array>} - ข้อมูลสรุป
   */
  static async getInterviewStatusSummary() {
    try {
      const result = await db.query(`
        SELECT 
          faculty,
          program,
          COUNT(*) AS total_students,
          SUM(CASE WHEN interviewed THEN 1 ELSE 0 END) AS interviewed_count,
          COUNT(*) - SUM(CASE WHEN interviewed THEN 1 ELSE 0 END) AS not_interviewed_count
        FROM 
          (
            SELECT 
              s.*, 
              CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
            FROM 
              student s
            LEFT JOIN 
              interview i ON s.student_id = i.student_id
          ) AS subquery
        GROUP BY 
          faculty, program
        ORDER BY 
          faculty, program
      `);

      return result.rows;
    } catch (error) {
      throw new Error(
        `Error getting interview status summary: ${error.message}`
      );
    }
  }
}

module.exports = Student;
