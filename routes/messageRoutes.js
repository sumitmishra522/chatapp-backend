const express = require('express');
const router = express.Router();
const VerifyToken = require('../middleware/auth.middleware');
const { GetMessages, SendMessage, GetConversations } = require('../controller/messageController');

router.use(VerifyToken);
router.get('/conversations', GetConversations);
router.get('/:userId', GetMessages);
router.post('/:userId', SendMessage);
module.exports = router;
