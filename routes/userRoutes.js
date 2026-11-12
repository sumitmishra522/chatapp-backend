const express = require('express');
const router = express.Router();
const uploadImage = require('../middleware/upload');
const VerifyToken = require('../middleware/auth.middleware');
const { CreateUser, GetUsers } = require('../controller/userController');

router.post('/create-profile', uploadImage.single('profilePic'), CreateUser);
router.get('/users', VerifyToken, GetUsers);
module.exports = router;
