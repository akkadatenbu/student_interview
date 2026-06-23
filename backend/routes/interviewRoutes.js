// backend/routes/interviewRoutes.js
const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");

router.get("/", interviewController.getAllInterviews);
router.get("/export", interviewController.exportInterviewsToExcel);
router.get("/:id", interviewController.getInterviewById);
router.get("/student/:studentId", interviewController.getInterviewByStudentId);
router.post("/", interviewController.createInterview);
router.put("/:id", interviewController.updateInterviewAnswers);
router.delete("/:id", interviewController.deleteInterview);

module.exports = router;
