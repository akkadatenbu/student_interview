const db = require('../config/db');
const { readConfig } = require('./configController');

const analyzeInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;
    const config = readConfig();

    if (!config.groq_api_key) {
      return res.status(400).json({ success: false, message: 'ยังไม่ได้ตั้งค่า Groq API Key กรุณาตั้งค่าที่หน้าจัดการข้อมูล' });
    }

    // ดึงข้อมูลการสัมภาษณ์
    const interviewResult = await db.query(`
      SELECT i.interview_id, s.student_name, s.faculty, s.program, s.level,
             staff.staff_name AS interviewer_name, i.interview_date
      FROM interview i
      JOIN student s ON i.student_id = s.student_id
      JOIN interviewer staff ON i.interviewer_id = staff.staff_id
      WHERE i.interview_id = $1
    `, [interview_id]);

    if (interviewResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการสัมภาษณ์' });
    }

    const interview = interviewResult.rows[0];

    // ดึงคำตอบ
    const answersResult = await db.query(`
      SELECT q.question_id, q.question_text, a.answer_text
      FROM interview_answer a
      JOIN question q ON a.question_id = q.question_id
      WHERE a.interview_id = $1
      ORDER BY q.question_id
    `, [interview_id]);

    const answers = answersResult.rows;

    // สร้าง prompt
    const qaText = answers
      .filter(a => a.answer_text && a.answer_text.trim())
      .map(a => `${a.question_id}. ${a.question_text}: ${a.answer_text}`)
      .join('\n');

    const prompt = `คุณเป็นที่ปรึกษาด้านการศึกษา กรุณาวิเคราะห์ข้อมูลการสัมภาษณ์นักศึกษาต่อไปนี้

ข้อมูลนักศึกษา:
- ชื่อ: ${interview.student_name}
- คณะ: ${interview.faculty}
- หลักสูตร: ${interview.program}
- ระดับ: ${interview.level}

ผลการสัมภาษณ์:
${qaText}

กรุณาวิเคราะห์และตอบในรูปแบบ JSON เท่านั้น (ไม่ต้องมีข้อความอื่น):
{
  "risk_level": "สูง หรือ ปานกลาง หรือ ต่ำ",
  "risk_factors": ["ปัจจัยเสี่ยงที่พบ (ถ้ามี)"],
  "strengths": ["จุดเด่นหรือข้อดีของนักศึกษา"],
  "recommendations": ["คำแนะนำสำหรับอาจารย์ที่ดูแล"],
  "summary": "สรุปภาพรวมนักศึกษาคนนี้เป็นย่อหน้าสั้นๆ เพื่อให้อาจารย์ตัดสินใจว่าต้องดูแลเป็นพิเศษหรือไม่"
}`;

    const model = config.groq_model || 'llama-3.1-8b-instant';

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.groq_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return res.status(502).json({ success: false, message: 'Groq API error: ' + errText });
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content || '';

    // Parse JSON จาก response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      analysis = { summary: content, risk_level: 'ไม่ทราบ', risk_factors: [], strengths: [], recommendations: [] };
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด: ' + error.message });
  }
};

module.exports = { analyzeInterview };
