-- Create database
CREATE DATABASE student_interview;

-- Connect to the database
\c student_interview

-- Create interviewer table
CREATE TABLE interviewer (
    staff_id INTEGER PRIMARY KEY,
    staff_name VARCHAR(255) NOT NULL,
    staff_faculty VARCHAR(255) NOT NULL
);

-- Create student table
CREATE TABLE student (
    student_id INTEGER PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    program VARCHAR(255) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    campus VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    scholarship VARCHAR(255),
    graduated_school VARCHAR(255),
    hometown VARCHAR(255)
);

-- Create question table
CREATE TABLE question (
    question_id INTEGER PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    answer_options TEXT,
    condition_logic TEXT,
    condition_display TEXT
);

-- Create interview table (to track interviews)
CREATE TABLE interview (
    interview_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    interviewer_id INTEGER REFERENCES interviewer(staff_id),
    interview_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT TRUE,
    UNIQUE(student_id)  -- One interview per student
);

-- Create interview_answer table (to store answers)
CREATE TABLE interview_answer (
    answer_id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interview(interview_id),
    question_id INTEGER REFERENCES question(question_id),
    answer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(interview_id, question_id)  -- One answer per question per interview
);

-- Create indexes for better performance
CREATE INDEX idx_interview_student ON interview(student_id);
CREATE INDEX idx_interview_interviewer ON interview(interviewer_id);
CREATE INDEX idx_answer_interview ON interview_answer(interview_id);
CREATE INDEX idx_answer_question ON interview_answer(question_id);
CREATE INDEX idx_student_faculty ON student(faculty);
CREATE INDEX idx_student_program ON student(program);

-- Create views for reporting
CREATE VIEW interview_stats AS
SELECT 
    s.faculty,
    s.program,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT i.student_id) AS interviewed_students,
    COUNT(DISTINCT s.student_id) - COUNT(DISTINCT i.student_id) AS remaining_students
FROM 
    student s
LEFT JOIN 
    interview i ON s.student_id = i.student_id
GROUP BY 
    s.faculty, s.program;

CREATE VIEW student_answers AS
SELECT 
    s.student_id,
    s.student_name,
    q.question_id,
    q.question_text,
    ia.answer_text,
    i.interview_date,
    iv.staff_name AS interviewer_name
FROM 
    student s
JOIN 
    interview i ON s.student_id = i.student_id
JOIN 
    interviewer iv ON i.interviewer_id = iv.staff_id
JOIN 
    interview_answer ia ON i.interview_id = ia.interview_id
JOIN 
    question q ON ia.question_id = q.question_id
ORDER BY 
    s.student_id, q.question_id;

-- Add comments to tables
COMMENT ON TABLE interviewer IS 'ข้อมูลผู้สัมภาษณ์';
COMMENT ON TABLE student IS 'ข้อมูลนักศึกษา';
COMMENT ON TABLE question IS 'คำถามในแบบสัมภาษณ์';
COMMENT ON TABLE interview IS 'ข้อมูลการสัมภาษณ์';
COMMENT ON TABLE interview_answer IS 'คำตอบในการสัมภาษณ์';
COMMENT ON VIEW interview_stats IS 'สถิติการสัมภาษณ์แยกตามคณะและหลักสูตร';
COMMENT ON VIEW student_answers IS 'คำตอบของนักศึกษาแต่ละคน';
