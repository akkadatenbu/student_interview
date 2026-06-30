// backend/migrations/add_interviewer_staff_id_seq.js
// สร้าง sequence สำหรับ auto-generate staff_id ให้ผู้สัมภาษณ์ที่ login ผ่าน NBU SSO ครั้งแรก
// (เริ่มที่เลขสูงๆ เพื่อไม่ชนกับ staff_id เดิมที่ import จาก CSV ด้วยมือ ซึ่งเป็นรหัสพนักงานจริง)
const db = require('../config/db');

async function addInterviewerStaffIdSeq() {
  try {
    const check = await db.query(`
      SELECT 1 FROM pg_sequences WHERE sequencename = 'interviewer_staff_id_seq'
    `);

    if (check.rows.length > 0) {
      console.log('interviewer_staff_id_seq already exists, skipping.');
      return;
    }

    await db.query('BEGIN');
    await db.query(`CREATE SEQUENCE interviewer_staff_id_seq START WITH 9000001`);
    // กันชนกับ staff_id เดิมที่อาจสูงเกิน 9000000 อยู่แล้ว (ไม่น่าเกิดแต่กันไว้)
    await db.query(`
      SELECT setval(
        'interviewer_staff_id_seq',
        GREATEST(9000001, (SELECT COALESCE(MAX(staff_id), 0) + 1 FROM interviewer)),
        false
      )
    `);
    await db.query('COMMIT');
    console.log('Created interviewer_staff_id_seq.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = addInterviewerStaffIdSeq;
