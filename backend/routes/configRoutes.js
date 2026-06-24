const express = require('express');
const router = express.Router();
const { getConfig, saveConfig } = require('../controllers/configController');

router.get('/', getConfig);
router.post('/', saveConfig);

module.exports = router;
