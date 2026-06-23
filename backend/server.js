// backend/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const interviewerRoutes = require('./routes/interviewerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const questionRoutes = require('./routes/questionRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // เพิ่ม logging เพื่อการพัฒนา

// Routes
app.use('/api/interviewers', interviewerRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

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
