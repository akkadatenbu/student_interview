// backend/migrations/fix_interviewer_email_unique.js
// แก้ partial unique index (WHERE email IS NOT NULL) เป็น unique constraint ปกติ
// เหตุผล: ON CONFLICT (email) ใน middleware/auth.js ไม่สามารถ infer partial index ได้
//         (ต้องระบุ WHERE predicate ให้ตรงกันเป๊ะ) — unique constraint ปกติของ Postgres
//         อนุญาตให้มีหลาย NULL อยู่แล้วโดยธรรมชาติ จึงไม่จำเป็นต้องใช้ partial index เลย
const db = require('../config/db');

async function fixInterviewerEmailUnique() {
  try {
    const check = await db.query(`
      SELECT 1 FROM pg_constraint WHERE conname = 'interviewer_email_unique'
    `);

    if (check.rows.length > 0) {
      console.log('interviewer_email_unique constraint already exists, skipping.');
      return;
    }

    await db.query('BEGIN');
    await db.query(`DROP INDEX IF EXISTS idx_interviewer_email`);
    await db.query(`ALTER TABLE interviewer ADD CONSTRAINT interviewer_email_unique UNIQUE (email)`);
    await db.query('COMMIT');
    console.log('Fixed interviewer.email to use a proper UNIQUE constraint.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = fixInterviewerEmailUnique;
