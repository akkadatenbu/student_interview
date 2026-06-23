// backend/controllers/questionController.js
const db = require('../config/db');

// Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM question ORDER BY question_id');
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลคำถามได้',
      error: error.message
    });
  }
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM question WHERE question_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลคำถาม'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลคำถามได้',
      error: error.message
    });
  }
};

// Create new question
const createQuestion = async (req, res) => {
  try {
    const { 
      question_id, 
      question_text, 
      question_type, 
      answer_options, 
      condition_logic, 
      condition_display 
    } = req.body;
    
    // Validate input
    if (!question_id || !question_text || !question_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (รหัสคำถาม, ข้อคำถาม, รูปแบบคำถาม)'
      });
    }
    
    const result = await db.query(
      `INSERT INTO question 
        (question_id, question_text, question_type, answer_options, condition_logic, condition_display) 
       VALUES 
        ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [question_id, question_text, question_type, answer_options, condition_logic, condition_display]
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
        message: 'รหัสคำถามนี้มีอยู่ในระบบแล้ว'
      });
    }
    
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถเพิ่มข้อมูลคำถามได้',
      error: error.message
    });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      question_text, 
      question_type, 
      answer_options, 
      condition_logic, 
      condition_display 
    } = req.body;
    
    // Validate input
    if (!question_text || !question_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ข้อคำถาม, รูปแบบคำถาม)'
      });
    }
    
    const result = await db.query(
      `UPDATE question 
       SET question_text = $1, question_type = $2, answer_options = $3, 
           condition_logic = $4, condition_display = $5 
       WHERE question_id = $6 
       RETURNING *`,
      [question_text, question_type, answer_options, condition_logic, condition_display, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลคำถาม'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถอัปเดตข้อมูลคำถามได้',
      error: error.message
    });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are answers for this question
    const checkAnswers = await db.query(
      'SELECT COUNT(*) FROM interview_answer WHERE question_id = $1',
      [id]
    );
    
    if (parseInt(checkAnswers.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบคำถามได้เนื่องจากมีข้อมูลคำตอบที่เชื่อมโยงกับคำถามนี้'
      });
    }
    
    const result = await db.query('DELETE FROM question WHERE question_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลคำถาม'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลคำถามเรียบร้อยแล้ว',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบข้อมูลคำถามได้',
      error: error.message
    });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
