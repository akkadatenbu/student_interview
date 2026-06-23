// backend/controllers/interviewerController.js
const db = require('../config/db');

// Get all interviewers
const getAllInterviewers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM interviewer ORDER BY staff_id');
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting interviewers:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลผู้สัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Get interviewer by ID
const getInterviewerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM interviewer WHERE staff_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้สัมภาษณ์'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting interviewer:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลผู้สัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Create new interviewer
const createInterviewer = async (req, res) => {
  try {
    const { staff_id, staff_name, staff_faculty } = req.body;
    
    // Validate input
    if (!staff_id || !staff_name || !staff_faculty) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await db.query(
      'INSERT INTO interviewer (staff_id, staff_name, staff_faculty) VALUES ($1, $2, $3) RETURNING *',
      [staff_id, staff_name, staff_faculty]
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
        message: 'รหัสผู้สัมภาษณ์นี้มีอยู่ในระบบแล้ว'
      });
    }
    
    console.error('Error creating interviewer:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถเพิ่มข้อมูลผู้สัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Update interviewer
const updateInterviewer = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_name, staff_faculty } = req.body;
    
    // Validate input
    if (!staff_name || !staff_faculty) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }
    
    const result = await db.query(
      'UPDATE interviewer SET staff_name = $1, staff_faculty = $2 WHERE staff_id = $3 RETURNING *',
      [staff_name, staff_faculty, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้สัมภาษณ์'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating interviewer:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถอัปเดตข้อมูลผู้สัมภาษณ์ได้',
      error: error.message
    });
  }
};

// Delete interviewer
const deleteInterviewer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if interviewer has associated interviews
    const checkResult = await db.query(
      'SELECT COUNT(*) FROM interview WHERE interviewer_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบได้เนื่องจากมีข้อมูลการสัมภาษณ์ที่เชื่อมโยงกับผู้สัมภาษณ์นี้'
      });
    }
    
    const result = await db.query('DELETE FROM interviewer WHERE staff_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้สัมภาษณ์'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลผู้สัมภาษณ์เรียบร้อยแล้ว',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting interviewer:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบข้อมูลผู้สัมภาษณ์ได้',
      error: error.message
    });
  }
};

module.exports = {
  getAllInterviewers,
  getInterviewerById,
  createInterviewer,
  updateInterviewer,
  deleteInterviewer
};
