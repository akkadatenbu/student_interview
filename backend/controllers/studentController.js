// backend/controllers/studentController.js
const db = require('../config/db');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    // ดึงข้อมูลนักศึกษาพร้อมสถานะการสัมภาษณ์
    const result = await db.query(`
      SELECT 
        s.*, 
        CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
      FROM 
        student s
      LEFT JOIN 
        interview i ON s.student_id = i.student_id
      ORDER BY 
        s.student_id
    `);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลนักศึกษาได้',
      error: error.message
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ดึงข้อมูลนักศึกษาพร้อมสถานะการสัมภาษณ์
    const result = await db.query(`
      SELECT 
        s.*, 
        CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
      FROM 
        student s
      LEFT JOIN 
        interview i ON s.student_id = i.student_id
      WHERE 
        s.student_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษา'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting student:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลนักศึกษาได้',
      error: error.message
    });
  }
};

// Get students by faculty
const getStudentsByFaculty = async (req, res) => {
  try {
    const { faculty } = req.params;
    
    const result = await db.query(`
      SELECT 
        s.*, 
        CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
      FROM 
        student s
      LEFT JOIN 
        interview i ON s.student_id = i.student_id
      WHERE 
        s.faculty = $1
      ORDER BY 
        s.student_id
    `, [faculty]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting students by faculty:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลนักศึกษาตามคณะได้',
      error: error.message
    });
  }
};

// Get students by program
const getStudentsByProgram = async (req, res) => {
  try {
    const { program } = req.params;
    
    const result = await db.query(`
      SELECT 
        s.*, 
        CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
      FROM 
        student s
      LEFT JOIN 
        interview i ON s.student_id = i.student_id
      WHERE 
        s.program = $1
      ORDER BY 
        s.student_id
    `, [program]);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting students by program:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลนักศึกษาตามหลักสูตรได้',
      error: error.message
    });
  }
};

// Get students who have not been interviewed
const getNotInterviewedStudents = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.*
      FROM 
        student s
      LEFT JOIN 
        interview i ON s.student_id = i.student_id
      WHERE 
        i.student_id IS NULL
      ORDER BY 
        s.faculty, s.program, s.student_id
    `);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting not interviewed students:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const { 
      student_id, 
      student_name, 
      program, 
      faculty, 
      campus, 
      level, 
      phone, 
      scholarship, 
      graduated_school, 
      hometown 
    } = req.body;
    
    // Validate input
    if (!student_id || !student_name || !program || !faculty || !campus || !level) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัสนักศึกษา, ชื่อ, หลักสูตร, คณะ, วิทยาเขต, ระดับ)'
      });
    }
    
    const result = await db.query(
      `INSERT INTO student 
        (student_id, student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [student_id, student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === '23505') { // PostgreSQL unique violation code
      return res.status(400).json({
        success: false,
        message: 'รหัสนักศึกษานี้มีอยู่ในระบบแล้ว'
      });
    }
    
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถเพิ่มข้อมูลนักศึกษาได้',
      error: error.message
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      student_name, 
      program, 
      faculty, 
      campus, 
      level, 
      phone, 
      scholarship, 
      graduated_school, 
      hometown 
    } = req.body;
    
    // Validate input
    if (!student_name || !program || !faculty || !campus || !level) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อ, หลักสูตร, คณะ, วิทยาเขต, ระดับ)'
      });
    }
    
    const result = await db.query(
      `UPDATE student 
       SET student_name = $1, program = $2, faculty = $3, campus = $4, level = $5, 
           phone = $6, scholarship = $7, graduated_school = $8, hometown = $9
       WHERE student_id = $10 
       RETURNING *`,
      [student_name, program, faculty, campus, level, phone, scholarship, graduated_school, hometown, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษา'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถอัปเดตข้อมูลนักศึกษาได้',
      error: error.message
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check for interviews
    const checkInterviews = await db.query(
      'SELECT COUNT(*) FROM interview WHERE student_id = $1',
      [id]
    );
    
    if (parseInt(checkInterviews.rows[0].count) > 0) {
      // Delete associated interviews and answers
      await db.query(`
        DELETE FROM interview_answer 
        WHERE interview_id IN (SELECT interview_id FROM interview WHERE student_id = $1)
      `, [id]);
      
      await db.query('DELETE FROM interview WHERE student_id = $1', [id]);
    }
    
    const result = await db.query('DELETE FROM student WHERE student_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลนักศึกษา'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลนักศึกษาเรียบร้อยแล้ว',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบข้อมูลนักศึกษาได้',
      error: error.message
    });
  }
};

// Get interview status summary
const getInterviewStatusSummary = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        faculty,
        program,
        COUNT(*) AS total_students,
        SUM(CASE WHEN interviewed THEN 1 ELSE 0 END) AS interviewed_count,
        COUNT(*) - SUM(CASE WHEN interviewed THEN 1 ELSE 0 END) AS not_interviewed_count
      FROM 
        (
          SELECT 
            s.*, 
            CASE WHEN i.interview_id IS NOT NULL THEN true ELSE false END AS interviewed
          FROM 
            student s
          LEFT JOIN 
            interview i ON s.student_id = i.student_id
        ) AS subquery
      GROUP BY 
        faculty, program
      ORDER BY 
        faculty, program
    `);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลสรุปสถานะการสัมภาษณ์ได้',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentsByFaculty,
  getStudentsByProgram,
  getNotInterviewedStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getInterviewStatusSummary
};
