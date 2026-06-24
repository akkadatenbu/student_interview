// backend/controllers/importController.js
const csv = require('csv-parser');
const { Readable } = require('stream');
const db = require('../config/db');

// Parse CSV buffer into rows
function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(buffer.toString('utf8'));
    stream
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// GET /api/students/import/headers — อ่าน header จาก CSV
const getStudentCSVHeaders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ CSV' });
    }

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไฟล์ CSV ว่างเปล่า' });
    }

    const headers = Object.keys(rows[0]);
    return res.json({ success: true, headers, preview: rows.slice(0, 3) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'อ่านไฟล์ CSV ไม่ได้: ' + err.message });
  }
};

// POST /api/students/import — import พร้อม column mapping
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ CSV' });
    }

    // mapping: { student_id: "รหัสนักศึกษา", student_name: "ชื่อนักศึกษา", ... }
    let mapping;
    try {
      mapping = JSON.parse(req.body.mapping);
    } catch {
      return res.status(400).json({ success: false, message: 'ข้อมูล mapping ไม่ถูกต้อง' });
    }

    const requiredFields = ['student_id', 'student_name', 'program', 'faculty', 'campus', 'level'];
    const missingFields = requiredFields.filter(f => !mapping[f]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `กรุณา map field ที่จำเป็น: ${missingFields.join(', ')}`
      });
    }

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไฟล์ CSV ว่างเปล่า' });
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 เพราะ header คือแถว 1

      try {
        // Map ค่าจาก CSV column ตาม mapping
        const student_id = row[mapping.student_id]?.trim();
        const student_name = row[mapping.student_name]?.trim();
        const program = row[mapping.program]?.trim();
        const faculty = row[mapping.faculty]?.trim();
        const campus = row[mapping.campus]?.trim();
        const level = row[mapping.level]?.trim();
        const phone = mapping.phone ? row[mapping.phone]?.trim() || null : null;
        const scholarship = mapping.scholarship ? row[mapping.scholarship]?.trim() || null : null;
        const graduated_school = mapping.graduated_school ? row[mapping.graduated_school]?.trim() || null : null;
        const hometown = mapping.hometown ? row[mapping.hometown]?.trim() || null : null;
        const academic_year = mapping.academic_year ? parseInt(row[mapping.academic_year]?.trim()) || null : null;

        // Validate required fields
        if (!student_id || isNaN(parseInt(student_id))) {
          errors.push({ row: rowNum, reason: 'student_id ต้องเป็นตัวเลข' });
          continue;
        }
        if (!student_name) {
          errors.push({ row: rowNum, reason: 'student_name ว่างเปล่า' });
          continue;
        }
        if (!program || !faculty || !campus || !level) {
          errors.push({ row: rowNum, reason: 'ข้อมูลจำเป็นไม่ครบ (program/faculty/campus/level)' });
          continue;
        }

        // Upsert
        const result = await db.query(`
          INSERT INTO student (student_id, student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown, academic_year, student_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 10)
          ON CONFLICT (student_id) DO UPDATE SET
            student_name = EXCLUDED.student_name,
            program = EXCLUDED.program,
            faculty = EXCLUDED.faculty,
            campus = EXCLUDED.campus,
            level = EXCLUDED.level,
            phone = EXCLUDED.phone,
            scholarship = EXCLUDED.scholarship,
            graduated_school = EXCLUDED.graduated_school,
            hometown = EXCLUDED.hometown,
            academic_year = EXCLUDED.academic_year
          RETURNING (xmax = 0) AS is_insert
        `, [parseInt(student_id), student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown, academic_year]);

        if (result.rows[0].is_insert) {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        errors.push({ row: rowNum, reason: err.message });
      }
    }

    return res.json({
      success: true,
      message: 'Import เสร็จสิ้น',
      result: { inserted, updated, skipped: errors.length, total: rows.length },
      errors
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + err.message });
  }
};

// GET /api/interviewers/import/headers
const getInterviewerCSVHeaders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ CSV' });
    }

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไฟล์ CSV ว่างเปล่า' });
    }

    const headers = Object.keys(rows[0]);
    return res.json({ success: true, headers, preview: rows.slice(0, 3) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'อ่านไฟล์ CSV ไม่ได้: ' + err.message });
  }
};

// POST /api/interviewers/import
const importInterviewers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ CSV' });
    }

    let mapping;
    try {
      mapping = JSON.parse(req.body.mapping);
    } catch {
      return res.status(400).json({ success: false, message: 'ข้อมูล mapping ไม่ถูกต้อง' });
    }

    const requiredFields = ['staff_id', 'staff_name', 'staff_faculty'];
    const missingFields = requiredFields.filter(f => !mapping[f]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `กรุณา map field ที่จำเป็น: ${missingFields.join(', ')}`
      });
    }

    const rows = await parseCSV(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไฟล์ CSV ว่างเปล่า' });
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const staff_id = row[mapping.staff_id]?.trim();
        const staff_name = row[mapping.staff_name]?.trim();
        const staff_faculty = row[mapping.staff_faculty]?.trim();

        if (!staff_id || isNaN(parseInt(staff_id))) {
          errors.push({ row: rowNum, reason: 'staff_id ต้องเป็นตัวเลข' });
          continue;
        }
        if (!staff_name) {
          errors.push({ row: rowNum, reason: 'staff_name ว่างเปล่า' });
          continue;
        }
        if (!staff_faculty) {
          errors.push({ row: rowNum, reason: 'staff_faculty ว่างเปล่า' });
          continue;
        }

        const result = await db.query(`
          INSERT INTO interviewer (staff_id, staff_name, staff_faculty)
          VALUES ($1, $2, $3)
          ON CONFLICT (staff_id) DO UPDATE SET
            staff_name = EXCLUDED.staff_name,
            staff_faculty = EXCLUDED.staff_faculty
          RETURNING (xmax = 0) AS is_insert
        `, [parseInt(staff_id), staff_name, staff_faculty]);

        if (result.rows[0].is_insert) {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        errors.push({ row: rowNum, reason: err.message });
      }
    }

    return res.json({
      success: true,
      message: 'Import เสร็จสิ้น',
      result: { inserted, updated, skipped: errors.length, total: rows.length },
      errors
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + err.message });
  }
};

module.exports = {
  getStudentCSVHeaders,
  importStudents,
  getInterviewerCSVHeaders,
  importInterviewers
};
