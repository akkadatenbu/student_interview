// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { getStudentCSVHeaders, importStudents } = require("../controllers/importController");
const upload = require("../utils/upload");
const { requireAdmin } = require("../middleware/auth");

// Import routes (ต้องอยู่ก่อน /:id) — ผู้บริหารเท่านั้น
router.post("/import/headers", requireAdmin, upload.single("file"), getStudentCSVHeaders);
router.post("/import", requireAdmin, upload.single("file"), importStudents);

// ดูข้อมูล — ทุกคนที่ login ได้ แต่ filter ตามคณะที่ middleware/controller บังคับ
router.get("/", studentController.getAllStudents);
router.get("/faculty/:faculty", studentController.getStudentsByFaculty);
router.get("/program/:program", studentController.getStudentsByProgram);
router.get("/academic-years", studentController.getAcademicYears);
router.get("/not-interviewed", studentController.getNotInterviewedStudents);
router.get("/summary", studentController.getInterviewStatusSummary);
router.get("/:id", studentController.getStudentById);

// แก้ไขข้อมูลนักศึกษา — ผู้บริหารเท่านั้น
router.post("/", requireAdmin, studentController.createStudent);
router.put("/:id", requireAdmin, studentController.updateStudent);
router.delete("/:id", requireAdmin, studentController.deleteStudent);

module.exports = router;
