// backend/utils/excelExport.js
const excel = require("exceljs");
const path = require("path");
const fs = require("fs");

/**
 * ฟังก์ชันสำหรับส่งออกข้อมูลการสัมภาษณ์เป็นไฟล์ Excel
 */
class ExcelExport {
  /**
   * สร้างไฟล์ Excel จากข้อมูลการสัมภาษณ์
   * @param {Object} data - ข้อมูลที่จะส่งออก
   * @param {Array} data.interviews - ข้อมูลการสัมภาษณ์
   * @param {Array} data.questions - ข้อมูลคำถาม
   * @param {Array} data.answers - ข้อมูลคำตอบ
   * @returns {Promise<string>} - พาธของไฟล์ Excel ที่สร้าง
   */
  static async generateExcel(data) {
    try {
      const { interviews, questions, answers } = data;

      // สร้าง workbook ใหม่
      const workbook = new excel.Workbook();

      // เพิ่ม worksheet สำหรับสรุปการสัมภาษณ์
      const summarySheet = workbook.addWorksheet("รายงานสรุป");

      // กำหนดหัวคอลัมน์สำหรับ summary sheet
      summarySheet.columns = [
        { header: "รหัสการสัมภาษณ์", key: "interview_id", width: 15 },
        { header: "รหัสนักศึกษา", key: "student_id", width: 15 },
        { header: "ชื่อนักศึกษา", key: "student_name", width: 30 },
        { header: "หลักสูตร", key: "program", width: 30 },
        { header: "คณะ", key: "faculty", width: 20 },
        { header: "วิทยาเขต", key: "campus", width: 15 },
        { header: "ระดับ", key: "level", width: 10 },
        { header: "ผู้สัมภาษณ์", key: "interviewer_name", width: 30 },
        { header: "วันที่สัมภาษณ์", key: "interview_date", width: 20 },
      ];

      // เพิ่มข้อมูลลงใน summary sheet
      summarySheet.addRows(
        interviews.map((interview) => ({
          ...interview,
          interview_date: new Date(interview.interview_date).toLocaleString(
            "th-TH"
          ),
        }))
      );

      // จัดรูปแบบหัวคอลัมน์
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // เพิ่ม worksheet สำหรับรายละเอียดคำตอบ
      const detailSheet = workbook.addWorksheet("รายละเอียดคำตอบ");

      // สร้างหัวคอลัมน์สำหรับ detail sheet
      const detailColumns = [
        { header: "รหัสการสัมภาษณ์", key: "interview_id", width: 15 },
        { header: "รหัสนักศึกษา", key: "student_id", width: 15 },
        { header: "ชื่อนักศึกษา", key: "student_name", width: 30 },
        { header: "ผู้สัมภาษณ์", key: "interviewer_name", width: 30 },
        { header: "วันที่สัมภาษณ์", key: "interview_date", width: 20 },
      ];

      // เพิ่มคอลัมน์สำหรับแต่ละคำถาม
      questions.forEach((question) => {
        detailColumns.push({
          header: `${question.question_id}. ${question.question_text}`,
          key: `q${question.question_id}`,
          width: 30,
        });
      });

      detailSheet.columns = detailColumns;

      // ประมวลผลข้อมูลสำหรับ detail sheet
      const detailRows = [];

      // วนลูปสำหรับแต่ละการสัมภาษณ์
      for (const interview of interviews) {
        const row = {
          interview_id: interview.interview_id,
          student_id: interview.student_id,
          student_name: interview.student_name,
          interviewer_name: interview.interviewer_name,
          interview_date: new Date(interview.interview_date).toLocaleString(
            "th-TH"
          ),
        };

        // ค้นหาคำตอบสำหรับการสัมภาษณ์นี้
        const interviewAnswers = answers.filter(
          (a) => a.interview_id === interview.interview_id
        );

        // เพิ่มคำตอบลงในแถว
        for (const answer of interviewAnswers) {
          row[`q${answer.question_id}`] = answer.answer_text;
        }

        detailRows.push(row);
      }

      // เพิ่มข้อมูลลงใน detail sheet
      detailSheet.addRows(detailRows);

      // จัดรูปแบบหัวคอลัมน์
      detailSheet.getRow(1).font = { bold: true };
      detailSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // ตั้งค่า auto-filter ทั้งสอง sheet
      summarySheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: summarySheet.columns.length },
      };

      detailSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: 5 },
      };

      // สร้างโฟลเดอร์ uploads หากยังไม่มี
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // กำหนดพาธของไฟล์ Excel
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\..+/, "");
      const filePath = path.join(
        uploadsDir,
        `interview_data_${timestamp}.xlsx`
      );

      // เขียนไฟล์ Excel
      await workbook.xlsx.writeFile(filePath);

      return filePath;
    } catch (error) {
      throw new Error(`Error generating Excel file: ${error.message}`);
    }
  }

  /**
   * ลบไฟล์หลังจากส่งออก
   * @param {string} filePath - พาธของไฟล์ที่จะลบ
   * @returns {Promise<void>}
   */
  static async deleteFile(filePath) {
    try {
      // ตรวจสอบว่ามีไฟล์อยู่หรือไม่
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }
  }
}

module.exports = ExcelExport;
