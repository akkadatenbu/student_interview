// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { getStudentCSVHeaders, importStudents } = require("../controllers/importController");
const upload = require("../utils/upload");

// Import routes (ต้องอยู่ก่อน /:id)
router.post("/import/headers", upload.single("file"), getStudentCSVHeaders);
router.post("/import", upload.single("file"), importStudents);

router.get("/", studentController.getAllStudents);
router.get("/faculty/:faculty", studentController.getStudentsByFaculty);
router.get("/program/:program", studentController.getStudentsByProgram);
router.get("/academic-years", studentController.getAcademicYears);
router.get("/not-interviewed", studentController.getNotInterviewedStudents);
router.get("/summary", studentController.getInterviewStatusSummary);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
