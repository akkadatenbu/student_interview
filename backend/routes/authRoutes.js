// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// GET /api/auth/me — ตรวจ token แล้วคืนข้อมูลผู้สัมภาษณ์ที่จับคู่ไว้ (เรียกหลัง SSO login)
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      ...req.interviewer,
      isAdmin: req.isAdmin,
    },
  });
});

module.exports = router;
