// backend/utils/upload.js
const multer = require('multer');

// เก็บไฟล์ใน memory (buffer) ไม่บันทึกลง disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('รองรับเฉพาะไฟล์ CSV เท่านั้น'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

module.exports = upload;
