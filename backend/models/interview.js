// backend/models/interview.js
const db = require("../config/db");

/**
 * โมเดลสำหรับข้อมูลการสัมภาษณ์
 */
class Interview {
  /**
   * ดึงข้อมูลการสัมภาษณ์ทั้งหมด
   * @returns {Promise<Array>} - ข้อมูลการสัมภาษณ์ทั้งหมด
   */
  static async findAll() {
    try {
      const result = await db.query(`
        SELECT 
          i.interview_id, 
          i.student_id, 
          s.student_name, 
          s.program, 
          s.faculty,
          i.interviewer_id, 
          staff.staff_name AS interviewer_name,
          i.interview_date, 
          i.completed
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        JOIN 
          interviewer staff ON i.interviewer_id = staff.staff_id
        ORDER BY 
          i.interview_date DESC
      `);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all interviews: ${error.message}`);
    }
  }

  /**
   * ค้นหาการสัมภาษณ์ตาม ID
   * @param {number} id - รหัสการสัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลการสัมภาษณ์พร้อมคำตอบ
   */
  static async findById(id) {
    try {
      // ข้อมูลการสัมภาษณ์
      const interviewResult = await db.query(
        `
        SELECT 
          i.interview_id, 
          i.student_id, 
          s.student_name, 
          s.program, 
          s.faculty,
          s.campus,
          s.level,
          s.phone,
          s.scholarship,
          s.graduated_school,
          s.hometown,
          i.interviewer_id, 
          staff.staff_name AS interviewer_name,
          staff.staff_faculty AS interviewer_faculty,
          i.interview_date, 
          i.completed
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        JOIN 
          interviewer staff ON i.interviewer_id = staff.staff_id
        WHERE 
          i.interview_id = $1
      `,
        [id]
      );

      if (interviewResult.rows.length === 0) {
        return null;
      }

      // ข้อมูลคำตอบ
      const answersResult = await db.query(
        `
        SELECT 
          a.answer_id,
          a.question_id,
          q.question_text,
          q.question_type,
          q.answer_options,
          a.answer_text
        FROM 
          interview_answer a
        JOIN 
          question q ON a.question_id = q.question_id
        WHERE 
          a.interview_id = $1
        ORDER BY 
          q.question_id
      `,
        [id]
      );

      // รวมข้อมูล
      const interview = interviewResult.rows[0];
      interview.answers = answersResult.rows;

      return interview;
    } catch (error) {
      throw new Error(`Error fetching interview by ID: ${error.message}`);
    }
  }

  /**
   * ค้นหาการสัมภาษณ์ตามรหัสนักศึกษา
   * @param {number} studentId - รหัสนักศึกษา
   * @returns {Promise<Object>} - ข้อมูลการสัมภาษณ์พร้อมคำตอบ
   */
  static async findByStudentId(studentId) {
    try {
      // ข้อมูลการสัมภาษณ์
      const interviewResult = await db.query(
        `
        SELECT 
          i.interview_id, 
          i.student_id, 
          s.student_name, 
          s.program, 
          s.faculty,
          s.campus,
          s.level,
          s.phone,
          s.scholarship,
          s.graduated_school,
          s.hometown,
          i.interviewer_id, 
          staff.staff_name AS interviewer_name,
          staff.staff_faculty AS interviewer_faculty,
          i.interview_date, 
          i.completed
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        JOIN 
          interviewer staff ON i.interviewer_id = staff.staff_id
        WHERE 
          i.student_id = $1
      `,
        [studentId]
      );

      if (interviewResult.rows.length === 0) {
        return null;
      }

      const interviewId = interviewResult.rows[0].interview_id;

      // ข้อมูลคำตอบ
      const answersResult = await db.query(
        `
        SELECT 
          a.answer_id,
          a.question_id,
          q.question_text,
          q.question_type,
          q.answer_options,
          a.answer_text
        FROM 
          interview_answer a
        JOIN 
          question q ON a.question_id = q.question_id
        WHERE 
          a.interview_id = $1
        ORDER BY 
          q.question_id
      `,
        [interviewId]
      );

      // รวมข้อมูล
      const interview = interviewResult.rows[0];
      interview.answers = answersResult.rows;

      return interview;
    } catch (error) {
      throw new Error(
        `Error fetching interview by student ID: ${error.message}`
      );
    }
  }

  /**
   * สร้างการสัมภาษณ์ใหม่พร้อมคำตอบ
   * @param {Object} data - ข้อมูลการสัมภาษณ์
   * @param {number} data.student_id - รหัสนักศึกษา
   * @param {number} data.interviewer_id - รหัสผู้สัมภาษณ์
   * @param {Array} data.answers - ข้อมูลคำตอบ
   * @returns {Promise<Object>} - ข้อมูลการสัมภาษณ์ที่สร้าง
   */
  static async create(data) {
    // ใช้ transaction
    const client = await db.pool.connect();

    try {
      const { student_id, interviewer_id, answers } = data;

      // Start transaction
      await client.query("BEGIN");

      // ตรวจสอบว่านักศึกษาเคยถูกสัมภาษณ์แล้วหรือไม่
      const checkExisting = await client.query(
        "SELECT interview_id FROM interview WHERE student_id = $1",
        [student_id]
      );

      if (checkExisting.rows.length > 0) {
        await client.query("ROLLBACK");
        throw new Error("Student has already been interviewed");
      }

      // สร้างการสัมภาษณ์
      const interviewResult = await client.query(
        "INSERT INTO interview (student_id, interviewer_id, completed) VALUES ($1, $2, $3) RETURNING *",
        [student_id, interviewer_id, true]
      );

      const interview_id = interviewResult.rows[0].interview_id;

      // บันทึกคำตอบ
      for (const answer of answers) {
        if (!answer.question_id || answer.answer_text === undefined) {
          await client.query("ROLLBACK");
          throw new Error(
            "Invalid answer data (requires question_id and answer_text)"
          );
        }

        await client.query(
          "INSERT INTO interview_answer (interview_id, question_id, answer_text) VALUES ($1, $2, $3)",
          [interview_id, answer.question_id, answer.answer_text]
        );
      }

      // Commit transaction
      await client.query("COMMIT");

      // ดึงข้อมูลการสัมภาษณ์ที่สร้างพร้อมข้อมูลเพิ่มเติม
      return await Interview.findById(interview_id);
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await client.query("ROLLBACK");
      throw new Error(`Error creating interview: ${error.message}`);
    } finally {
      // Release client
      client.release();
    }
  }

  /**
   * อัปเดตคำตอบในการสัมภาษณ์
   * @param {number} id - รหัสการสัมภาษณ์
   * @param {Object} data - ข้อมูลที่จะอัปเดต
   * @param {Array} data.answers - ข้อมูลคำตอบที่จะอัปเดต
   * @returns {Promise<Array>} - ข้อมูลคำตอบที่อัปเดต
   */
  static async updateAnswers(id, data) {
    // ใช้ transaction
    const client = await db.pool.connect();

    try {
      const { answers } = data;

      // Start transaction
      await client.query("BEGIN");

      // ตรวจสอบว่ามีการสัมภาษณ์อยู่จริงหรือไม่
      const checkInterview = await client.query(
        "SELECT interview_id FROM interview WHERE interview_id = $1",
        [id]
      );

      if (checkInterview.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new Error("Interview not found");
      }

      // อัปเดตคำตอบแต่ละข้อ
      for (const answer of answers) {
        if (!answer.question_id || answer.answer_text === undefined) {
          await client.query("ROLLBACK");
          throw new Error(
            "Invalid answer data (requires question_id and answer_text)"
          );
        }

        // ตรวจสอบว่ามีคำตอบอยู่แล้วหรือไม่
        const checkAnswer = await client.query(
          "SELECT answer_id FROM interview_answer WHERE interview_id = $1 AND question_id = $2",
          [id, answer.question_id]
        );

        if (checkAnswer.rows.length > 0) {
          // อัปเดตคำตอบที่มีอยู่
          await client.query(
            "UPDATE interview_answer SET answer_text = $1 WHERE interview_id = $2 AND question_id = $3",
            [answer.answer_text, id, answer.question_id]
          );
        } else {
          // เพิ่มคำตอบใหม่
          await client.query(
            "INSERT INTO interview_answer (interview_id, question_id, answer_text) VALUES ($1, $2, $3)",
            [id, answer.question_id, answer.answer_text]
          );
        }
      }

      // Commit transaction
      await client.query("COMMIT");

      // ดึงข้อมูลคำตอบที่อัปเดต
      const updatedAnswers = await db.query(
        `
        SELECT 
          a.answer_id,
          a.question_id,
          q.question_text,
          a.answer_text
        FROM 
          interview_answer a
        JOIN 
          question q ON a.question_id = q.question_id
        WHERE 
          a.interview_id = $1
        ORDER BY 
          q.question_id
      `,
        [id]
      );

      return updatedAnswers.rows;
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await client.query("ROLLBACK");
      throw new Error(`Error updating interview answers: ${error.message}`);
    } finally {
      // Release client
      client.release();
    }
  }

  /**
   * ลบข้อมูลการสัมภาษณ์
   * @param {number} id - รหัสการสัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลการสัมภาษณ์ที่ลบ
   */
  static async delete(id) {
    // ใช้ transaction
    const client = await db.pool.connect();

    try {
      // Start transaction
      await client.query("BEGIN");

      // ลบคำตอบก่อน
      await client.query(
        "DELETE FROM interview_answer WHERE interview_id = $1",
        [id]
      );

      // ลบการสัมภาษณ์
      const result = await client.query(
        "DELETE FROM interview WHERE interview_id = $1 RETURNING *",
        [id]
      );

      // Commit transaction
      await client.query("COMMIT");

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      // Rollback transaction ในกรณีที่เกิดข้อผิดพลาด
      await client.query("ROLLBACK");
      throw new Error(`Error deleting interview: ${error.message}`);
    } finally {
      // Release client
      client.release();
    }
  }

  /**
   * ดึงข้อมูลสำหรับส่งออกเป็น Excel
   * @returns {Promise<Object>} - ข้อมูลสำหรับส่งออก
   */
  static async getDataForExport() {
    try {
      // ข้อมูลการสัมภาษณ์
      const interviews = await db.query(`
        SELECT 
          i.interview_id, 
          i.student_id, 
          s.student_name, 
          s.program, 
          s.faculty,
          s.campus,
          s.level,
          s.phone,
          s.scholarship,
          s.graduated_school,
          s.hometown,
          i.interviewer_id, 
          staff.staff_name AS interviewer_name,
          i.interview_date
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        JOIN 
          interviewer staff ON i.interviewer_id = staff.staff_id
        ORDER BY 
          i.interview_date DESC
      `);

      // ข้อมูลคำถาม
      const questions = await db.query(
        "SELECT * FROM question ORDER BY question_id"
      );

      // ข้อมูลคำตอบทั้งหมด
      const allAnswers = await db.query(`
        SELECT 
          ia.interview_id,
          ia.question_id,
          ia.answer_text
        FROM 
          interview_answer ia
        ORDER BY 
          ia.interview_id, ia.question_id
      `);

      return {
        interviews: interviews.rows,
        questions: questions.rows,
        answers: allAnswers.rows,
      };
    } catch (error) {
      throw new Error(`Error getting data for export: ${error.message}`);
    }
  }
}

module.exports = Interview;
