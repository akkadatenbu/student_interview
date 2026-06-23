// backend/routes/interviewerRoutes.js
const express = require("express");
const router = express.Router();
const interviewerController = require("../controllers/interviewerController");
const { getInterviewerCSVHeaders, importInterviewers } = require("../controllers/importController");
const upload = require("../utils/upload");

// Import routes (ต้องอยู่ก่อน /:id)
router.post("/import/headers", upload.single("file"), getInterviewerCSVHeaders);
router.post("/import", upload.single("file"), importInterviewers);

router.get("/", interviewerController.getAllInterviewers);
router.get("/:id", interviewerController.getInterviewerById);
router.post("/", interviewerController.createInterviewer);
router.put("/:id", interviewerController.updateInterviewer);
router.delete("/:id", interviewerController.deleteInterviewer);

module.exports = router;
