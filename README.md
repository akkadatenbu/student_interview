# ระบบสัมภาษณ์นักศึกษา

ระบบสัมภาษณ์นักศึกษาสำหรับเก็บข้อมูลในการดูแลและช่วยเหลือนักศึกษาชั้นปีที่ 1 ทุกคณะและสาขาวิชา

## คุณสมบัติ

- สัมภาษณ์นักศึกษาชั้นปีที่ 1 ทุกคณะและสาขาวิชา
- เก็บข้อมูลคำถาม 18 ข้อ พร้อมเงื่อนไขการแสดงคำถาม
- รายงานสถิติ จำนวนนักศึกษาที่ตอบแบบสอบถาม และยังไม่ตอบ
- ดูรายชื่อผู้ยังไม่ตอบแบบสัมภาษณ์ได้
- ส่งออกข้อมูลการสัมภาษณ์ทั้งหมดเป็น Excel (.xlsx)

## สถาปัตยกรรมระบบ

- **Frontend**: React (Next.js) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## โครงสร้างโปรเจค

```
student-interview-app/
│
├── backend/                # Node.js + Express API
│   ├── config/             # คอนฟิก
│   │   └── db.js           # การเชื่อมต่อฐานข้อมูล
│   ├── controllers/        # ตัวควบคุม API
│   │   ├── interviewerController.js
│   │   ├── studentController.js
│   │   ├── questionController.js
│   │   └── interviewController.js
│   ├── models/             # โมเดลฐานข้อมูล
│   │   ├── interviewer.js
│   │   ├── student.js
│   │   ├── question.js
│   │   └── interview.js
│   ├── routes/             # เส้นทาง API
│   │   ├── interviewerRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── questionRoutes.js
│   │   └── interviewRoutes.js
│   ├── utils/              # เครื่องมือและฟังก์ชันช่วยเหลือ
│   │   ├── excelExport.js  # การส่งออกข้อมูลเป็น Excel
│   │   └── dbHelpers.js    # ฟังก์ชันช่วยเหลือฐานข้อมูล
│   ├── .env                # ตัวแปรสภาพแวดล้อม
│   ├── server.js           # ไฟล์หลัก
│   ├── package.json
│   └── seeds/              # ข้อมูลเริ่มต้น
│       ├── seedInterviewers.js
│       ├── seedStudents.js
│       └── seedQuestions.js
│
├── frontend/               # React (Next.js) Application
│   ├── public/             # ไฟล์สาธารณะ
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx    # หน้าหลัก
│   │   │   ├── interview/  # หน้าสัมภาษณ์
│   │   │   │   └── page.jsx
│   │   │   ├── reports/    # หน้ารายงาน
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx  # เลย์เอาท์แอพ
│   │   ├── components/     # คอมโพเนนท์
│   │   │   ├── InterviewerSelect.jsx
│   │   │   ├── StudentSearch.jsx
│   │   │   ├── QuestionForm.jsx
│   │   │   ├── InterviewReport.jsx
│   │   │   └── ExportButton.jsx
│   │   ├── contexts/       # contexts สำหรับการจัดการสถานะ
│   │   │   └── InterviewContext.jsx
│   │   ├── hooks/          # ฮุค
│   │   │   └── useInterview.js
│   │   └── services/       # บริการเชื่อมต่อ API
│   │       ├── api.js      # ตัวจัดการ API
│   │       ├── interviewerService.js
│   │       ├── studentService.js
│   │       ├── questionService.js
│   │       └── interviewService.js
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
├── docker-compose.yml      # ติดตั้ง PostgreSQL และแอพพลิเคชัน
├── README.md               # คำแนะนำการใช้งานและติดตั้ง
└── .gitignore              # ไฟล์ที่ไม่ต้องการใน git

student-interview-app/
│
├── backend/                # Node.js + Express API
│   ├── config/             # คอนฟิก
│   ├── controllers/        # ตัวควบคุม API
│   ├── models/             # โมเดลฐานข้อมูล
│   ├── routes/             # เส้นทาง API
│   ├── utils/              # เครื่องมือและฟังก์ชันช่วยเหลือ
│   ├── seeds/              # ข้อมูลเริ่มต้น
│   └── server.js           # ไฟล์หลัก
│
├── frontend/               # React (Next.js) Application
│   ├── public/             # ไฟล์สาธารณะ
│   └── src/                # แอปพลิเคชัน React
│
├── data/                   # ไฟล์ข้อมูล CSV
│   ├── interviewer.csv
│   ├── student.csv
│   └── question.csv
│
├── docker-compose.yml      # ติดตั้ง PostgreSQL และแอพพลิเคชัน
└── README.md               # คำแนะนำการใช้งานและติดตั้ง
```

