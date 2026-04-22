const express = require('express');
const { assignTAs } = require('../controllers/assignController');

const router = express.Router();

router.post('/', assignTAs);

module.exports = router;
