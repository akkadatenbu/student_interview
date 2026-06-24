const db = require('../config/db');
const { readConfig } = require('./configController');

// คำถามสำคัญสำหรับ rule-based analysis
const RISK_QUESTIONS = {
  INTEREST:  1,   // สนใจ/ไม่สนใจ
  EXPENSE_WHO: 5, // ค่าใช้จ่ายรับผิดชอบ
  EXPENSE:   6,   // ค่าใช้จ่าย/เดือน
  HEALTH:    8,   // โรคประจำตัว
  ALCOHOL:   11,  // ดื่มแอลกอฮอล์
  SMOKING:   12,  // สูบบุหรี่
  DRUGS:     13,  // เสพยา
  CLUBS:     15,  // ชมรม
  AWARDS:    16,  // รางวัล
  NOTES:     18,  // บันทึกเพิ่มเติม (open-ended)
};

const assessRisk = (answerMap) => {
  const flags = [];
  let highRisk = false;
  let mediumCount = 0;

  if (answerMap[RISK_QUESTIONS.DRUGS] === 'เสพ')            { flags.push('เสพสารเสพติด');        highRisk = true; }
  if (answerMap[RISK_QUESTIONS.ALCOHOL] === 'ดื่มประจำ')    { flags.push('ดื่มแอลกอฮอล์ประจำ');  mediumCount++; }
  if (answerMap[RISK_QUESTIONS.SMOKING] === 'สูบประจำ')     { flags.push('สูบบุหรี่ประจำ');       mediumCount++; }
  if (answerMap[RISK_QUESTIONS.HEALTH] === 'มี')            { flags.push('มีโรคประจำตัว');        mediumCount++; }
  if (answerMap[RISK_QUESTIONS.INTEREST] === 'ไม่สนใจ')     { flags.push('ไม่สนใจการเรียน');     mediumCount++; }
  if (answerMap[RISK_QUESTIONS.EXPENSE]?.startsWith('1,000')){ flags.push('ค่าใช้จ่ายต่ำมาก');   mediumCount++; }

  let riskLevel = 'ต่ำ';
  if (highRisk || mediumCount >= 3) riskLevel = 'สูง';
  else if (mediumCount >= 1)        riskLevel = 'ปานกลาง';

  return { riskLevel, flags };
};

