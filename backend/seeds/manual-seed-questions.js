const db = require("../config/db");

async function manualSeedQuestions() {
  try {
    console.log("Starting manual question seed...");

    // Clear existing data
    await db.query("DELETE FROM question");

    // Insert sample question data
    await db.query(`
      INSERT INTO question (question_id, question_text, question_type, answer_options, condition_logic, condition_display) VALUES
      (1, 'นักศึกษามีปัญหาด้านการเรียนหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL),
      (2, 'นักศึกษามีปัญหาด้านการเงินหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL),
      (3, 'นักศึกษามีปัญหาด้านที่พักอาศัยหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL),
      (4, 'นักศึกษามีปัญหาด้านสุขภาพหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL),
      (5, 'นักศึกษาคิดว่าตนเองมีความเครียดหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL),
      (6, 'นักศึกษามีความสนใจเข้าร่วมกิจกรรมของมหาวิทยาลัยหรือไม่?', 'radio', 'มี,ไม่มี', NULL, NULL);
      
      INSERT INTO question (question_id, question_text, question_type, answer_options, condition_logic, condition_display) VALUES
      (1.1, 'กรุณาระบุปัญหาด้านการเรียนที่พบ', 'text', NULL, '1:eq:มี', 'แสดงเมื่อตอบข้อ 1 ว่า "มี"'),
      (2.1, 'กรุณาระบุปัญหาด้านการเงินที่พบ', 'text', NULL, '2:eq:มี', 'แสดงเมื่อตอบข้อ 2 ว่า "มี"'),
      (3.1, 'กรุณาระบุปัญหาด้านที่พักอาศัยที่พบ', 'text', NULL, '3:eq:มี', 'แสดงเมื่อตอบข้อ 3 ว่า "มี"'),
      (4.1, 'กรุณาระบุปัญหาด้านสุขภาพที่พบ', 'textarea', NULL, '4:eq:มี', 'แสดงเมื่อตอบข้อ 4 ว่า "มี"');
    `);

    console.log("Manual question seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error in manual question seed:", error);
    process.exit(1);
  }
}

manualSeedQuestions();
