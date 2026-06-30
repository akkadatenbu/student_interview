# เชื่อมระบบสัมภาษณ์นักศึกษากับ NBU SSO (Option B — Centralized Scope)

> อัปเดต: 2026-06-30 — Pilot Project
> Login จริงผ่าน NBU SSO (Google Workspace) + **คณะ/สิทธิ์ผู้บริหารมาจาก NBU SSO โดยตรง**
> (ไม่ใช้ตาราง `interviewer.staff_faculty` ที่ import เองอีกต่อไป)

---

## สรุปสถาปัตยกรรม

```
NBU SSO เป็น Single Source of Truth ทั้ง 2 แกน:

  Role Axis  (permission.role)
    role = 'ADMIN'           → เห็น/จัดการได้ทุกคณะ (ผู้บริหาร)
    role อื่นๆ (LECTURER ฯลฯ) → เห็นเฉพาะคณะตัวเอง

  Scope Axis (permission.allowed_dept_name)
    ใช้เป็น "คณะ" ของผู้สัมภาษณ์โดยตรง — ต้องตรงกับค่าใน student.faculty เป๊ะ
```

**ไม่ต้อง import CSV ผูก email ล่วงหน้าอีกแล้ว** — ระบบสร้าง record ผู้สัมภาษณ์ในตาราง `interviewer`
ให้อัตโนมัติทุกครั้งที่ login (ใช้ชื่อ/คณะล่าสุดจาก SSO เสมอ) ตาราง `interviewer` ตอนนี้ทำหน้าที่แค่
เป็น FK anchor ให้ `interview.interviewer_id` เท่านั้น ไม่ใช่แหล่งสิทธิ์อีกต่อไป

**App Secret ที่ได้จาก Admin Dashboard ไม่ได้ใช้ในระบบนี้** — เก็บไว้เผื่ออนาคต (ใช้เมื่อทำ
server-to-server auth) การ verify JWT ใช้ RSA Public Key (`/api/v1/public-key`) เท่านั้น

---

## 1. สิ่งที่ต้องเตรียมใน NBU SSO (ทำผ่าน Admin Dashboard `/admin`)

```
✅ ลงทะเบียนแอป "student-interview" — ทำแล้ว (ได้ app_secret มาแล้ว)
✅ เพิ่มคณะทั้งหมดใน Departments — ทำแล้ว
⬜ ให้สิทธิ์ผู้สัมภาษณ์แต่ละคน (สำคัญที่สุด — ต้องระบุ Scope ให้ตรงคณะจริง)
```

### ให้สิทธิ์ผู้สัมภาษณ์ทีละคน — ผ่าน `/admin/users`

```
ค้นหา user (email) → เพิ่มสิทธิ์
  App:   student-interview
  Role:  LECTURER (หรือ role อื่นที่ไม่ใช่ ADMIN — สำหรับผู้สัมภาษณ์ทั่วไป)
  Scope: เลือกคณะที่ผู้สัมภาษณ์คนนั้นสังกัด (ต้องตรงกับ student.faculty เป๊ะ)
```

### ให้สิทธิ์ผู้บริหาร (เห็นทุกคณะ)

```
Role:  ADMIN
Scope: เลือกอะไรก็ได้ (ใช้แค่ role=ADMIN ตัดสินก็พอ)
```

⚠️ **จุดสำคัญที่สุด**: ชื่อคณะใน NBU SSO Departments (`dept_name`) **ต้องตรงกับ**
ข้อความใน `student.faculty` ของระบบนี้แบบเป๊ะๆ (ตัวอักษร ช่องว่าง ทุกอย่าง) ไม่งั้น
filter จะกรองไม่เจอข้อมูลเลย (ไม่ error แต่ได้ list ว่างเปล่า) — **ต้องทดสอบจุดนี้ก่อนปล่อยใช้จริง**

---

## 2. Environment Variables

### Backend (`backend/.env`) — เพิ่มแล้ว
```env
SSO_URL=https://sso.northbkk.ac.th
SSO_APP_ID=student-interview
```

