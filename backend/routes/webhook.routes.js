const express = require('express');
const { handleWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

router.post('/clerk', handleWebhook);

module.exports = router;
