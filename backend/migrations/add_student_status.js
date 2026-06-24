// backend/migrations/add_student_status.js
const db = require('../config/db');

async function addStudentStatus() {
  try {
    // ตรวจว่ามี column อยู่แล้วหรือยัง
    const check = await db.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'student' AND column_name = 'student_status'
    `);

    if (check.rows.length > 0) {
      console.log('student_status column already exists, skipping.');
      return;
    }

    await db.query('BEGIN');
    await db.query(`ALTER TABLE student ADD COLUMN student_status INTEGER NOT NULL DEFAULT 10`);
    await db.query(`UPDATE student SET student_status = 10 WHERE student_status IS NULL`);
    await db.query('COMMIT');
    console.log('Added student_status column and set all records to 10.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = addStudentStatus;
