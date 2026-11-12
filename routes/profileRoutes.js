const express = require('express');
const router = express.Router();
const VerifyToken = require('../middleware/auth.middleware');

router.get('/profile', VerifyToken, (req, res) => {
  res.status(200).json({ message: 'Profile fetched successfully', user: req.user });
});
module.exports = router;
