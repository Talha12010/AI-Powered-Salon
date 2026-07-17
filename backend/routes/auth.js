const express = require('express');
const router = express.Router();
const { sendJson } = require('../controllers/index');

router.get('/health', (req, res) => {
  sendJson(res, 200, { ok: true });
});

module.exports = router;