const getCohortStats = async (req, res) => {
  try {
    const { academic_year, faculty } = req.query;
    const params = [];
    const conditions = ['s.student_status = 10'];
    if (academic_year) { params.push(parseInt(academic_year)); conditions.push(`s.academic_year = $${params.length}`); }
    if (faculty)       { params.push(faculty);                 conditions.push(`s.faculty = $${params.length}`); }
    const where = conditions.join(' AND ');

    const result = await db.query(`
      SELECT s.student_id, s.student_name, s.faculty, s.program,
             i.interview_id,
             json_agg(json_build_object('qid', a.question_id::int, 'answer', a.answer_text)
               ORDER BY a.question_id) AS answers
      FROM interview i
      JOIN student s ON i.student_id = s.student_id
      LEFT JOIN interview_answer a ON i.interview_id = a.interview_id
      WHERE ${where}
      GROUP BY s.student_id, s.student_name, s.faculty, s.program, i.interview_id
      ORDER BY s.faculty, s.student_name
    `, params);

    const studentRisks = [];
    const catCount = {
      alcohol: {}, smoking: {}, drugs: {}, health: {},
      expense: {}, interest: {}, clubs_none: 0, clubs_has: 0,
      awards_none: 0, awards_has: 0,
    };
    const openEndedTexts = [];

    for (const row of result.rows) {
      const answerMap = {};
      (row.answers || []).forEach(a => {
        if (a.qid) answerMap[a.qid] = a.answer || '';
      });

      // risk assessment
      const { riskLevel, flags } = assessRisk(answerMap);
      studentRisks.push({
        student_id:   row.student_id,
        student_name: row.student_name,
        faculty:      row.faculty,
        program:      row.program,
        interview_id: row.interview_id,
        risk_level:   riskLevel,
        flags,
      });

      // category stats
      const inc = (obj, key) => { if (key) obj[key] = (obj[key] || 0) + 1; };
      inc(catCount.alcohol,  answerMap[RISK_QUESTIONS.ALCOHOL]);
      inc(catCount.smoking,  answerMap[RISK_QUESTIONS.SMOKING]);
      inc(catCount.drugs,    answerMap[RISK_QUESTIONS.DRUGS]);
      inc(catCount.health,   answerMap[RISK_QUESTIONS.HEALTH]);
      inc(catCount.expense,  answerMap[RISK_QUESTIONS.EXPENSE]);
      inc(catCount.interest, answerMap[RISK_QUESTIONS.INTEREST]);
      if (answerMap[RISK_QUESTIONS.CLUBS])  catCount.clubs_has++;  else catCount.clubs_none++;
      if (answerMap[RISK_QUESTIONS.AWARDS] && !answerMap[RISK_QUESTIONS.AWARDS].includes('ยังไม่เคย')) catCount.awards_has++;
      else catCount.awards_none++;

      // open-ended notes
      const note = answerMap[RISK_QUESTIONS.NOTES];
      if (note && note.trim().length > 3) openEndedTexts.push(note.trim());
    }

    // faculty risk summary
    const facultyMap = {};
    studentRisks.forEach(s => {
      if (!facultyMap[s.faculty]) facultyMap[s.faculty] = { faculty: s.faculty, high: 0, medium: 0, low: 0, total: 0 };
      facultyMap[s.faculty].total++;
      if      (s.risk_level === 'สูง')      facultyMap[s.faculty].high++;
      else if (s.risk_level === 'ปานกลาง') facultyMap[s.faculty].medium++;
      else                                   facultyMap[s.faculty].low++;
    });

    res.json({
      success: true,
      data: {
        student_risks:     studentRisks,
        category_stats:    catCount,
        faculty_risks:     Object.values(facultyMap),
        open_ended_texts:  openEndedTexts,
        total_interviewed: result.rows.length,
      },
    });
  } catch (error) {
    console.error('getCohortStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const getCohortAISummary = async (req, res) => {
  try {
    const config = readConfig();
    if (!config.groq_api_key) {
      return res.status(400).json({ success: false, message: 'ยังไม่ได้ตั้งค่า Groq API Key' });
    }

    const { open_ended_texts = [], total, faculty } = req.body;
    if (!open_ended_texts.length) {
      return res.json({ success: true, data: { summary: 'ไม่มีข้อความปลายเปิดให้วิเคราะห์' } });
    }

    const sample = open_ended_texts.slice(0, 80); // จำกัด token
    const prompt = `คุณเป็นที่ปรึกษาด้านการศึกษา วิเคราะห์บันทึกความคิดเห็นของนักศึกษา${faculty ? `คณะ${faculty}` : ''} จำนวน ${total} คน ที่ผ่านการสัมภาษณ์

บันทึกที่รวบรวมได้ (${sample.length} รายการ):
${sample.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

กรุณาวิเคราะห์และตอบเป็น JSON เท่านั้น:
{
  "main_themes": ["ประเด็นหลักที่นักศึกษาพูดถึงบ่อย (3-5 ประเด็น)"],
  "concerns": ["ความกังวลหรือปัญหาที่พบ"],
  "positive_aspects": ["ด้านบวกที่น่าสนใจ"],
  "recommendations": ["ข้อเสนอแนะสำหรับสถาบัน"],
  "summary": "สรุปภาพรวมในย่อหน้าเดียว"
}`;

    const model = config.groq_model || 'llama-3.1-8b-instant';
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.groq_api_key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.4, max_tokens: 1200 }),
    });

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content || '';
    let analysis;
    try {
      const match = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(match ? match[0] : content);
    } catch {
      analysis = { summary: content, main_themes: [], concerns: [], positive_aspects: [], recommendations: [] };
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeInterview, getCohortStats, getCohortAISummary };