### Frontend (`frontend/.env.local`) — สร้างใหม่แล้ว
```env
NEXT_PUBLIC_SSO_URL=https://sso.northbkk.ac.th
NEXT_PUBLIC_SSO_APP_ID=student-interview
```

---

## 3. สิ่งที่เปลี่ยนในโค้ด (สรุป)

| ไฟล์ | เปลี่ยนอะไร |
|------|-------------|
| `backend/middleware/auth.js` | Verify JWT → **auto-upsert interviewer ด้วยข้อมูลจาก SSO ทุก login** (ไม่ reject ถ้าไม่เคยมี record) |
| `backend/migrations/add_interviewer_staff_id_seq.js` | **ใหม่** — sequence สร้าง `staff_id` ให้ record ที่เกิดจาก SSO (เริ่มที่ 9000001 กันชนรหัสพนักงานจริงที่ import จาก CSV) |
| `backend/migrations/add_interviewer_email.js` | เพิ่มคอลัมน์ `interviewer.email` (ใช้จับคู่ record ตอน upsert) |
| `backend/routes/authRoutes.js` | `GET /api/auth/me` — คืนข้อมูลที่ auto-upsert ไว้ |
| `backend/server.js` | ทุก `/api/*` ต้องผ่าน `requireAuth` |
| `backend/controllers/studentController.js`, `interviewController.js` | กรองข้อมูลด้วย `req.interviewer.staff_faculty` (ค่านี้ sync จาก SSO ทุก login แล้ว — controller เดิมไม่ต้องแก้เพิ่ม) ยกเว้น `req.isAdmin` ที่อ่านจาก `permission.role`/`scope_level` |
| `backend/controllers/interviewController.js` (`createInterview`) | บังคับ `interviewer_id` จาก `req.interviewer.staff_id` (auto-upsert แล้ว) ไม่รับจาก client |
| `frontend/src/lib/sso.js` | Auto-redirect login, logout flag, UTF-8-safe decode |
| `frontend/src/components/InterviewerImport.jsx` | คอลัมน์ `email` กลายเป็น **ไม่บังคับ** (ใช้เผื่อ import ข้อมูลเก่าเป็นชุดเท่านั้น ไม่ใช่ gate การ login อีกต่อไป) |

---

## 4. Checklist ทดสอบก่อนใช้งานจริง

```
□ 1. รัน backend → เช็ค log "Created interviewer_staff_id_seq"
□ 2. ให้สิทธิ์ตัวเอง (role=ADMIN) ผ่าน /admin/users สำหรับ app student-interview
□ 3. เปิดหน้าเว็บ → auto-redirect ไป Google Login ทันที
□ 4. Login ครั้งแรก → ต้องเข้าระบบได้เลย (ไม่มี error "ยังไม่ได้ลงทะเบียน" อีกแล้ว)
□ 5. เช็คในตาราง interviewer (Supabase/DB) → ต้องมี record ใหม่ staff_id เริ่มจาก 9000001
□ 6. ทดสอบสิทธิ์ผู้สัมภาษณ์ทั่วไป (role≠ADMIN) → เห็นเฉพาะคณะตัวเองตาม Scope ที่ตั้งไว้
     ⚠️ ถ้าเห็น list ว่างเปล่าทั้งที่มีนักศึกษาในคณะนั้น → แปลว่าชื่อคณะใน SSO
        ไม่ตรงกับ student.faculty เป๊ะ ต้องแก้ dept_name ใน SSO ให้ตรง
□ 7. ทดสอบ role=ADMIN → ต้องเห็นทุกคณะ
□ 8. ลองเรียก API ดูข้อมูลคณะอื่นตรงๆ (ไม่ใช่ admin) → ต้องได้ 403
□ 9. ทดสอบบันทึกสัมภาษณ์ 1 รายการ → เช็คว่า interviewer_id ตรงกับคนที่ login จริง
□ 10. กด "ออกจากระบบ" → ต้องเห็นหน้า "ออกจากระบบแล้ว" + refresh แล้วไม่ login วนกลับ
```
