// backend/routes/questionRoutes.js
const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { requireAdmin } = require("../middleware/auth");

router.get("/", questionController.getAllQuestions);
router.get("/:id", questionController.getQuestionById);
router.post("/", requireAdmin, questionController.createQuestion);
router.put("/:id", requireAdmin, questionController.updateQuestion);
router.delete("/:id", requireAdmin, questionController.deleteQuestion);

module.exports = router;
