// backend/controllers/interviewController.js
const db = require('../config/db');
const excel = require('exceljs');
const path = require('path');
const fs = require('fs');

// Get all interviews
const getAllInterviews = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.interview_id, 
        i.student_id, 
        s.student_name, 
        s.program, 
        s.faculty,
        i.interviewer_id, 
        staff.staff_name AS interviewer_name,
        i.interview_date, 
        i.completed
      FROM 
        interview i
      JOIN 
        student s ON i.student_id = s.student_id
      JOIN 
        interviewer staff ON i.interviewer_id = staff.staff_id
      ORDER BY 
        i.interview_date DESC
    `);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting interviews:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลการสัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Get interview by ID with answers
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get interview details
    const interviewResult = await db.query(`
      SELECT 
        i.interview_id, 
        i.student_id, 
        s.student_name, 
        s.program, 
        s.faculty,
        s.campus,
        s.level,
        s.phone,
        s.scholarship,
        s.graduated_school,
        s.hometown,
        i.interviewer_id, 
        staff.staff_name AS interviewer_name,
        staff.staff_faculty AS interviewer_faculty,
        i.interview_date, 
        i.completed
      FROM 
        interview i
      JOIN 
        student s ON i.student_id = s.student_id
      JOIN 
        interviewer staff ON i.interviewer_id = staff.staff_id
      WHERE 
        i.interview_id = $1
    `, [id]);
    
    if (interviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการสัมภาษณ์'
      });
    }
    
    // Get answers
    const answersResult = await db.query(`
      SELECT 
        a.answer_id,
        a.question_id,
        q.question_text,
        q.question_type,
        q.answer_options,
        a.answer_text
      FROM 
        interview_answer a
      JOIN 
        question q ON a.question_id = q.question_id
      WHERE 
        a.interview_id = $1
      ORDER BY 
        q.question_id
    `, [id]);
    
    const interview = interviewResult.rows[0];
    interview.answers = answersResult.rows;
    
    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error getting interview:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลการสัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Get interview by student ID
const getInterviewByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get interview details
    const interviewResult = await db.query(`
      SELECT 
        i.interview_id, 
        i.student_id, 
        s.student_name, 
        s.program, 
        s.faculty,
        s.campus,
        s.level,
        s.phone,
        s.scholarship,
        s.graduated_school,
        s.hometown,
        i.interviewer_id, 
        staff.staff_name AS interviewer_name,
        staff.staff_faculty AS interviewer_faculty,
        i.interview_date, 
        i.completed
      FROM 
        interview i
      JOIN 
        student s ON i.student_id = s.student_id
      JOIN 
        interviewer staff ON i.interviewer_id = staff.staff_id
      WHERE 
        i.student_id = $1
    `, [studentId]);
    
    if (interviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการสัมภาษณ์ของนักศึกษารหัสนี้'
      });
    }
    
    const interviewId = interviewResult.rows[0].interview_id;
    
    // Get answers
    const answersResult = await db.query(`
      SELECT 
        a.answer_id,
        a.question_id,
        q.question_text,
        q.question_type,
        q.answer_options,
        a.answer_text
      FROM 
        interview_answer a
      JOIN 
        question q ON a.question_id = q.question_id
      WHERE 
        a.interview_id = $1
      ORDER BY 
        q.question_id
    `, [interviewId]);
    
    const interview = interviewResult.rows[0];
    interview.answers = answersResult.rows;
    
    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error getting interview by student ID:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลการสัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Create new interview with answers
const createInterview = async (req, res) => {
  // Use a transaction to ensure all operations complete or none do
  const client = await db.pool.connect();
  
  try {
    const { student_id, interviewer_id, answers } = req.body;
    
    // Validate input
    if (!student_id || !interviewer_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (รหัสนักศึกษา, รหัสผู้สัมภาษณ์, คำตอบ)'
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if student already has an interview
    const checkExisting = await client.query(
      'SELECT interview_id FROM interview WHERE student_id = $1',
      [student_id]
    );
    
    if (checkExisting.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'นักศึกษาคนนี้มีข้อมูลการสัมภาษณ์อยู่แล้ว'
      });
    }
    
    // Create interview
    const interviewResult = await client.query(
      'INSERT INTO interview (student_id, interviewer_id, completed) VALUES ($1, $2, $3) RETURNING *',
      [student_id, interviewer_id, true]
    );
    
    const interview_id = interviewResult.rows[0].interview_id;
    
    // Insert answers
    for (const answer of answers) {
      if (!answer.question_id || answer.answer_text === undefined) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลคำตอบไม่ถูกต้อง (จำเป็นต้องมี question_id และ answer_text)'
        });
      }
      
      await client.query(
        'INSERT INTO interview_answer (interview_id, question_id, answer_text) VALUES ($1, $2, $3)',
        [interview_id, answer.question_id, answer.answer_text]
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get complete interview data for response
    const completeInterviewResult = await db.query(`
      SELECT 
        i.interview_id, 
        i.student_id, 
        s.student_name, 
        i.interviewer_id, 
        staff.staff_name AS interviewer_name,
        i.interview_date, 
        i.completed
      FROM 
        interview i
      JOIN 
        student s ON i.student_id = s.student_id
      JOIN 
        interviewer staff ON i.interviewer_id = staff.staff_id
      WHERE 
        i.interview_id = $1
    `, [interview_id]);
    
    const answersResult = await db.query(`
      SELECT 
        a.answer_id,
        a.question_id,
        q.question_text,
        a.answer_text
      FROM 
        interview_answer a
      JOIN 
        question q ON a.question_id = q.question_id
      WHERE 
        a.interview_id = $1
      ORDER BY 
        q.question_id
    `, [interview_id]);
    
    const completeInterview = completeInterviewResult.rows[0];
    completeInterview.answers = answersResult.rows;
    
    res.status(201).json({
      success: true,
      message: 'บันทึกข้อมูลการสัมภาษณ์เรียบร้อยแล้ว',
      data: completeInterview
    });
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถบันทึกข้อมูลการสัมภาษณ์ได้',
      error: error.message
    });
  } finally {
    // Release client back to pool
    client.release();
  }
};

// Update interview answers
const updateInterviewAnswers = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    const { answers } = req.body;
    
    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาส่งข้อมูลคำตอบในรูปแบบ array'
      });
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    // Check if interview exists
    const checkInterview = await client.query(
      'SELECT interview_id FROM interview WHERE interview_id = $1',
      [id]
    );
    
    if (checkInterview.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการสัมภาษณ์'
      });
    }
    
    // Update each answer
    for (const answer of answers) {
      if (!answer.question_id || answer.answer_text === undefined) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลคำตอบไม่ถูกต้อง (จำเป็นต้องมี question_id และ answer_text)'
        });
      }
      
      // Check if answer exists
      const checkAnswer = await client.query(
        'SELECT answer_id FROM interview_answer WHERE interview_id = $1 AND question_id = $2',
        [id, answer.question_id]
      );
      
      if (checkAnswer.rows.length > 0) {
        // Update existing answer
        await client.query(
          'UPDATE interview_answer SET answer_text = $1 WHERE interview_id = $2 AND question_id = $3',
          [answer.answer_text, id, answer.question_id]
        );
      } else {
        // Insert new answer
        await client.query(
          'INSERT INTO interview_answer (interview_id, question_id, answer_text) VALUES ($1, $2, $3)',
          [id, answer.question_id, answer.answer_text]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get updated answers
    const updatedAnswers = await db.query(`
      SELECT 
        a.answer_id,
        a.question_id,
        q.question_text,
        a.answer_text
      FROM 
        interview_answer a
      JOIN 
        question q ON a.question_id = q.question_id
      WHERE 
        a.interview_id = $1
      ORDER BY 
        q.question_id
    `, [id]);
    
    res.status(200).json({
      success: true,
      message: 'อัปเดตข้อมูลคำตอบเรียบร้อยแล้ว',
      data: updatedAnswers.rows
    });
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error updating interview answers:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถอัปเดตข้อมูลคำตอบได้',
      error: error.message
    });
  } finally {
    // Release client back to pool
    client.release();
  }
};

// Delete interview
const deleteInterview = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const { id } = req.params;
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete answers first
    await client.query('DELETE FROM interview_answer WHERE interview_id = $1', [id]);
    
    // Delete interview
    const result = await client.query('DELETE FROM interview WHERE interview_id = $1 RETURNING *', [id]);
    
    // Commit transaction
    await client.query('COMMIT');
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลการสัมภาษณ์'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลการสัมภาษณ์เรียบร้อยแล้ว',
      data: result.rows[0]
    });
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error deleting interview:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบข้อมูลการสัมภาษณ์ได้',
      error: error.message
    });
  } finally {
    // Release client back to pool
    client.release();
  }
};

// Export all interviews to Excel
const exportInterviewsToExcel = async (req, res) => {
  try {
    // Get all interviews with student and interviewer details
    const interviews = await db.query(`
      SELECT 
        i.interview_id, 
        i.student_id, 
        s.student_name, 
        s.program, 
        s.faculty,
        s.campus,
        s.level,
        s.phone,
        s.scholarship,
        s.graduated_school,
        s.hometown,
        i.interviewer_id, 
        staff.staff_name AS interviewer_name,
        i.interview_date
      FROM 
        interview i
      JOIN 
        student s ON i.student_id = s.student_id
      JOIN 
        interviewer staff ON i.interviewer_id = staff.staff_id
      ORDER BY 
        i.interview_date DESC
    `);
    
    // Get all questions
    const questions = await db.query('SELECT * FROM question ORDER BY question_id');
    
    // Create a new Excel workbook
    const workbook = new excel.Workbook();
    
    // Add a worksheet for the interview summary
    const summarySheet = workbook.addWorksheet('รายงานสรุป');
    
    // Add headers for summary sheet
    summarySheet.columns = [
      { header: 'รหัสการสัมภาษณ์', key: 'interview_id', width: 15 },
      { header: 'รหัสนักศึกษา', key: 'student_id', width: 15 },
      { header: 'ชื่อนักศึกษา', key: 'student_name', width: 30 },
      { header: 'หลักสูตร', key: 'program', width: 30 },
      { header: 'คณะ', key: 'faculty', width: 20 },
      { header: 'วิทยาเขต', key: 'campus', width: 15 },
      { header: 'ระดับ', key: 'level', width: 10 },
      { header: 'ผู้สัมภาษณ์', key: 'interviewer_name', width: 30 },
      { header: 'วันที่สัมภาษณ์', key: 'interview_date', width: 20 }
    ];
    
    // Add data to summary sheet
    summarySheet.addRows(interviews.rows.map(interview => ({
      ...interview,
      interview_date: new Date(interview.interview_date).toLocaleString('th-TH')
    })));
    
    // Style the header row
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add a worksheet for detailed answers
    const detailSheet = workbook.addWorksheet('รายละเอียดคำตอบ');
    
    // Create headers for detail sheet
    const detailColumns = [
      { header: 'รหัสการสัมภาษณ์', key: 'interview_id', width: 15 },
      { header: 'รหัสนักศึกษา', key: 'student_id', width: 15 },
      { header: 'ชื่อนักศึกษา', key: 'student_name', width: 30 },
      { header: 'ผู้สัมภาษณ์', key: 'interviewer_name', width: 30 },
      { header: 'วันที่สัมภาษณ์', key: 'interview_date', width: 20 }
    ];
    
    // Add a column for each question
    questions.rows.forEach(question => {
      detailColumns.push({
        header: `${question.question_id}. ${question.question_text}`,
        key: `q${question.question_id}`,
        width: 30
      });
    });
    
    detailSheet.columns = detailColumns;
    
    // Get all answers
    const allAnswers = await db.query(`
      SELECT 
        ia.interview_id,
        ia.question_id,
        ia.answer_text
      FROM 
        interview_answer ia
      ORDER BY 
        ia.interview_id, ia.question_id
    `);
    
    // Process data for the detail sheet
    const detailRows = [];
    
    for (const interview of interviews.rows) {
      const row = {
        interview_id: interview.interview_id,
        student_id: interview.student_id,
        student_name: interview.student_name,
        interviewer_name: interview.interviewer_name,
        interview_date: new Date(interview.interview_date).toLocaleString('th-TH')
      };
      
      // Find all answers for this interview
      const answers = allAnswers.rows.filter(a => a.interview_id === interview.interview_id);
      
      // Add answers to the row
      for (const answer of answers) {
        row[`q${answer.question_id}`] = answer.answer_text;
      }
      
      detailRows.push(row);
    }
    
    // Add data to detail sheet
    detailSheet.addRows(detailRows);
    
    // Style the detail header row
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Set auto-filter on both sheets
    summarySheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: summarySheet.columns.length }
    };
    
    detailSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 5 }
    };
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // File path for the Excel file
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filePath = path.join(uploadsDir, `interview_data_${timestamp}.xlsx`);
    
    // Write the Excel file
    await workbook.xlsx.writeFile(filePath);
    
    // Send the file
    res.download(filePath, `interview_data_${timestamp}.xlsx`, err => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({
          success: false,
          message: 'ไม่สามารถส่งไฟล์ Excel ได้'
        });
      }
      
      // Delete the file after sending
      fs.unlink(filePath, unlinkErr => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถส่งออกข้อมูลเป็น Excel ได้',
      error: error.message
    });
  }
};

module.exports = {
  getAllInterviews,
  getInterviewById,
  getInterviewByStudentId,
  createInterview,
  updateInterviewAnswers,
  deleteInterview,
  exportInterviewsToExcel
};
