const express = require('express');
const router = express.Router();
const { analyzeInterview, getCohortStats, getCohortAISummary } = require('../controllers/aiController');

router.post('/analyze/:interview_id', analyzeInterview);
router.get('/cohort-stats', getCohortStats);
router.post('/cohort-summary', getCohortAISummary);

module.exports = router;
