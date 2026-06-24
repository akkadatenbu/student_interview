const express = require('express');
const router = express.Router();
const { analyzeInterview } = require('../controllers/aiController');

router.post('/analyze/:interview_id', analyzeInterview);

module.exports = router;
