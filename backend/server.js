// backend/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const interviewerRoutes = require('./routes/interviewerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const questionRoutes = require('./routes/questionRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const configRoutes = require('./routes/configRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Run migrations on startup
const addStudentStatus = require('./migrations/add_student_status');
const addInterviewerEmail = require('./migrations/add_interviewer_email');
const addInterviewerStaffIdSeq = require('./migrations/add_interviewer_staff_id_seq');

async function runMigrations() {
  await addStudentStatus();
  await addInterviewerEmail();   // ต้องรันก่อน seq เพราะ seq query อ้างคอลัมน์ staff_id ที่มีอยู่แล้ว
  await addInterviewerStaffIdSeq();
}
runMigrations()
  .then(() => console.log('Migrations completed'))
  .catch(err => console.error('Migration error:', err));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — รองรับหลาย domain
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // เพิ่ม logging เพื่อการพัฒนา

// Health check endpoint — ต้องอยู่ก่อน requireAuth (Cloud Run/Load Balancer ต้องเรียกได้โดยไม่มี token)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Auth — มี requireAuth ในตัวอยู่แล้วที่ route /me
app.use('/api/auth', authRoutes);

// ⚠️ ทุก route ตั้งแต่บรรทัดนี้ลงไปต้อง Login ผ่าน NBU SSO ก่อนเสมอ
const { requireAuth } = require('./middleware/auth');
app.use('/api', requireAuth);

app.use('/api/interviewers', interviewerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
