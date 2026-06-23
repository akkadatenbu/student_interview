// backend/utils/dbHelpers.js
const db = require("../config/db");

/**
 * ฟังก์ชันช่วยเหลือสำหรับการจัดการฐานข้อมูล
 */
class DbHelpers {
  /**
   * ดึงข้อมูลสถิติการสัมภาษณ์
   * @returns {Promise<Object>} - ข้อมูลสถิติการสัมภาษณ์
   */
  static async getInterviewStatistics() {
    try {
      // จำนวนนักศึกษาทั้งหมด
      const totalStudentsResult = await db.query(
        "SELECT COUNT(*) FROM student"
      );
      const totalStudents = parseInt(totalStudentsResult.rows[0].count);

      // จำนวนนักศึกษาที่ได้รับการสัมภาษณ์แล้ว
      const interviewedStudentsResult = await db.query(
        "SELECT COUNT(*) FROM interview"
      );
      const interviewedStudents = parseInt(
        interviewedStudentsResult.rows[0].count
      );

      // จำนวนนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์
      const notInterviewedStudents = totalStudents - interviewedStudents;

      // อัตราส่วนการสัมภาษณ์
      const interviewRate =
        totalStudents > 0
          ? ((interviewedStudents / totalStudents) * 100).toFixed(2)
          : 0;

      // จำนวนการสัมภาษณ์ต่อคณะ
      const interviewsByFacultyResult = await db.query(`
        SELECT 
          s.faculty,
          COUNT(*) AS count
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        GROUP BY 
          s.faculty
        ORDER BY 
          count DESC
      `);

      // จำนวนการสัมภาษณ์ต่อหลักสูตร
      const interviewsByProgramResult = await db.query(`
        SELECT 
          s.program,
          COUNT(*) AS count
        FROM 
          interview i
        JOIN 
          student s ON i.student_id = s.student_id
        GROUP BY 
          s.program
        ORDER BY 
          count DESC
      `);

      // จำนวนการสัมภาษณ์ต่อวัน
      const interviewsByDateResult = await db.query(`
        SELECT 
          DATE(interview_date) AS date,
          COUNT(*) AS count
        FROM 
          interview
        GROUP BY 
          date
        ORDER BY 
          date DESC
      `);

      return {
        totalStudents,
        interviewedStudents,
        notInterviewedStudents,
        interviewRate,
        interviewsByFaculty: interviewsByFacultyResult.rows,
        interviewsByProgram: interviewsByProgramResult.rows,
        interviewsByDate: interviewsByDateResult.rows,
      };
    } catch (error) {
      throw new Error(`Error getting interview statistics: ${error.message}`);
    }
  }

  /**
   * ดึงข้อมูลทั่วไปของระบบ
   * @returns {Promise<Object>} - ข้อมูลทั่วไปของระบบ
   */
  static async getSystemInfo() {
    try {
      // จำนวนผู้สัมภาษณ์
      const interviewersResult = await db.query(
        "SELECT COUNT(*) FROM interviewer"
      );
      const totalInterviewers = parseInt(interviewersResult.rows[0].count);

      // จำนวนคำถาม
      const questionsResult = await db.query("SELECT COUNT(*) FROM question");
      const totalQuestions = parseInt(questionsResult.rows[0].count);

      // จำนวนคำตอบทั้งหมด
      const answersResult = await db.query(
        "SELECT COUNT(*) FROM interview_answer"
      );
      const totalAnswers = parseInt(answersResult.rows[0].count);

      // จำนวนคณะทั้งหมด
      const facultiesResult = await db.query(
        "SELECT COUNT(DISTINCT faculty) FROM student"
      );
      const totalFaculties = parseInt(facultiesResult.rows[0].count);

      // จำนวนหลักสูตรทั้งหมด
      const programsResult = await db.query(
        "SELECT COUNT(DISTINCT program) FROM student"
      );
      const totalPrograms = parseInt(programsResult.rows[0].count);

      return {
        totalInterviewers,
        totalQuestions,
        totalAnswers,
        totalFaculties,
        totalPrograms,
      };
    } catch (error) {
      throw new Error(`Error getting system info: ${error.message}`);
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล
   * @returns {Promise<Object>} - สถานะการเชื่อมต่อฐานข้อมูล
   */
  static async checkDatabaseConnection() {
    try {
      // ทดสอบการเชื่อมต่อด้วยการคิวรี่ง่ายๆ
      const result = await db.query("SELECT NOW() as time");

      return {
        connected: true,
        timestamp: result.rows[0].time,
        message: "Database connection successful",
      };
    } catch (error) {
      return {
        connected: false,
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  /**
   * สร้างการสำรองข้อมูลในรูปแบบ SQL
   * @param {string} outputPath - พาธของไฟล์ SQL ที่จะสร้าง
   * @returns {Promise<string>} - พาธของไฟล์ SQL ที่สร้าง
   */
  static async backupDatabase(outputPath) {
    // หมายเหตุ: ฟังก์ชันนี้จำเป็นต้องใช้ Child Process หรือไลบรารีเฉพาะสำหรับการสำรองข้อมูล PostgreSQL
    // ในที่นี้เป็นเพียงโครงสร้างของฟังก์ชัน
    throw new Error("Database backup function is not implemented yet");
  }
}

module.exports = DbHelpers;
