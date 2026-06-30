// frontend/src/services/authService.js
import { api } from './api';

export const authService = {
  // ตรวจ token + ดึงข้อมูลผู้สัมภาษณ์ที่จับคู่ไว้ใน DB ด้วย email
  getMe: () => api.get('auth/me'),
};
