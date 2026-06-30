// backend/middleware/auth.js
// ยืนยันตัวตน + สิทธิ์ผ่าน NBU SSO ทั้งหมด (Option B — Centralized 2-Axis Authorization)
//
// permission.role        → ใช้ตัดสิน isAdmin (ผู้บริหารเห็นทุกคณะ)
// permission.allowed_dept_name → ใช้เป็น "คณะ" ของผู้สัมภาษณ์โดยตรง ไม่ผ่านตาราง local อีกต่อไป
//
// ตาราง interviewer ในระบบนี้ยังคงไว้ "เฉพาะ" เพื่อเป็น FK anchor ของ interview.interviewer_id
// (auto-upsert ทุกครั้งที่ login ด้วยข้อมูลล่าสุดจาก SSO — ไม่ต้อง import CSV ผูก email ล่วงหน้าอีกแล้ว)
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');

const SSO_URL = process.env.SSO_URL || 'https://sso.northbkk.ac.th';
const APP_ID  = process.env.SSO_APP_ID || 'student-interview';

let cachedPublicKey = null;

async function getPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  const res = await axios.get(`${SSO_URL}/api/v1/public-key`);
  cachedPublicKey = res.data;
  return cachedPublicKey;
}

async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }

  let payload;
  try {
    const publicKey = await getPublicKey();
    payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'sso.northbkk.ac.th',
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }

  if (payload.application_id !== APP_ID) {
    return res.status(401).json({ success: false, message: 'Token นี้ไม่ได้ออกให้สำหรับระบบนี้' });
  }

  const perm = payload.permission || {};
  const isAdmin = perm.role === 'ADMIN' || perm.scope_level === 'UNIVERSITY';

  try {
    // Auto-upsert: สร้าง/อัปเดต record ผู้สัมภาษณ์จากข้อมูลล่าสุดของ SSO ทุกครั้งที่ login
    // (staff_id ใหม่ใช้ sequence กันชนกับ staff_id เดิมที่ import จาก CSV ด้วยมือ)
    const result = await db.query(
      `INSERT INTO interviewer (staff_id, staff_name, staff_faculty, email)
       VALUES (nextval('interviewer_staff_id_seq'), $1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         staff_name    = EXCLUDED.staff_name,
         staff_faculty = EXCLUDED.staff_faculty
       RETURNING staff_id, staff_name, staff_faculty, email`,
      [payload.name, perm.allowed_dept_name || null, payload.email]
    );

    req.ssoUser = payload;
    req.interviewer = result.rows[0];
    req.isAdmin = isAdmin;
    next();
  } catch (err) {
    console.error('[Auth] DB upsert error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' });
  }
}

/** ใช้ต่อจาก requireAuth — อนุญาตเฉพาะผู้บริหาร/admin */
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, message: 'เฉพาะผู้บริหารเท่านั้นที่มีสิทธิ์ดำเนินการนี้' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
