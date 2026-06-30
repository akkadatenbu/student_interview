// frontend/src/lib/sso.js
// เชื่อมต่อ NBU SSO — auto-redirect pattern (ดู docs/1_SSO_STARTER.md ของโปรเจกต์ nbu-sso)
'use client';

const SSO_URL      = process.env.NEXT_PUBLIC_SSO_URL || 'https://sso.northbkk.ac.th';
const APP_ID        = process.env.NEXT_PUBLIC_SSO_APP_ID || 'student-interview';
const TOKEN_KEY      = 'nbu_si_token';
const LOGOUT_FLAG     = 'nbu_si_logged_out';

export function loginWithSSO() {
  const redirect = encodeURIComponent(window.location.origin + '/auth/callback');
  window.location.href = `${SSO_URL}/login?app_id=${APP_ID}&redirect_uri=${redirect}`;
}

// ⚠️ ต้องใช้ TextDecoder ไม่ใช่ atob() ตรงๆ — กัน allowed_dept_name/ชื่อภาษาไทยเพี้ยน
export function decodeToken(token) {
  try {
    const b64    = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
  } catch {
    return null;
  }
}

export function isExpired(token) {
  const p = decodeToken(token);
  return !p || Date.now() >= p.exp * 1000;
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  const t = sessionStorage.getItem(TOKEN_KEY);
  if (!t || isExpired(t)) {
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return t;
}

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem(LOGOUT_FLAG); // ได้ token ใหม่ → ล้าง flag เสมอ
}

export function isLoggedOut() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(LOGOUT_FLAG) === '1';
}

// logout ต้องตั้ง flag ป้องกัน auto-redirect วนซ้ำ (Google session ยังอยู่)
export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.setItem(LOGOUT_FLAG, '1');
}

export function relogin() {
  sessionStorage.removeItem(LOGOUT_FLAG);
  loginWithSSO();
}
