// backend/migrations/add_academic_year.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if column already exists
    const check = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name='student' AND column_name='academic_year'
    `);

    if (check.rows.length > 0) {
      console.log('academic_year column already exists, skipping.');
    } else {
      await client.query(`
        ALTER TABLE student ADD COLUMN academic_year INTEGER
      `);
      console.log('Added academic_year column to student table.');
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
