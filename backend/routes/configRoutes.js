const express = require('express');
const router = express.Router();
const { getConfig, saveConfig } = require('../controllers/configController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', getConfig);
router.post('/', requireAdmin, saveConfig);

module.exports = router;
