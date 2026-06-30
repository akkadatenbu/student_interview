// backend/routes/interviewerRoutes.js
const express = require("express");
const router = express.Router();
const interviewerController = require("../controllers/interviewerController");
const { getInterviewerCSVHeaders, importInterviewers } = require("../controllers/importController");
const upload = require("../utils/upload");
const { requireAdmin } = require("../middleware/auth");

// จัดการรายชื่อผู้สัมภาษณ์ (รวมผูก email กับ NBU SSO) — ผู้บริหารเท่านั้น
router.post("/import/headers", requireAdmin, upload.single("file"), getInterviewerCSVHeaders);
router.post("/import", requireAdmin, upload.single("file"), importInterviewers);

router.get("/", interviewerController.getAllInterviewers);
router.get("/:id", interviewerController.getInterviewerById);
router.post("/", requireAdmin, interviewerController.createInterviewer);
router.put("/:id", requireAdmin, interviewerController.updateInterviewer);
router.delete("/:id", requireAdmin, interviewerController.deleteInterviewer);

module.exports = router;
