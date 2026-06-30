// backend/routes/interviewRoutes.js
const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", interviewController.getAllInterviews);
router.get("/export", interviewController.exportInterviewsToExcel);
router.get("/:id", interviewController.getInterviewById);
router.get("/student/:studentId", interviewController.getInterviewByStudentId);
router.post("/", interviewController.createInterview);
router.put("/:id", interviewController.updateInterviewAnswers);
// ลบข้อมูลสัมภาษณ์ — ผู้บริหารเท่านั้น (เป็น destructive operation)
router.delete("/:id", requireAdmin, interviewController.deleteInterview);

module.exports = router;
