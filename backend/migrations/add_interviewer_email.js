// backend/migrations/add_interviewer_email.js
const db = require('../config/db');

// เพิ่มคอลัมน์ email ให้ตาราง interviewer สำหรับผูกกับ NBU SSO Login
// (ใช้ email จับคู่ identity ที่ verify แล้วจาก JWT กับ record ผู้สัมภาษณ์ที่มีอยู่)
async function addInterviewerEmail() {
  try {
    const check = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'interviewer' AND column_name = 'email'
    `);

    if (check.rows.length > 0) {
      console.log('interviewer.email column already exists, skipping.');
      return;
    }

    await db.query('BEGIN');
    await db.query(`ALTER TABLE interviewer ADD COLUMN email VARCHAR(255)`);
    await db.query(`CREATE UNIQUE INDEX idx_interviewer_email ON interviewer(email) WHERE email IS NOT NULL`);
    await db.query('COMMIT');
    console.log('Added interviewer.email column.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = addInterviewerEmail;
