const express = require('express');
const router = express.Router();
const { FindUser } = require('../controller/loginController');
router.post('/login', FindUser);
module.exports = router;