## การติดตั้ง

### ข้อกำหนดเบื้องต้น

- Node.js (v14+)
- npm หรือ yarn
- PostgreSQL (v12+)
- Docker และ Docker Compose (สำหรับการติดตั้งด้วย Docker)

### วิธีติดตั้ง (ด้วย Docker)

1. Clone โปรเจค

```bash
git clone https://github.com/yourusername/student-interview-app.git
cd student-interview-app
```

2. สร้างโฟลเดอร์ data และวางไฟล์ CSV ที่เตรียมไว้

```bash
mkdir -p data
# วางไฟล์ interviewer.csv, student.csv และ question.csv ในโฟลเดอร์ data
```

3. สร้างและเริ่มต้นคอนเทนเนอร์

```bash
docker-compose up -d
```

4. เข้าสู่เบราว์เซอร์ที่ http://localhost:3000

### วิธีติดตั้ง (แบบ Manual)

1. Clone โปรเจค

```bash
git clone https://github.com/yourusername/student-interview-app.git
cd student-interview-app
```

2. ตั้งค่าฐานข้อมูล PostgreSQL

```bash
# สร้างฐานข้อมูล
createdb student_interview

# นำเข้าโครงสร้างฐานข้อมูล
psql -d student_interview -f backend/database.sql
```

3. ติดตั้ง Backend

```bash
cd backend
npm install

# สร้างไฟล์ .env (ดูตัวอย่างจาก .env.example)
cp .env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ

# นำเข้าข้อมูลเริ่มต้น
npm run seed

# เริ่มต้น server
npm start
```

4. ติดตั้ง Frontend

```bash
cd ../frontend
npm install

# สร้างไฟล์ .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# สร้าง production build
npm run build

# เริ่มต้น server
npm start
```

5. เข้าสู่เบราว์เซอร์ที่ http://localhost:3000

## การใช้งาน

### 1. การสัมภาษณ์

1. เลือกผู้สัมภาษณ์โดยกรอกรหัสหรือเลือกจากรายการ
2. ค้นหานักศึกษาที่ต้องการสัมภาษณ์โดยกรอกรหัสนักศึกษา
3. กรอกข้อมูลในแบบสัมภาษณ์ให้ครบทุกข้อ
4. กดปุ่ม "บันทึกการสัมภาษณ์" เพื่อบันทึกข้อมูล

### 2. การดูรายงาน

1. ไปที่หน้ารายงาน
2. ดูสถิติการสัมภาษณ์ตามคณะและหลักสูตร
3. ดูรายชื่อนักศึกษาที่ยังไม่ได้รับการสัมภาษณ์ (สามารถกรองตามคณะได้)
4. กดปุ่ม "ส่งออกข้อมูลเป็น Excel" เพื่อดาวน์โหลดข้อมูลทั้งหมด

## ความปลอดภัยของข้อมูล

- ข้อมูลส่วนบุคคลของนักศึกษาถูกจัดเก็บในฐานข้อมูลที่มีการรักษาความปลอดภัย
- การเข้าถึงระบบควรทำผ่านเครือข่ายที่ปลอดภัยเท่านั้น
- ข้อมูลที่ส่งออกต้องได้รับการจัดการอย่างเหมาะสมตามนโยบายความเป็นส่วนตัวของสถาบัน

## การพัฒนาต่อไป

หากต้องการพัฒนาหรือปรับปรุงระบบเพิ่มเติม:

1. เปิดการพัฒนา Frontend

```bash
cd frontend
npm run dev
```

2. เปิดการพัฒนา Backend

```bash
cd backend
npm run dev
```

## การแก้ไขปัญหา

- **ปัญหาการเชื่อมต่อฐานข้อมูล** - ตรวจสอบการตั้งค่าในไฟล์ .env
- **ปัญหาการนำเข้าข้อมูล CSV** - ตรวจสอบรูปแบบและการเข้ารหัสของไฟล์ CSV (ควรเป็น UTF-8)
- **การแสดงผลไม่ถูกต้อง** - ล้างแคชของเบราว์เซอร์และรีเฟรชหน้า
